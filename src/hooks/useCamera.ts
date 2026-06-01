import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  stream: MediaStream | null;
  videoEl: HTMLVideoElement | null;
  devices: MediaDeviceInfo[];
  currentDeviceId: string;
  error: string | null;
  isReady: boolean;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    stream: null,
    videoEl: null,
    devices: [],
    currentDeviceId: '',
    error: null,
    isReady: false,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const video = document.createElement('video');
    video.playsInline = true;
    video.autoplay = true;
    video.muted = true;
    video.setAttribute('playsinline', 'true');
    video.style.position = 'absolute';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    videoRef.current = video;

    setState(s => ({ ...s, videoEl: video }));

    return () => {
      document.body.removeChild(video);
    };
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devs.filter(d => d.kind === 'videoinput');
      setState(s => ({ ...s, devices: videoDevices }));
      return videoDevices;
    } catch {
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return;

    if (state.stream) {
      state.stream.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },       
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = reject;
        setTimeout(() => reject(new Error('Stream initialization timeout')), 5000);
      });

      const devices = await enumerateDevices();
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();

      setState(s => ({
        ...s,
        stream,
        videoEl: video,
        currentDeviceId: deviceId || settings.deviceId || '',
        devices,
        error: null,
        isReady: true,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Visual sensor access denied';
      setState(s => ({ ...s, error: msg, isReady: false }));
    }
  }, [state.stream, enumerateDevices]);

  const switchCamera = useCallback(async (deviceId: string) => {
    await startCamera(deviceId);
  }, [startCamera]);

  const stop = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(t => t.stop());
      setState(s => ({ ...s, stream: null, isReady: false }));
    }
  }, [state.stream]);

  return { ...state, startCamera, switchCamera, stop, videoEl: videoRef.current };
}