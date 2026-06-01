import { useRef, useEffect, useCallback } from 'react';
import { useAsciiRenderer, type RendererSettings } from '@/hooks/useAsciiRenderer';

interface AsciiCanvasProps {
  videoEl: HTMLVideoElement | null;
  maskCanvas: HTMLCanvasElement | null;
  settings: RendererSettings;
  onSegmentFrame: (v: HTMLVideoElement) => void;
  onStatsUpdate?: (fps: number, cols: number, rows: number) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;   
  isRecording?: boolean;
}

export default function AsciiCanvas({
  videoEl,
  maskCanvas,
  settings,
  onSegmentFrame,
  onStatsUpdate,
  canvasRef: externalCanvasRef,
  isRecording = false, 
}: AsciiCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  const recordingRef = useRef<boolean>(isRecording);
  useEffect(() => {
    recordingRef.current = isRecording;
  }, [isRecording]);

  const { startLoop, stopLoop, stats } = useAsciiRenderer(canvasRef, settings, recordingRef);

  useEffect(() => {
    maskRef.current = maskCanvas;
  }, [maskCanvas]);

  useEffect(() => {
    onStatsUpdate?.(stats.fps, stats.cols, stats.rows);
  }, [stats, onStatsUpdate]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    }
  }, [canvasRef]);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    if (!videoEl) return;
    const getMask = () => maskRef.current;
    startLoop(videoEl, getMask, onSegmentFrame);
    return () => stopLoop();
  }, [videoEl, startLoop, stopLoop, onSegmentFrame]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#000' }}
    >
      <canvas
        ref={canvasRef}
        id="ascii-canvas"
        className="absolute inset-0 w-full h-full block"
        style={{ background: settings.bgColor }}
      />
    </div>
  );
}