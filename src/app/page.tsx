// 'use client';

// import { useRef, useState, useCallback, useEffect } from 'react';
// import { useCamera } from '@/hooks/useCamera';
// import { useSegmentation } from '@/hooks/useSegmentation';
// import { useRecorder } from '@/hooks/useRecorder';
// import { type RendererSettings } from '@/hooks/useAsciiRenderer';
// import AsciiCanvas from '@/components/AsciiCanvas';
// import HUD from '@/components/HUD';
// import ControlPanel from '@/components/ControlPanel';
// import SettingsPanel from '@/components/SettingsPanel';
// import { CyberDecorations } from '@/components/CyberDecorations';

// const DEFAULT_SETTINGS: RendererSettings = {
//   fontSize: 8,
//   brightness: 1.0,
//   contrast: 1.5,
//   colorMode: 'custom',
//   customColor: '#00FF41',
//   charSet: 'simple',
//   bgColor: '#000000',
//   renderStyle: 'ascii',
//   edgeEnhancement: 0.4,
//   lumaThreshold: 0.06,
//   bgMode: 'solid',
//   matrixBgColor: '#00FF41',
//   matrixCharSet: 'matrix',
//   matrixSpeed: 0.3,
// };

// export default function Home() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [settings, setSettings] = useState<RendererSettings>(DEFAULT_SETTINGS);
//   const [showSettings, setShowSettings] = useState(false);

//   const [smoothing, setSmoothing] = useState(2);
//   const [hudStats, setHudStats] = useState({ fps: 0, cols: 0, rows: 0 });
//   const [isMobile, setIsMobile] = useState(false);
//   const [started, setStarted] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 768);
//     check();
//     window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   const camera = useCamera();
//   const segmentation = useSegmentation();
//   const recorder = useRecorder(canvasRef);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setStarted(true);
//       if (mounted) await camera.startCamera();
//     })();
//     return () => { mounted = false; };
//   }, []);

//   const handleStart = useCallback(async () => {
//     setStarted(true);
//     await camera.startCamera();
//   }, [camera]);

//   const handleSettingsChange = useCallback((partial: Partial<RendererSettings>) => {
//     setSettings(s => ({ ...s, ...partial }));
//   }, []);

//   const handleSmoothingChange = useCallback((v: number) => {
//     setSmoothing(v);
//   }, []);

//   const handleStatsUpdate = useCallback((fps: number, cols: number, rows: number) => {
//     setHudStats({ fps, cols, rows });
//   }, []);

//   const effectiveSettings: RendererSettings = {
//     ...settings,
//     fontSize: isMobile ? Math.min(settings.fontSize, 6) : settings.fontSize,
//   };

//   const overlaysHidden = recorder.isRecording ? 'hidden' : '';

//   return (
//     <main className="fixed inset-0 overflow-hidden bg-[#050505] text-[#00FF41] font-mono select-none">
//       <div className={`absolute inset-0 opacity-[0.03] pointer-events-none z-0 ${overlaysHidden}`} style={{ backgroundImage: 'radial-gradient(#00FF41 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
//       <div className={`absolute inset-0 shadow-[inset_0_0_100px_rgba(0,255,65,0.05)] pointer-events-none z-10 ${overlaysHidden}`}></div>
//       <CyberDecorations />
//       <div className={`absolute top-0 w-full h-[2px] bg-[#00FF41]/20 shadow-[0_0_15px_#00FF41] z-10 animate-[scanBeam_6s_linear_infinite] pointer-events-none ${overlaysHidden}`}></div>

//       {camera.videoEl && segmentation.maskCanvas && (
//         <div className="absolute inset-0 z-0">
//           <AsciiCanvas
//             videoEl={camera.videoEl}
//             maskCanvas={segmentation.maskCanvas}
//             settings={effectiveSettings}
//             onSegmentFrame={segmentation.processFrame}
//             onStatsUpdate={handleStatsUpdate}
//             canvasRef={canvasRef}
//             isRecording={recorder.isRecording} 
//           />
//         </div>
//       )}

//       <HUD
//         fps={hudStats.fps}
//         cols={hudStats.cols}
//         rows={hudStats.rows}
//         isReady={camera.isReady && segmentation.ready}
//         isRecording={recorder.isRecording}
//         recordingTime={recorder.formatTime(recorder.elapsed)}
//         segError={segmentation.error}
//         camError={camera.error}
//       />

//       <ControlPanel
//         isReady={camera.isReady}
//         isRecording={recorder.isRecording}
//         recordingTime={recorder.formatTime(recorder.elapsed)}
//         onStartRecording={recorder.startRecording}
//         onStopRecording={recorder.stopRecording}
//         onScreenshot={recorder.takeScreenshot}
//         onToggleSettings={() => setShowSettings(v => !v)}
//         onStart={handleStart}
//         isMobile={isMobile}
//       />

//       {showSettings && (
//         <SettingsPanel
//           settings={settings}
//           onSettingsChange={handleSettingsChange}
//           devices={camera.devices}
//           currentDeviceId={camera.currentDeviceId}
//           onSwitchCamera={camera.switchCamera}
//           smoothing={smoothing}
//           onSmoothingChange={handleSmoothingChange}
//           onClose={() => setShowSettings(false)}
//           isMobile={isMobile}
//         />
//       )}
//     </main>
//   );
// }
















'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useSegmentation } from '@/hooks/useSegmentation';
import { useRecorder } from '@/hooks/useRecorder';
import { type RendererSettings } from '@/hooks/useAsciiRenderer';
import AsciiCanvas from '@/components/AsciiCanvas';
import HUD from '@/components/HUD';
import ControlPanel from '@/components/ControlPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { CyberDecorations } from '@/components/CyberDecorations';

const DEFAULT_SETTINGS: RendererSettings = {
  fontSize: 8,
  brightness: 1.0,
  contrast: 1.5,
  colorMode: 'custom',
  customColor: '#00FF41',
  charSet: 'simple',
  bgColor: '#000000',
  renderStyle: 'ascii',
  edgeEnhancement: 0.4,
  lumaThreshold: 0.06,
  bgMode: 'solid',
  matrixBgColor: '#00FF41',
  matrixCharSet: 'matrix',
  matrixSpeed: 0.3,
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<RendererSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const [smoothing, setSmoothing] = useState(2);
  const [hudStats, setHudStats] = useState({ fps: 0, cols: 0, rows: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const camera = useCamera();
  const segmentation = useSegmentation();
  const recorder = useRecorder(canvasRef);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStarted(true);
      if (mounted) await camera.startCamera();
    })();
    return () => { mounted = false; };
  }, []);

  const handleStart = useCallback(async () => {
    setStarted(true);
    await camera.startCamera();
  }, [camera]);

  const handleSettingsChange = useCallback((partial: Partial<RendererSettings>) => {
    setSettings(s => ({ ...s, ...partial }));
  }, []);

  const handleSmoothingChange = useCallback((v: number) => {
    setSmoothing(v);
  }, []);

  const handleStatsUpdate = useCallback((fps: number, cols: number, rows: number) => {
    setHudStats({ fps, cols, rows });
  }, []);

  // Remove the forced mobile cap – all settings now work identically on every device
  const effectiveSettings: RendererSettings = { ...settings };

  // Hide CSS overlays during recording (they are drawn directly on the canvas)
  const overlaysHidden = recorder.isRecording ? 'hidden' : '';

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#050505] text-[#00FF41] font-mono select-none">
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none z-0 ${overlaysHidden}`} style={{ backgroundImage: 'radial-gradient(#00FF41 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      <div className={`absolute inset-0 shadow-[inset_0_0_100px_rgba(0,255,65,0.05)] pointer-events-none z-10 ${overlaysHidden}`}></div>
      <CyberDecorations />
      <div className={`absolute top-0 w-full h-[2px] bg-[#00FF41]/20 shadow-[0_0_15px_#00FF41] z-10 animate-[scanBeam_6s_linear_infinite] pointer-events-none ${overlaysHidden}`}></div>

      {camera.videoEl && segmentation.maskCanvas && (
        <div className="absolute inset-0 z-0">
          <AsciiCanvas
            videoEl={camera.videoEl}
            maskCanvas={segmentation.maskCanvas}
            settings={effectiveSettings}
            onSegmentFrame={segmentation.processFrame}
            onStatsUpdate={handleStatsUpdate}
            canvasRef={canvasRef}
            isRecording={recorder.isRecording}
          />
        </div>
      )}

      <HUD
        fps={hudStats.fps}
        cols={hudStats.cols}
        rows={hudStats.rows}
        isReady={camera.isReady && segmentation.ready}
        isRecording={recorder.isRecording}
        recordingTime={recorder.formatTime(recorder.elapsed)}
        segError={segmentation.error}
        camError={camera.error}
      />

      <ControlPanel
        isReady={camera.isReady}
        isRecording={recorder.isRecording}
        recordingTime={recorder.formatTime(recorder.elapsed)}
        onStartRecording={recorder.startRecording}
        onStopRecording={recorder.stopRecording}
        onScreenshot={recorder.takeScreenshot}
        onToggleSettings={() => setShowSettings(v => !v)}
        onStart={handleStart}
        isMobile={isMobile}
      />

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          devices={camera.devices}
          currentDeviceId={camera.currentDeviceId}
          onSwitchCamera={camera.switchCamera}
          smoothing={smoothing}
          onSmoothingChange={handleSmoothingChange}
          onClose={() => setShowSettings(false)}
          isMobile={isMobile}
        />
      )}
    </main>
  );
}