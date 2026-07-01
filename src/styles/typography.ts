// Pixelated monospace typography scale (4px-grid friendly sizes).
import { Platform } from 'react-native';

export const MONO = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }) as string;

export const type = {
  header: 18,
  subheader: 16,
  body: 14,
  small: 13,
  label: 12,
  tiny: 11,
} as const;

export const LETTER_SPACING = 0.5;
