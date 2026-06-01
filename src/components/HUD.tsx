import { useEffect, useState } from 'react';

interface HUDProps {
  fps: number;
  cols: number;
  rows: number;
  isReady: boolean;
  isRecording: boolean;
  recordingTime: string;
  segError: string | null;
  camError: string | null;
}

function useTime() {
  const [time, setTime] = useState('');
  const [uptime, setUptime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      setTime(new Date().toISOString().slice(11, 19));
      const elapsed = Date.now() - start;
      const s = Math.floor(elapsed / 1000) % 60;
      const m = Math.floor(elapsed / 60000) % 60;
      const h = Math.floor(elapsed / 3600000);
      setUptime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, uptime };
}

export default function HUD({
  fps,
  cols,
  rows,
  isReady,
  isRecording,
  recordingTime,
  segError,
  camError,
}: HUDProps) {
  const { time, uptime } = useTime();

  const statusColor = camError || segError
    ? '#FF0033'
    : isReady
      ? '#00FF41'
      : '#FFB000';

  const statusText = camError
    ? 'CAM_ERR'
    : segError
      ? 'SEG_ERR'
      : isReady
        ? 'Operational'
        : 'Booting...';

  const formatUptime = `${String(uptime.h).padStart(2, '0')}:${String(uptime.m).padStart(2, '0')}:${String(uptime.s).padStart(2, '0')}`;

  return (
    <>
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 pointer-events-none z-20 mix-blend-screen text-[#00FF41]">
        <div className="flex items-center gap-6">
          <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: statusColor, boxShadow: `0 0 15px ${statusColor}` }}></div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-[0.4em] font-sans flex items-center">
              WARP <span className="opacity-70 mx-3">|</span> SPACE
            </h1>
            <div className="text-[9px] sm:text-[10px] tracking-[0.5em] opacity-80 mt-1 uppercase">
              Untold Mysteries
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold">
          <div>Status: <span className="opacity-70">{statusText}</span></div>
          <div>Mem/Res: <span className="opacity-70">{cols}x{rows}</span></div>
          <div>FPS: <span className="opacity-70 font-black">{Math.min(60, fps)}</span></div>
          <div>Uptime: <span className="opacity-70">{formatUptime}</span></div>
        </div>
      </header>

      {/* Connection Errors Display in center */}
      {(segError || camError) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#FF0033] bg-black p-8 z-50 flex flex-col items-center">
          <div className="text-[#FF0033] text-2xl font-black tracking-[0.3em] mb-4">SYSTEM FAULT</div>
          <div className="text-[#FF0033] opacity-80 text-sm tracking-widest font-mono text-center">
            {camError || ''}
            <br />
            {segError || ''}
          </div>
        </div>
      )}

      {/* Live Feed Tag */}
      <div className="absolute top-28 left-6 pointer-events-none z-20 hidden md:block">
        <div className="bg-[#00FF41] text-black px-3 py-1 font-black text-[12px] uppercase tracking-[0.3em] inline-block shadow-[0_0_15px_#00FF41]">
          LIVE
        </div>
      </div>

      {/* Hacker Data Panels Left */}
      <div className="hidden lg:flex absolute left-6 top-[30%] pointer-events-none z-20 flex-col gap-6 w-72">
        <div className="p-4 border border-[#00FF41]/30 bg-black/50 text-[10px] uppercase font-bold tracking-widest leading-relaxed text-[#00FF41]">
          <div>&gt; ARE YOU A SYSOP?</div>
          <div className="opacity-50 mt-1 mb-3">IF YES PLEASE LIST NAME OF BOARD</div>
          <div>&gt; WHAT COMPANIES HAVE YOU HACKED INTO?</div>
          <div className="opacity-50 my-1">NOW GIVE US A SHORT S.A. ON YOUR SELF</div>
          <div className="animate-pulse font-black text-lg mt-2">_</div>
        </div>

        <div className="p-4 border border-[#00FF41]/30 bg-black/50 flex flex-col items-center text-[#00FF41]">
          <h2 className="text-[12px] font-black uppercase mb-4 w-full border-b border-[#00FF41]/30 pb-2">Rat Lord Invites You</h2>
          <svg className="w-16 h-16 opacity-80 mb-2" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 20 50 Q 40 30 60 50 T 80 50" />
            <circle cx="20" cy="50" r="3" fill="currentColor" />
            <circle cx="80" cy="50" r="3" fill="currentColor" />
          </svg>
          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-center">
            &gt; WITH GRATITUDE<br />
            &gt; WITH ENTHUSIASM
          </div>
        </div>
      </div>

      {/* Right side panels */}
      <div className="hidden lg:flex absolute right-6 top-[25%] pointer-events-none z-20 flex-col gap-6 w-80 text-[#00FF41]">

        {/* Terminal logs */}
        <div className="border border-[#00FF41]/30 bg-black/50 p-4 text-[8px] font-bold font-mono leading-tight">
          <div className="opacity-60 mb-2 border-b border-[#00FF41]/20 pb-1">EDITUS SSHNUKE</div>
          <div className="mb-2 tracking-widest leading-relaxed opacity-80">
            &gt; 44 duplicates, 0% packet loss<br />
            &gt; 55/17.078/3.825 ms<br />
            &gt; (print "nslookup -$4 ~ ~$4") | sed
          </div>
          <div className="opacity-60 tracking-widest">
            10.2.1.3:<br />
            sed but not shown h<br />
            &nbsp;&nbsp;Service<br />
            &nbsp;&nbsp;ftp<br />
            &nbsp;&nbsp;ssh
          </div>
        </div>

        {/* Biohazard & Status */}
        <div className="border border-[#00FF41]/30 bg-black/50 p-4 flex gap-4">
          <svg className="w-16 h-16 shrink-0 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="10" fill="currentColor" />
            <path d="M 50 30 A 20 20 0 0 0 32.6 60 L 25 73.2 A 35 35 0 0 1 50 15 Z" />
            <path d="M 67.4 60 A 20 20 0 0 0 50 30 L 50 15 A 35 35 0 0 1 75 73.2 Z" />
            <path d="M 32.6 60 A 20 20 0 0 0 67.4 60 L 75 73.2 A 35 35 0 0 1 25 73.2 Z" />
          </svg>
          <div className="text-[9px] uppercase tracking-widest font-bold">
            <div className="mb-1 text-[11px] font-black underline underline-offset-4">ACTIVITY STATUS</div>
            <div className="mt-4 flex justify-between"><span className="opacity-60">SCAN</span><span>OK</span></div>
            <div className="flex justify-between"><span className="opacity-60">DATA</span><span>VAL_9</span></div>
          </div>
        </div>
      </div>

      {/* Spider Please panel on bottom right */}
      <div className="hidden lg:flex absolute right-6 bottom-20 pointer-events-none z-20 border border-[#00FF41]/30 bg-black/50 p-4 text-[#00FF41] w-80 text-[10px] uppercase font-bold tracking-widest">
        <div className="mb-3">THE SPIDER PLEADS WITH YOU.</div>
        <div className="opacity-60 normal-case tracking-normal mb-3 leading-relaxed">
          "Please... bring me a bug. All I want is a bug. I will reward you handsomely."
        </div>
        <div className="space-y-1">
          <div>&gt; GIVE BUG (1)</div>
          <div>&gt; WITHHOLD BUG</div>
          <div>&gt; EAT BUG IN FRONT OF HIM</div>
        </div>
      </div>

      <footer className="absolute bottom-6 left-6 text-[#00FF41] font-black tracking-[0.2em] uppercase text-2xl z-20 pointer-events-none mix-blend-screen shadow-[0_0_20px_#00FF41]">
        FJ Studios
      </footer>

      {/* Recording alert in HUD */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 z-30 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-black border border-[#FF0033] shadow-[0_0_15px_rgba(255,0,51,0.2)]">
            <div className="w-2 h-2 rounded-full bg-[#FF0033] animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-[#FF0033]">
              REC {recordingTime}
            </span>
          </div>
        </div>
      )}

      {(camError || segError) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 pointer-events-none">
          <div className="p-8 border border-[#FF0033]/40 bg-[#080808] max-w-md text-center shadow-[0_0_30px_rgba(255,0,51,0.1)]">
            <div className="text-xl font-black mb-2 text-[#FF0033] tracking-widest uppercase">System Fault</div>
            <div className="text-xs opacity-80 text-[#FF0033] uppercase leading-relaxed">{camError || segError}</div>
          </div>
        </div>
      )}

      {!isReady && !camError && !segError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505] pointer-events-none">
          <div className="max-w-xs w-full text-[#00FF41]">
            <h2 className="text-2xl font-black tracking-widest mb-6 animate-pulse text-center uppercase">Linking</h2>
            <div className="space-y-3 text-[10px] tracking-widest opacity-60 font-medium">
              <div className="flex justify-between"><span>Initializing Engine...</span><span className="animate-spin font-mono">/</span></div>
              <div className="flex justify-between"><span>Loading ML Models...</span></div>
              <div className="flex justify-between"><span>Acquiring Feed...</span></div>
            </div>
            <div className="mt-6 w-full h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF41] w-[60%] animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

