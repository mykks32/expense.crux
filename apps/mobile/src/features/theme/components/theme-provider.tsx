import { type PropsWithChildren, useEffect } from 'react';
import { colorScheme } from 'nativewind';

import useThemeStore from '../store';

/** Syncs the theme store to NativeWind's colorScheme (drives `dark:` classNames app-wide). */
export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    try {
      colorScheme.set(theme);
    } catch (err) {
      console.error('Failed to apply color scheme:', err);
    }
  }, [theme]);

  return <>{children}</>;
}
