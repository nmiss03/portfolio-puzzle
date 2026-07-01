// Light + dark palettes for the pixelated theme. Both share the SAME keys so a
// single palette object can drive every screen; switching mode swaps the whole
// object. Reds are gone — negatives use a muted maroon.

export interface Palette {
  bg: string;
  bgDeep: string;
  panel: string;
  panelDark: string;
  panelLite: string;
  border: string;
  borderHi: string;
  borderLo: string;
  divider: string;
  button: string;
  buttonHi: string;
  buttonLo: string;
  gold: string; // accent / headers / highlights (neutral info blue)
  goldDim: string;
  text: string;
  textDim: string;
  muted: string;
  ink: string; // text drawn on top of the accent/button color
  success: string;
  danger: string; // muted maroon (replaces red)
  warning: string;
  white: string;
  black: string;
}

export const lightPalette: Palette = {
  bg: '#fafafa',
  bgDeep: '#f0f0f0',
  panel: '#ffffff',
  panelDark: '#f0f0f0',
  panelLite: '#ffffff',
  border: '#d0d0d0',
  borderHi: '#e8e8e8',
  borderLo: '#b8b8b8',
  divider: '#e8e8e8',
  button: '#4a90e2',
  buttonHi: '#5ba3f5',
  buttonLo: '#357abd',
  gold: '#4a90e2',
  goldDim: '#357abd',
  text: '#1a1a1a',
  textDim: '#4a4a4a',
  muted: '#7a7a7a',
  ink: '#ffffff',
  success: '#2d8659',
  danger: '#c84949',
  warning: '#c77700',
  white: '#ffffff',
  black: '#000000',
};

export const darkPalette: Palette = {
  bg: '#1a1a1a',
  bgDeep: '#141414',
  panel: '#2d2d2d',
  panelDark: '#242424',
  panelLite: '#333333',
  border: '#4a4a4a',
  borderHi: '#5a5a5a',
  borderLo: '#3a3a3a',
  divider: '#3a3a3a',
  button: '#5ba3f5',
  buttonHi: '#7ab8ff',
  buttonLo: '#4a90e2',
  gold: '#5ba3f5',
  goldDim: '#4a90e2',
  text: '#f0f0f0',
  textDim: '#b0b0b0',
  muted: '#7a7a7a',
  ink: '#1a1a1a',
  success: '#4db877',
  danger: '#e85a5a',
  warning: '#e0a030',
  white: '#ffffff',
  black: '#000000',
};

export type ThemeMode = 'light' | 'dark';

export function paletteFor(mode: ThemeMode): Palette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

// Sector colors (softened) — consistent across light/dark.
export const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Healthcare: '#d946a6',
  Finance: '#10b981',
  Energy: '#f59e0b',
  Consumer: '#a575d9',
  'Real Estate': '#d97706',
  Utilities: '#6b7280',
  Commodities: '#14b8a6',
  'Fixed Income': '#6366f1',
};
