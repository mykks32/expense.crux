import { useSelector } from '@tanstack/react-store';

import { themeStore, type ThemeData } from './state';
import { toggle } from './actions';

interface ThemeState extends ThemeData {
  toggle: typeof toggle;
}

/** Zustand-style selector hook over the theme Store, so call sites read `useThemeStore((s) => s.x)` regardless of the underlying store implementation. */
export default function useThemeStore<T>(selector: (state: ThemeState) => T): T {
  return useSelector(themeStore, (state) => selector({ ...state, toggle }));
}
