// Central design tokens — RETRO PIXEL-ART theme.
// Muted teal-gray world, dark teal panels with thick dark-brown borders, warm
// bronze buttons, golden highlights and cream text. Sharp corners everywhere.

import { Platform } from 'react-native';

// Cross-platform "pixel/terminal" face. We avoid bundling a TTF (which can fail
// to load at startup); a monospace family + uppercase + letter-spacing gives a
// reliable retro feel on web, iOS and Android. Swap to a real pixel font here
// later if desired.
export const FONT_PIXEL = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) as string;
// Body copy stays in the system font for readability (left unset where used).
export const FONT_BODY = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) as string;

// Retro palette.
export const C = {
  // World / backgrounds
  bg: '#6F8787', // primary muted teal-gray background
  bgDeep: '#566D6B', // deeper backdrop behind panels
  // Panels (RPG-window feel)
  panel: '#3F5555', // primary dark desaturated teal panel
  panelDark: '#2E4242', // inset / table backgrounds
  panelLite: '#4E6566', // raised section inside a panel
  // Borders
  border: '#4B2E1F', // dark brown outer border
  borderHi: '#7A5A3A', // bronze bevel highlight (top/left)
  borderLo: '#2E1B11', // deepest brown (bottom/right)
  divider: '#26393A', // subtle inner divider on dark panels
  // Buttons (bronze)
  button: '#B8793B',
  buttonHi: '#D89A4A', // top/left bevel + hover
  buttonLo: '#8A5526', // bottom/right bevel
  // Highlights
  gold: '#FFD36B',
  goldDim: '#E0B24A',
  // Text
  text: '#F4EAD5', // light cream
  textDim: '#C7B89A', // muted cream
  muted: '#9FB0AE', // low-emphasis on teal panels
  ink: '#2A1A12', // dark brown ink for text on bronze/gold
  // Status
  success: '#5DBB63',
  danger: '#D9534F',
  warning: '#E8B23A',
  white: '#ffffff',
  black: '#000000',
};

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
  dividend: '#5DA9B5',
  bond: '#5DA9B5',

  white: C.white,
  black: C.black,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Sharp corners only — radii are zero in the retro theme (kept for compatibility).
export const radius = {
  sm: 0,
  md: 0,
  lg: 0,
  pill: 0,
};

export const font = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
};

// Reusable style fragments for the boxy, layered "game window" look.
export const BORDER_W = 3;

export const panel = {
  backgroundColor: C.panel,
  borderWidth: BORDER_W,
  borderColor: C.border,
  borderRadius: 0,
} as const;

// Inset panel (recessed): dark on top/left, lighter on bottom/right.
export const panelInset = {
  backgroundColor: C.panelDark,
  borderWidth: BORDER_W,
  borderTopColor: C.borderLo,
  borderLeftColor: C.borderLo,
  borderBottomColor: C.borderHi,
  borderRightColor: C.borderHi,
  borderRadius: 0,
} as const;

// Raised element (button-like): light on top/left, dark on bottom/right.
export const raised = {
  borderWidth: BORDER_W,
  borderTopColor: C.borderHi,
  borderLeftColor: C.borderHi,
  borderBottomColor: C.borderLo,
  borderRightColor: C.borderLo,
  borderRadius: 0,
} as const;

// Header text style fragment (pixel, uppercase, tight).
export const headerText = {
  fontFamily: FONT_PIXEL,
  color: C.gold,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  fontWeight: '700' as const,
};
