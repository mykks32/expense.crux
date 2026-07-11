import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

// expo-secure-store is native-only (Keychain/Keystore) — its web build is a stub
// that throws on every call. Web falls back to localStorage instead; it's a
// less secure choice than SecureStore, but web is a dev/testing target here,
// not the primary platform.
const storage = {
  getItem: (key: string): Promise<string | null> =>
    Platform.OS === 'web' ? Promise.resolve(window.localStorage.getItem(key)) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

/**
 * Reads the persisted access token from the device's secure storage (Keychain on
 * iOS, Keystore-backed on Android; localStorage on web).
 * @returns the access token, or null if none is stored
 */
export function getAccessToken(): Promise<string | null> {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Reads the persisted refresh token from the device's secure storage.
 * @returns the refresh token, or null if none is stored
 */
export function getRefreshToken(): Promise<string | null> {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Persists a freshly issued access/refresh token pair, overwriting any previously
 * stored pair. Called after register, login, and every token refresh (the backend
 * rotates the refresh token on every use, so both values must be replaced together).
 * @param tokens the access and refresh tokens to persist
 */
export async function setTokens(tokens: StoredTokens): Promise<void> {
  await Promise.all([
    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/**
 * Caches the signed-in user's profile alongside the tokens. The backend has no
 * "current user" endpoint, so this cache is what lets session bootstrap fall
 * back to "last known user" on a transient network error instead of forcing a
 * logout (see store.ts's bootstrap()).
 * @param user the user object to cache, as returned by register/login/refresh
 */
export async function setStoredUser(user: unknown): Promise<void> {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Reads the cached user profile.
 * @returns the cached user, or null if none is stored
 */
export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await storage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Clears the entire locally persisted session: both tokens and the cached user.
 * Called on logout, and whenever a refresh attempt is confirmed invalid
 * (expired/revoked/reused refresh token) — at that point the session can no
 * longer be trusted at all, including the cached user.
 */
export async function clearSession(): Promise<void> {
  await Promise.all([storage.deleteItem(ACCESS_TOKEN_KEY), storage.deleteItem(REFRESH_TOKEN_KEY), storage.deleteItem(USER_KEY)]);
}
