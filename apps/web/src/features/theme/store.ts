import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

function applyDocumentClass(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// SSR-safe: falls back to a no-op store server-side, since window.localStorage doesn't exist there.
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        applyDocumentClass(next);
        set({ theme: next });
      },
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : window.localStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDocumentClass(state.theme);
        }
      },
    },
  ),
);

export default useThemeStore;
