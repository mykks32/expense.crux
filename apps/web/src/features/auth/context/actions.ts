import type { AuthResponse } from '@mykks32/expense-crux-contracts';

import { getCookie } from '@/lib/cookies';
import { ApiError, setSessionExpiredHandler } from '@/lib/api';

import * as authApi from '../api';
import { authStore, patchAuthState } from './state';
import { REFRESH_TOKEN_COOKIE, clearSession, getCachedUser, persistSession } from '../utils/session';

/** Persists a fresh session (tokens + user) and marks the store authenticated. Call after a successful login/register mutation. */
export function onAuthSuccess(auth: AuthResponse): void {
  persistSession(auth);
  patchAuthState({ user: auth.user, initialized: true });
}

/** Revokes the session server-side, then clears local session state regardless of the server call's outcome. */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // continue cleanup even if the server call fails
  } finally {
    clearSession();
    patchAuthState({ user: null, initialized: true });
  }
}

/** Attempts to restore a session from a stored refresh token; call once per authenticated/auth layout mount. */
export async function initialize(): Promise<void> {
  if (authStore.state.initialized) {
    patchAuthState({ loading: false });
    return;
  }

  // Everything below is wrapped, not just the refresh call — initialized must
  // always end up true no matter what fails, or the routes are stuck on a
  // loading screen forever (see _auth.tsx / _authenticated.tsx guards).
  try {
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
    if (!refreshToken) {
      patchAuthState({ user: null, initialized: true });
      return;
    }

    // The backend has no "current user" endpoint — /auth/refresh is the only way to
    // both validate the session and get fresh user data, so it doubles as bootstrap.
    try {
      const auth = await authApi.refreshToken(refreshToken);
      persistSession(auth);
      patchAuthState({ user: auth.user, initialized: true });
    } catch (error) {
      // Only a confirmed-invalid refresh token (expired/revoked/reused) means the
      // session is really gone. Anything else (no connectivity, backend down) is
      // transient — fall back to the last known user rather than forcing a logout.
      const isConfirmedInvalid = error instanceof ApiError && error.statusCode === 401;
      if (!isConfirmedInvalid) {
        patchAuthState({ user: getCachedUser(), initialized: true });
        return;
      }

      clearSession();
      patchAuthState({ user: null, initialized: true });
    }
  } catch (error) {
    console.error('Auth initialize failed unexpectedly:', error);
    patchAuthState({ user: null, initialized: true });
  } finally {
    patchAuthState({ loading: false });
  }
}

// The API client can't import the store directly (the store depends on api.ts,
// which depends on the client — a cycle), so it exposes a setter instead. The
// client has already cleared the persisted session by the time this fires.
setSessionExpiredHandler(() => {
  patchAuthState({ user: null, initialized: true });
});
