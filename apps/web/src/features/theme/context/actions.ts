import { THEME_STORAGE_KEY, applyDocumentClass, themeStore, type Theme } from './state';

/** Flips the theme between light/dark, syncing the `<html>` class and localStorage. */
export function toggle(): void {
  const next: Theme = themeStore.state.theme === 'light' ? 'dark' : 'light';
  applyDocumentClass(next);
  themeStore.setState(() => ({ theme: next }));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }
}
