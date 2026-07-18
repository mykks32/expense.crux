import { create } from 'zustand';
import type { AuthResponse, User } from '@mykks32/expense-crux-contracts';

import { getCookie, removeCookie, setCookie } from '@/lib/cookies';
import { ApiError, setSessionExpiredHandler } from '@/lib/api';

import * as authApi from './api';

const ACCESS_TOKEN_COOKIE = 'AUTH_TOKEN';
const REFRESH_TOKEN_COOKIE = 'REFRESH_TOKEN';
const USER_COOKIE = 'USER';

const ONE_DAY_SECONDS = 60 * 60 * 24;
const SEVEN_DAYS_SECONDS = ONE_DAY_SECONDS * 7;

function persistSession(auth: AuthResponse): void {
  setCookie(ACCESS_TOKEN_COOKIE, auth.accessToken, ONE_DAY_SECONDS);
  setCookie(REFRESH_TOKEN_COOKIE, auth.refreshToken, SEVEN_DAYS_SECONDS);
  setCookie(USER_COOKIE, encodeURIComponent(JSON.stringify(auth.user)), ONE_DAY_SECONDS);
}

function clearSession(): void {
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(USER_COOKIE);
}

function getCachedUser(): User | null {
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

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  /** Persists a fresh session (tokens + user) and marks the store authenticated. Call after a successful login/register mutation. */
  onAuthSuccess: (auth: AuthResponse) => void;
  logout: () => Promise<void>;
  /** Attempts to restore a session from a stored refresh token; call once per authenticated/auth layout mount. */
  initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  onAuthSuccess: (auth) => {
    persistSession(auth);
    set({ user: auth.user, initialized: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // continue cleanup even if the server call fails
    } finally {
      clearSession();
      set({ user: null, initialized: true });
    }
  },

  initialize: async () => {
    if (get().initialized) {
      set({ loading: false });
      return;
    }

    // Everything below is wrapped, not just the refresh call — initialized must
    // always end up true no matter what fails, or the routes are stuck on a
    // loading screen forever (see _auth.tsx / _authenticated.tsx guards).
    try {
      const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
      if (!refreshToken) {
        set({ user: null, initialized: true });
        return;
      }

      // The backend has no "current user" endpoint — /auth/refresh is the only way to
      // both validate the session and get fresh user data, so it doubles as bootstrap.
      try {
        const auth = await authApi.refreshToken(refreshToken);
        persistSession(auth);
        set({ user: auth.user, initialized: true });
      } catch (error) {
        // Only a confirmed-invalid refresh token (expired/revoked/reused) means the
        // session is really gone. Anything else (no connectivity, backend down) is
        // transient — fall back to the last known user rather than forcing a logout.
        const isConfirmedInvalid = error instanceof ApiError && error.statusCode === 401;
        if (!isConfirmedInvalid) {
          set({ user: getCachedUser(), initialized: true });
          return;
        }

        clearSession();
        set({ user: null, initialized: true });
      }
    } catch (error) {
      console.error('Auth initialize failed unexpectedly:', error);
      set({ user: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },
}));

// The API client can't import the store directly (the store depends on api.ts,
// which depends on the client — a cycle), so it exposes a setter instead. The
// client has already cleared the persisted session by the time this fires.
setSessionExpiredHandler(() => {
  useAuthStore.setState({ user: null, initialized: true });
});

export default useAuthStore;
