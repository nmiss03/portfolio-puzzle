// Central design tokens. The pixelated theme sources its colors from the
// light/dark palettes in styles/colors.ts. The shared `C` object below is the
// LIGHT palette (the app's default look); screens that read `C` statically get
// the light theme. Theme-reactive screens read the active palette from
// ThemeContext instead.

import { lightPalette, Palette } from './styles/colors';
import { MONO } from './styles/typography';

export type { Palette };

// Cross-platform pixel/terminal face.
export const FONT_PIXEL = MONO;
export const FONT_BODY = MONO;

// Default (light) palette used by static stylesheets.
export const C: Palette = lightPalette;

// Backwards-compatible alias used by older imports (format.ts, _layout.tsx).
export const colors = {
  bg: C.bg,
  surface: C.panel,
  surfaceAlt: C.panelDark,
  border: C.border,
  borderStrong: C.borderLo,

  text: C.text,
  subtext: C.textDim,
  muted: C.muted,

  primary: C.gold,
  primaryDark: C.goldDim,

  success: C.success,
  warning: C.warning,
  danger: C.danger,

  growth: C.gold,
  dividend: '#14b8a6',
  bond: '#14b8a6',

  white: C.white,
  black: C.black,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Sharp corners only.
export const radius = { sm: 0, md: 0, lg: 0, pill: 0 };

export const font = { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, display: 34 };

// 2px solid borders for the pixel-grid aesthetic.
export const BORDER_W = 2;

export const headerText = {
  fontFamily: FONT_PIXEL,
  color: C.gold,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  fontWeight: '700' as const,
};
