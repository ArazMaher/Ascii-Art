'use client';

// This component is intentionally minimal — recording controls are
// already embedded in ControlPanel. This file exports a standalone
// floating recording indicator for use when the control panel is hidden.

interface RecordingIndicatorProps {
  isRecording: boolean;
  time: string;
  onStop: () => void;
}

export default function RecordingIndicator({
  isRecording,
  time,
  onStop,
}: RecordingIndicatorProps) {
  if (!isRecording) return null;

  return (
    <button
      onClick={onStop}
      className="flex items-center gap-2 px-3 py-1.5 text-xs"
      style={{
        background: 'rgba(255,0,51,0.15)',
        border: '1px solid var(--matrix-red)',
        color: 'var(--matrix-red)',
        fontFamily: 'Share Tech Mono, monospace',
        boxShadow: '0 0 10px rgba(255,0,51,0.3)',
        cursor: 'pointer',
      }}
      title="Click to stop recording"
    >
      <div className="rec-dot" />
      <span>REC {time}</span>
    </button>
  );
}
