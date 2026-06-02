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
      // Prefer MP4 for mobile gallery compatibility; fallback to WebM if necessary
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm;codecs=vp8';
      }

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
        // Determine file extension based on the actual MIME type used
        const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural-render-log-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        chunksRef.current = [];

        // Warn if fallback to WebM was used (some mobile galleries don't support it)
        if (ext === 'webm') {
          console.warn(
            'Recording saved as WebM. Some mobile galleries may not play this format. Consider converting to MP4.'
          );
        }
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