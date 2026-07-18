import type { AuthResponse, User } from '@mykks32/expense-crux-contracts';

import { getCookie, removeCookie, setCookie } from '@/lib/cookies';

export const ACCESS_TOKEN_COOKIE = 'AUTH_TOKEN';
export const REFRESH_TOKEN_COOKIE = 'REFRESH_TOKEN';
export const USER_COOKIE = 'USER';

const ONE_DAY_SECONDS = 60 * 60 * 24;
const SEVEN_DAYS_SECONDS = ONE_DAY_SECONDS * 7;

/** Writes tokens + user to cookies. Call after a successful login/register/refresh. */
export function persistSession(auth: AuthResponse): void {
  setCookie(ACCESS_TOKEN_COOKIE, auth.accessToken, ONE_DAY_SECONDS);
  setCookie(REFRESH_TOKEN_COOKIE, auth.refreshToken, SEVEN_DAYS_SECONDS);
  setCookie(USER_COOKIE, encodeURIComponent(JSON.stringify(auth.user)), ONE_DAY_SECONDS);
}

/** Removes all session cookies. */
export function clearSession(): void {
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(USER_COOKIE);
}

/** Reads the last-known user from the USER cookie, if present and parseable. */
export function getCachedUser(): User | null {
  const raw = getCookie(USER_COOKIE);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch {
    return null;
  }
}
