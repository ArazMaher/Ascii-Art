import { useEffect, useRef, useState, useCallback } from 'react';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

export interface SegmentationState {
  ready: boolean;
  error: string | null;
}

export function useSegmentation() {
  const [state, setState] = useState<SegmentationState>({
    ready: false,
    error: null,
  });

  const segmenterRef = useRef<ImageSegmenter | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskImageDataRef = useRef<ImageData | null>(null); 
  const isProcessingRef = useRef(false);
  const lastVideoTime = useRef(-1);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    maskCanvasRef.current = canvas;
    return () => {
      maskCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        if (cancelled) return;

        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
          },
          runningMode: 'VIDEO',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
        if (cancelled) {
          segmenter.close();
          return;
        }
        segmenterRef.current = segmenter;
        setState({ ready: true, error: null });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Neural Engine Boot Failed';
        setState({ ready: false, error: msg });
      }
    })();

    return () => {
      cancelled = true;
      if (segmenterRef.current) {
        segmenterRef.current.close();
        segmenterRef.current = null;
      }
    };
  }, []);

  const processFrame = useCallback(async (videoEl: HTMLVideoElement) => {
    const seg = segmenterRef.current;
    if (!seg || isProcessingRef.current) return;
    if (videoEl.readyState < 2) return;
    if (videoEl.currentTime === lastVideoTime.current) return;
    lastVideoTime.current = videoEl.currentTime;

    isProcessingRef.current = true;
    try {
      const results = seg.segmentForVideo(videoEl, performance.now());
      if (results.confidenceMasks && results.confidenceMasks.length > 0) {
        const mask = results.confidenceMasks[0];
        const buffer = mask.getAsFloat32Array(); // Float32Array 0..1
        const width = mask.width;
        const height = mask.height;

        const canvas = maskCanvasRef.current;
        if (!canvas) return;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          maskImageDataRef.current = null; 
        }

        if (!maskImageDataRef.current || maskImageDataRef.current.width !== width || maskImageDataRef.current.height !== height) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            maskImageDataRef.current = ctx.createImageData(width, height);
          }
        }

        const imageData = maskImageDataRef.current;
        if (imageData) {
          const pix = imageData.data;
          for (let i = 0; i < buffer.length; i++) {
            const val = Math.round(buffer[i] * 255);
            const idx = i * 4;
            pix[idx] = val;     // R
            pix[idx + 1] = val; // G
            pix[idx + 2] = val; // B
            pix[idx + 3] = 255; // A
          }
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.putImageData(imageData, 0, 0);
          }
        }
      }
      results.close();
    } catch {
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  return {
    ready: state.ready,
    error: state.error,
    processFrame,
    maskCanvas: maskCanvasRef.current, // HTMLCanvasElement | null
  };
}