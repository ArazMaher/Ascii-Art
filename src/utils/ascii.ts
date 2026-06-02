export type CharSet = 'detailed' | 'simple' | 'binary' | 'blocks' | 'matrix' | 'braille' | 'hacker' | 'cyber' | 'edge' | 'dots';
export type RenderStyle = 'ascii' | 'pixel';
export type ColorMode = 'custom' | 'color';

export const CHAR_SETS: Record<CharSet, string> = {
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  simple: ' .-:=+*#%@',
  binary: ' 01',
  blocks: ' ░▒▓█',
  matrix: ' .-:=+*#ｦｧｨｩｪ01ﾊﾋﾌﾍｦ',
  braille: ' ⠁⠃⠇⡇⣧⣷⣿',
  hacker: ' <>/?!@#$%^&*()_+{}|[]\\;',
  cyber: ' ▖▗▘▙▚▛▜▝▞▟▢▣▤▥▦▧▨',
  edge: '  /\\\\|-_',
  dots: ' .·●○',   // space → dot → middle dot → black circle → white circle
};

// Extremely optimized luma calc
export function luma(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Extract luminance with adaptive curve
export function formatLuminance(
  brightness: number, // 0-255
  contrast: number,
  brightnessAdj: number
): number {
  let v = brightness / 255;
  // Apply non-linear contrast curve for significantly better depth
  v = (v - 0.5) * contrast + 0.5 + (brightnessAdj - 1) * 0.3;
  return Math.max(0, Math.min(1, v));
}

export function brightnessToChar(
  normalizedVal: number, // 0-1
  chars: string,
): string {
  const index = Math.floor(normalizedVal * (chars.length - 1));
  return chars[index] || chars[chars.length - 1];
}

// Inline optimized Sobel approximation
export function calculateEdge(idx: number, imgW: number, data: Uint8ClampedArray): number {
  const rowOffset = imgW * 4;

  // Bounds check
  if (idx < rowOffset + 4 || idx > data.length - rowOffset - 4) return 0;

  // Extract horizontal and vertical gradients using a cross-kernel (very fast)
  const left = data[idx - 4];
  const right = data[idx + 4];
  const top = data[idx - rowOffset];
  const bottom = data[idx + rowOffset];

  const gx = right - left;
  const gy = bottom - top;

  return Math.abs(gx) + Math.abs(gy); // Fast approximation of Math.sqrt(gx*gx + gy*gy)
}