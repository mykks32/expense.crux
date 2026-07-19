import { Store } from '@tanstack/store';

export type Theme = 'light' | 'dark';

export interface ThemeData {
  theme: Theme;
}

export const THEME_STORAGE_KEY = 'theme';

/** Syncs the `dark` class on `<html>` with the given theme. No-op during SSR. */
export function applyDocumentClass(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// SSR-safe: window/localStorage don't exist server-side, so this falls back to the default.
function readInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : 'light';
}

const initialTheme = readInitialTheme();
applyDocumentClass(initialTheme);

export const themeStore = new Store<ThemeData>({ theme: initialTheme });
