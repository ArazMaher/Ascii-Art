import { useRef, useCallback, useEffect, useState } from 'react';
import { CHAR_SETS, luma, formatLuminance, brightnessToChar, calculateEdge } from '@/utils/ascii';
import type { CharSet, ColorMode, RenderStyle } from '@/utils/ascii';

export interface RendererSettings {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: ColorMode;
  customColor: string;
  charSet: CharSet;
  bgColor: string;
  renderStyle: RenderStyle;
  edgeEnhancement: number;
  lumaThreshold: number;
  bgMode: 'solid' | 'matrix';
  matrixBgColor: string;
  matrixCharSet: CharSet;
  matrixSpeed: number;
}

export interface RendererStats {
  fps: number;
  cols: number;
  rows: number;
}

function pseudoRandom(seed: number): number {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const CUSTOM_LUMA_STEPS = 16;
const COLOR_RGB_STEPS = 6;
const SEGMENTATION_SKIP_FRAMES = 3;

export function useAsciiRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  settings: RendererSettings,
  recordingRef?: React.MutableRefObject<boolean>
) {
  const rafRef = useRef<number>(0);
  const lastStatsUpdateRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);
  const [stats, setStats] = useState<RendererStats>({ fps: 0, cols: 0, rows: 0 });

  const offscreenVideoRef = useRef<{ canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } | null>(null);
  const offscreenMaskRef = useRef<{ canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } | null>(null);
  const maskPixelsRef = useRef<Uint8ClampedArray | null>(null);

  const frameCountRef = useRef<number>(0);
  const charWidthCacheRef = useRef<number>(0);

  const customColorMapCache = useRef<{ key: string; map: string[] }>({ key: '', map: [] });
  const matrixColorMapCache = useRef<{ key: string; map: string[] }>({ key: '', map: [] });

  useEffect(() => {
    charWidthCacheRef.current = 0;
  }, [settings.fontSize, settings.renderStyle]);

  const getCustomColorMap = useCallback((s: RendererSettings): string[] => {
    const key = `${s.customColor}-${CUSTOM_LUMA_STEPS}`;
    if (customColorMapCache.current.key === key) return customColorMapCache.current.map;
    const hex = s.customColor.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 65;
    const map: string[] = [];
    for (let i = 0; i <= CUSTOM_LUMA_STEPS; i++) {
      const l = i / CUSTOM_LUMA_STEPS;
      if (l > 0.8) map[i] = s.customColor;
      else map[i] = `rgb(${Math.floor(r * l)}, ${Math.floor(g * l)}, ${Math.floor(b * l)})`;
    }
    customColorMapCache.current = { key, map };
    return map;
  }, []);

  const getMatrixColorMap = useCallback((s: RendererSettings): string[] => {
    const key = s.matrixBgColor;
    if (matrixColorMapCache.current.key === key) return matrixColorMapCache.current.map;
    const hex = s.matrixBgColor.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 65;
    const map: string[] = [];
    for (let i = 0; i <= 255; i++) {
      const l = i / 255;
      map[i] = `rgb(${Math.floor(r * l)}, ${Math.floor(g * l)}, ${Math.floor(b * l)})`;
    }
    matrixColorMapCache.current = { key, map };
    return map;
  }, []);

  const drawRecordingOverlays = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < ch; y += 4) {
      ctx.fillRect(0, y, cw, 2);
    }

    // CRT Vignette
    const gradient = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.5, cw / 2, ch / 2, Math.min(cw, ch) * 0.85);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cw, ch);

    // Dot grid 
    ctx.fillStyle = 'rgba(0, 255, 65, 0.03)';
    const spacing = 20;
    for (let x = 0; x < cw; x += spacing) {
      for (let y = 0; y < ch; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const renderFrame = useCallback(
    (videoEl: HTMLVideoElement, maskCanvas: HTMLCanvasElement | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !videoEl || videoEl.readyState < 2) return;
      const s = settings;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const charH = Math.floor(s.fontSize);
      ctx.font = `${charH}px "JetBrains Mono", "Courier New", monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      if (s.renderStyle === 'pixel') {
        charWidthCacheRef.current = charH;
      } else if (!charWidthCacheRef.current) {
        charWidthCacheRef.current = ctx.measureText('M').width;
      }
      const charW = Math.max(1, charWidthCacheRef.current);

      const cols = Math.floor(cw / charW);
      const rows = Math.floor(ch / charH);
      if (cols < 1 || rows < 1) return;

      // --- offscreen video ---
      if (!offscreenVideoRef.current || offscreenVideoRef.current.canvas.width !== cols || offscreenVideoRef.current.canvas.height !== rows) {
        const offCanvas = new OffscreenCanvas(cols, rows);
        offscreenVideoRef.current = { canvas: offCanvas, ctx: offCanvas.getContext('2d', { willReadFrequently: true })! };
      }
      const videoCtx = offscreenVideoRef.current.ctx;
      videoCtx.setTransform(-1, 0, 0, 1, cols, 0);
      videoCtx.drawImage(videoEl, 0, 0, cols, rows);
      videoCtx.setTransform(1, 0, 0, 1, 0, 0);
      const imageData = videoCtx.getImageData(0, 0, cols, rows).data;

      // --- offscreen mask ---
      let maskPixels: Uint8ClampedArray | null = null;
      if (maskCanvas && maskCanvas.width > 0 && maskCanvas.height > 0) {
        if (!offscreenMaskRef.current || offscreenMaskRef.current.canvas.width !== cols || offscreenMaskRef.current.canvas.height !== rows) {
          const offCanvas = new OffscreenCanvas(cols, rows);
          offscreenMaskRef.current = { canvas: offCanvas, ctx: offCanvas.getContext('2d', { willReadFrequently: true })! };
        }
        const maskCtx = offscreenMaskRef.current.ctx;
        maskCtx.imageSmoothingEnabled = true;
        maskCtx.clearRect(0, 0, cols, rows);
        maskCtx.setTransform(-1, 0, 0, 1, cols, 0);
        maskCtx.drawImage(maskCanvas, 0, 0, cols, rows);
        maskCtx.setTransform(1, 0, 0, 1, 0, 0);

        if (!maskPixelsRef.current || maskPixelsRef.current.length !== cols * rows) {
          maskPixelsRef.current = new Uint8ClampedArray(cols * rows);
        }
        const mp = maskCtx.getImageData(0, 0, cols, rows).data;
        const dest = maskPixelsRef.current;
        for (let i = 0; i < cols * rows; i++) {
          dest[i] = mp[i * 4];
        }
        maskPixels = dest;
      }

      // --- background ---
      ctx.clearRect(0, 0, cw, ch);
      if (s.bgMode === 'solid') {
        ctx.fillStyle = s.bgColor;
        ctx.fillRect(0, 0, cw, ch);
      } else if (s.bgMode === 'matrix') {
        ctx.fillStyle = s.bgColor;
        ctx.fillRect(0, 0, cw, ch);

        const rainFontSize = Math.max(charH, 12);
        ctx.font = `${rainFontSize}px "JetBrains Mono", "Courier New", monospace`;
        const rainCharW = ctx.measureText('M').width;
        const rainCols = Math.floor(cw / rainCharW);
        const rainRows = Math.floor(ch / rainFontSize);

        const matrixChars = CHAR_SETS[s.matrixCharSet];
        const isCustom = s.colorMode === 'custom';
        const matrixColorMap = isCustom ? getMatrixColorMap(s) : [];
        const frame = frameCountRef.current;

        let lastStyle = '';
        for (let col = 0; col < rainCols; col++) {
          const seed = col * 1000;
          const speed = 0.2 + pseudoRandom(seed + 1) * 0.3;
          const tailLength = 7 + Math.floor(pseudoRandom(seed + 2) * 16);
          const headRow = Math.floor(frame * s.matrixSpeed * speed) % (rainRows + tailLength);

          for (let d = 0; d < tailLength; d++) {
            const row = headRow - d;
            if (row < 0 || row >= rainRows) continue;
            if (maskPixels) {
              const origCol = Math.floor(col * rainCharW / charW);
              const origRow = Math.floor(row * rainFontSize / charH);
              if (origCol < cols && origRow < rows) {
                const cellIdx = origRow * cols + origCol;
                if (maskPixels[cellIdx] > 25) continue;
              }
            }
            const brightnessVal = 1.0 - (d / tailLength);
            const charIdx = Math.floor(pseudoRandom(col * 1000 + row) * matrixChars.length);
            const ch = matrixChars[charIdx];
            if (ch === ' ') continue;

            let style: string;
            if (isCustom) {
              style = matrixColorMap[Math.floor(brightnessVal * 255)];
            } else {
              style = s.matrixBgColor;
            }
            if (style !== lastStyle) {
              ctx.fillStyle = style;
              lastStyle = style;
            }
            ctx.fillText(ch, col * rainCharW, row * rainFontSize);
          }
        }
        ctx.font = `${charH}px "JetBrains Mono", "Courier New", monospace`;
      }

      // --- Subject Render ---
      const chars = CHAR_SETS[s.charSet];
      const customColorMap = s.colorMode === 'custom' ? getCustomColorMap(s) : [];
      const { contrast, brightness: brightAdj, edgeEnhancement, lumaThreshold } = s;

      for (let row = 0; row < rows; row++) {
        const topY = row * charH;
        let segmentStart = 0;
        let segmentText = '';
        let currentStyle = '';

        const flushSegment = (endCol: number) => {
          if (segmentText.length > 0) {
            ctx.fillStyle = currentStyle || s.bgColor;
            ctx.fillText(segmentText, segmentStart * charW, topY);
            segmentText = '';
          }
          segmentStart = endCol;
        };

        for (let col = 0; col < cols; col++) {
          const cellIdx = row * cols + col;
          const imgIdx = cellIdx * 4;
          const r = imageData[imgIdx];
          const g = imageData[imgIdx + 1];
          const b = imageData[imgIdx + 2];
          const rawLuma = luma(r, g, b) / 255;

          if (maskPixels) {
            const alpha = maskPixels[cellIdx] / 255.0;
            if (alpha < 0.1) {
              flushSegment(col);
              continue;
            }
            if (rawLuma < lumaThreshold && alpha < 0.5) {
              flushSegment(col);
              continue;
            }
          }

          let normalizedLuma = formatLuminance(rawLuma * 255, contrast, brightAdj);

          if (edgeEnhancement > 0 && row > 0 && row < rows - 1 && col > 0 && col < cols - 1) {
            const edgeIntensity = calculateEdge(imgIdx, cols, imageData);
            if (edgeIntensity > 15) {
              normalizedLuma += (edgeIntensity / 255) * edgeEnhancement;
              normalizedLuma = Math.min(1, Math.max(0, normalizedLuma));
            }
          }

          let style = '';
          let ch = ' ';
          if (s.renderStyle === 'ascii') {
            ch = brightnessToChar(normalizedLuma, chars);
            if (ch === ' ') {
              flushSegment(col);
              continue;
            }
            if (s.colorMode === 'custom') {
              const stepIdx = Math.round(normalizedLuma * CUSTOM_LUMA_STEPS);
              style = customColorMap[stepIdx];
            } else if (s.colorMode === 'color') {
              const levels = COLOR_RGB_STEPS;
              const r2 = Math.round((r / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              const g2 = Math.round((g / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              const b2 = Math.round((b / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              style = `rgb(${r2},${g2},${b2})`;
            }
          } else {
            if (s.colorMode === 'color') {
              const levels = COLOR_RGB_STEPS;
              const r2 = Math.round((r / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              const g2 = Math.round((g / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              const b2 = Math.round((b / 255) * (levels - 1)) * Math.floor(255 / (levels - 1));
              style = `rgb(${r2},${g2},${b2})`;
            } else {
              const stepIdx = Math.round(normalizedLuma * CUSTOM_LUMA_STEPS);
              style = customColorMap[stepIdx];
            }
            ch = '█';
          }

          if (style !== currentStyle) {
            flushSegment(col);
            currentStyle = style;
          }
          segmentText += ch;
        }
        flushSegment(cols);
      }

      if (recordingRef?.current) {
        drawRecordingOverlays(ctx, cw, ch);
      }

      // FPS Report
      const now = performance.now();
      fpsCounterRef.current.push(now);
      const cutoff = now - 1000;
      let i = 0;
      while (i < fpsCounterRef.current.length && fpsCounterRef.current[i] <= cutoff) i++;
      fpsCounterRef.current.splice(0, i);
      const fps = fpsCounterRef.current.length;
      if (now - lastStatsUpdateRef.current > 300) {
        lastStatsUpdateRef.current = now;
        setStats({ fps, cols, rows });
      }

      frameCountRef.current++;
    },
    [canvasRef, settings, getCustomColorMap, getMatrixColorMap, drawRecordingOverlays]
  );

  const startLoop = useCallback(
    (videoEl: HTMLVideoElement, getMask: () => HTMLCanvasElement | null, onSegmentFrame: (v: HTMLVideoElement) => void) => {
      let skipCounter = 0;
      const loop = () => {
        if (skipCounter % (SEGMENTATION_SKIP_FRAMES + 1) === 0) {
          onSegmentFrame(videoEl);
        }
        const maskCanvas = getMask();
        renderFrame(videoEl, maskCanvas);
        rafRef.current = requestAnimationFrame(loop);
        skipCounter++;
      };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    },
    [renderFrame]
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `neural-render-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [canvasRef]);

  useEffect(() => stopLoop, [stopLoop]);

  return { startLoop, stopLoop, stats, takeScreenshot };
}