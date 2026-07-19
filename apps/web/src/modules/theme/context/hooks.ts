import { useSelector } from '@tanstack/react-store';

import { themeStore, type ThemeData } from './state';
import { toggle } from './actions';

interface ThemeState extends ThemeData {
  toggle: typeof toggle;
}

/** Selector hook over the theme TanStack Store, so call sites read `useThemeStore((s) => s.x)`. */
export default function useThemeStore<T>(selector: (state: ThemeState) => T): T {
  return useSelector(themeStore, (state) => selector({ ...state, toggle }));
}
