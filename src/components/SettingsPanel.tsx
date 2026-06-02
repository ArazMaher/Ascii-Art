import { type RendererSettings } from '@/hooks/useAsciiRenderer';
import { CHAR_SETS, type CharSet } from '@/utils/ascii';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
  settings: RendererSettings;
  onSettingsChange: (s: Partial<RendererSettings>) => void;
  devices: MediaDeviceInfo[];
  currentDeviceId: string;
  onSwitchCamera: (id: string) => void;
  smoothing: number;
  onSmoothingChange: (v: number) => void;
  onClose: () => void;
  isMobile: boolean;
}

const DEFAULT_SETTINGS: RendererSettings = {
  fontSize: 10,
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

// Character sets shown in the UI (exclude matrix and cyber, include dots)
const visibleCharSets: CharSet[] = [
  'detailed',
  'simple',
  'binary',
  'blocks',
  'braille',
  'hacker',
  'edge',
  'dots',
];

export default function SettingsPanel({
  settings,
  onSettingsChange,
  devices,
  currentDeviceId,
  onSwitchCamera,
  smoothing,
  onSmoothingChange,
  onClose,
  isMobile,
}: SettingsPanelProps) {

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-crosshair"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[340px] h-full bg-[#080808] border-l border-[#00FF41]/20 p-6 flex flex-col gap-8 overflow-y-auto text-[#00FF41] shadow-2xl"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-widest opacity-50 block">Options</label>
              <h2 className="text-xl font-black tracking-widest uppercase">Engine Params</h2>
            </div>
            <button className="text-[#00FF41] opacity-50 hover:opacity-100 p-2 text-xl" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="space-y-8 flex-1">
            {/* Processing Engine */}
            <div className="space-y-4">
              <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block">Processing Engine</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${settings.renderStyle === 'ascii' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-60'}`}
                  onClick={() => onSettingsChange({ renderStyle: 'ascii' })}
                >
                  ASCII_TXT
                </button>
                <button
                  className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${settings.renderStyle === 'pixel' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-60'}`}
                  onClick={() => onSettingsChange({ renderStyle: 'pixel' })}
                >
                  PIXEL_ART
                </button>
              </div>
            </div>

            {/* Character Structure – custom list without matrix/cyber, with dots */}
            <div className="space-y-4">
              <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block">Character Structure</label>
              <div className="grid grid-cols-2 gap-2">
                {visibleCharSets.map(key => (
                  <button
                    key={key}
                    disabled={settings.renderStyle === 'pixel'}
                    className={`py-2 px-2 text-[9px] uppercase tracking-widest font-bold text-center transition-colors truncate ${settings.charSet === key ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-50'} disabled:opacity-20`}
                    onClick={() => onSettingsChange({ charSet: key })}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Tint Profile & Background */}
            <div className="space-y-4">
              <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block">Tint Profile & Background</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-colors ${settings.colorMode === 'custom' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-50'}`}
                  onClick={() => onSettingsChange({ colorMode: 'custom' })}
                >
                  Custom Tint
                </button>
                <button
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-colors ${settings.colorMode === 'color' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-50'}`}
                  onClick={() => onSettingsChange({ colorMode: 'color' })}
                >
                  True Color
                </button>
              </div>

              {/* Foreground Color */}
              <div className="flex justify-between items-center bg-black/40 p-3 border border-[#00FF41]/20 mb-2">
                <span className="text-[10px] uppercase tracking-widest">Foreground</span>
                <input
                  type="color"
                  value={settings.customColor}
                  disabled={settings.colorMode !== 'custom'}
                  onChange={e => onSettingsChange({ customColor: e.target.value })}
                  className="w-8 h-8 rounded-none border-none bg-transparent cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Background Mode */}
              <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block mt-6">Background Mode</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-colors ${settings.bgMode === 'solid' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-50'}`}
                  onClick={() => onSettingsChange({ bgMode: 'solid' })}
                >
                  Solid Color
                </button>
                <button
                  className={`py-2 text-[9px] uppercase tracking-widest font-bold transition-colors ${settings.bgMode === 'matrix' ? 'border border-[#00FF41] bg-[#00FF41]/10 opacity-100' : 'border border-[#00FF41]/20 hover:bg-[#00FF41]/5 opacity-50'}`}
                  onClick={() => onSettingsChange({ bgMode: 'matrix' })}
                >
                  Matrix Rain
                </button>
              </div>

              {settings.bgMode === 'solid' && (
                <div className="flex justify-between items-center bg-black/40 p-3 border border-[#00FF41]/20 mb-2">
                  <span className="text-[10px] uppercase tracking-widest">Background Color</span>
                  <input
                    type="color"
                    value={settings.bgColor}
                    onChange={e => onSettingsChange({ bgColor: e.target.value })}
                    className="w-8 h-8 rounded-none border-none bg-transparent cursor-pointer"
                  />
                </div>
              )}

              {settings.bgMode === 'matrix' && (
                <>
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-[#00FF41]/20 mb-2">
                    <span className="text-[10px] uppercase tracking-widest">Matrix Color</span>
                    <input
                      type="color"
                      value={settings.matrixBgColor}
                      onChange={e => onSettingsChange({ matrixBgColor: e.target.value })}
                      className="w-8 h-8 rounded-none border-none bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-[#00FF41]/20 mb-2">
                    <span className="text-[10px] uppercase tracking-widest">Matrix Chars</span>
                    <select
                      value={settings.matrixCharSet}
                      onChange={e => onSettingsChange({ matrixCharSet: e.target.value as CharSet })}
                      className="bg-transparent border border-[#00FF41]/30 text-[#00FF41] text-[9px] uppercase px-1 py-0.5 outline-none"
                    >
                      {Object.keys(CHAR_SETS).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  <FancySlider
                    label="Fall Speed"
                    min={0.1}
                    max={3}
                    step={0.1}
                    value={settings.matrixSpeed}
                    onChange={(v: number) => onSettingsChange({ matrixSpeed: v })}
                  />
                </>
              )}
            </div>

            {/* Optics Parameters */}
            <div className="space-y-6">
              <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block">Optics Parameters</label>
              <div className="space-y-6">
                <FancySlider label="Grid Resolution" min={4} max={20} step={1} value={settings.fontSize} onChange={(v: number) => onSettingsChange({ fontSize: v })} />
                <FancySlider label="Sensor Exposure" min={0.5} max={2.0} step={0.05} value={settings.brightness} onChange={(v: number) => onSettingsChange({ brightness: v })} />
                <FancySlider label="Contrast Profile" min={0.5} max={3.0} step={0.1} value={settings.contrast} onChange={(v: number) => onSettingsChange({ contrast: v })} />
                <FancySlider label="Depth Highlighting" min={0} max={1.0} step={0.1} value={settings.edgeEnhancement} onChange={(v: number) => onSettingsChange({ edgeEnhancement: v })} />
                <FancySlider label="Temporal Smoothing" min={1} max={8} step={1} value={smoothing} onChange={(v: number) => onSmoothingChange(v)} />
                <FancySlider label="Noise Gate" min={0.02} max={0.3} step={0.01} value={settings.lumaThreshold} onChange={(v: number) => onSettingsChange({ lumaThreshold: v })} />
              </div>
            </div>

            {/* Camera Devices */}
            {devices.length > 1 && (
              <div className="space-y-4">
                <label className="text-[11px] uppercase tracking-widest opacity-50 border-b border-[#00FF41]/20 pb-2 block">Hardware Feed</label>
                <select
                  value={currentDeviceId}
                  onChange={e => onSwitchCamera(e.target.value)}
                  className="w-full bg-[#050505] border border-[#00FF41]/30 text-[#00FF41] text-[10px] tracking-widest p-3 uppercase focus:border-[#00FF41] outline-none"
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `OPTICAL_SRC_0${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-[#00FF41]/20 pt-6">
            <button
              className="w-full bg-[#00FF41]/10 border border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/20 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
              onClick={() => {
                onSettingsChange(DEFAULT_SETTINGS);
                onSmoothingChange(2);
              }}
            >
              Restore Defaults
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ---------- FancySlider with improved mobile touch area ---------- */
function FancySlider({ label, min, max, step, value, onChange }: { label: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void }) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayVal = step < 1 ? Number(value).toFixed(2) : Math.round(value);

  return (
    <div className="space-y-2 relative group">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
        <span>{label}</span>
        <span>{displayVal}</span>
      </div>
      {/* Larger tap target wrapper */}
      <div className="relative h-6 w-full">
        {/* Visual track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 h-full bg-[#00FF41] transition-all duration-150 ease-out" style={{ width: `${percentage}%` }}></div>
        </div>
        {/* Invisible but large touch target */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ WebkitAppearance: 'none', appearance: 'none' }}
        />
      </div>
    </div>
  );
}