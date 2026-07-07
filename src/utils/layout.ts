// Desktop-first layout switch. The game is a browser management sim now: at
// WIDE_BREAKPOINT and above, screens use multi-column desktop layouts; below
// it they fall back to the stacked layout so small windows stay usable.

import { useWindowDimensions } from 'react-native';

export const WIDE_BREAKPOINT = 1000;

export function useIsWide(): boolean {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}
