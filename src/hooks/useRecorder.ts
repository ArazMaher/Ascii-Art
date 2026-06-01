import { useRef, useState, useCallback } from 'react';

export interface RecorderState {
  isRecording: boolean;
  elapsed: number;
  error: string | null;
}

export function useRecorder(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    elapsed: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm;codecs=vp8';

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 50_000_000,  
      });

      chunksRef.current = [];
      elapsedRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = 'webm';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-render-log-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setState(s => ({ ...s, elapsed: elapsedRef.current }));
      }, 1000);

      setState({ isRecording: true, elapsed: 0, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media Stream Failure';
      setState(s => ({ ...s, error: msg }));
    }
  }, [canvasRef]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState(s => ({ ...s, isRecording: false }));
  }, []);

  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `neural-frame-log-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [canvasRef]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    takeScreenshot,
    formatTime,
  };
}