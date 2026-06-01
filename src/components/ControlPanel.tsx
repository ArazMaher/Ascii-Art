import { motion } from 'motion/react';

interface ControlPanelProps {
  isReady: boolean;
  isRecording: boolean;
  recordingTime: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onScreenshot: () => void;
  onToggleSettings: () => void;
  onStart: () => void;
  isMobile: boolean;
}

export default function ControlPanel({
  isReady,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onScreenshot,
  onToggleSettings,
  onStart,
  isMobile,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 bg-[#080808] border-t border-[#00FF41]/20">

        {/* Left Side: System Status / Inject */}
        <div className="flex items-center gap-4">
          {!isReady ? (
            <div className="px-6 py-2 text-[#00FF41] font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] animate-pulse">
              {isMobile ? 'BOOTING...' : 'MOUNTING OPTICS...'}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#00FF41]/40 flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#00FF41] animate-spin"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-bold uppercase text-[#00FF41] tracking-widest">Neural Isolation</div>
                <div className="text-[9px] opacity-40 text-[#00FF41] uppercase tracking-widest">AI-Backgr_Removal_Active</div>
              </div>
            </div>
          )}
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="border border-[#00FF41]/30 hover:bg-[#00FF41]/10 px-4 sm:px-6 py-2.5 text-[10px] uppercase font-bold text-[#00FF41] transition-colors tracking-widest disabled:opacity-40"
            onClick={onScreenshot}
            disabled={!isReady}
            title="Snapshot [HQ PNG]"
          >
            {isMobile ? 'SNAP' : 'Capture Frame'}
          </button>

          {isRecording ? (
            <button
              className="border border-[#FF0033] bg-[#FF0033]/10 text-[#FF0033] px-4 sm:px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest hover:bg-[#FF0033]/20 transition-colors shadow-[0_0_15px_rgba(255,0,51,0.2)]"
              onClick={onStopRecording}
            >
              Halt Rec ({recordingTime})
            </button>
          ) : (
            <button
              className="border border-[#FF0033]/40 text-[#FF0033] hover:bg-[#FF0033]/10 px-4 sm:px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2 disabled:opacity-40"
              onClick={onStartRecording}
              disabled={!isReady}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF0033]"></span>
              {isMobile ? 'REC' : 'Trace Record'}
            </button>
          )}
        </div>

        {/* Right Actions */}
        <button
          className="border border-[#00FF41]/30 bg-[#00FF41]/5 hover:bg-[#00FF41]/15 px-4 sm:px-8 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#00FF41] transition-colors"
          onClick={onToggleSettings}
        >
          {isMobile ? '⚙' : 'Engine Params'}
        </button>
      </div>

      {/* Footer bar */}
      <footer className="hidden md:flex h-10 border-t border-[#00FF41]/10 bg-[#050505] items-center justify-between px-6 text-[9px] uppercase tracking-widest text-[#00FF41] opacity-60">
        <div>Root@System: ~ /usr/bin/ascii_engine --live</div>
        <div>Engine_Arch: WASM / Canvas2D</div>
        <div>Session_Token: 0x88F2A9B1C</div>
      </footer>
    </motion.div>
  );
}
