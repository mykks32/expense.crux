import { useCallback, useState } from 'react';

type SetStoredValue<T> = (value: T | ((prev: T) => T)) => void;

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return initialValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return initialValue;
  }
}

/** State persisted to localStorage under `key`. SSR-safe: falls back to `initialValue` until the client reads the stored copy. */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetStoredValue<T>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue));

  const setStoredValue = useCallback<SetStoredValue<T>>(
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setStoredValue];
}
