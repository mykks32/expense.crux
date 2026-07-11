import { create } from 'zustand';
import type { AuthResponse, User } from '@mykks32/expense-crux-contracts';

import { ApiError, setSessionExpiredHandler } from '@/lib/api';
import { clearSession, getRefreshToken, getStoredUser, setStoredUser, setTokens } from '@/lib/token-storage';

import * as authApi from './api';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  /** Persists a fresh session (tokens + user) and marks the store authenticated. Call after a successful login/register mutation. */
  onAuthSuccess: (auth: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  /** Attempts to restore a session from a stored refresh token; call once on app start. */
  initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  onAuthSuccess: async (auth) => {
    await Promise.all([setTokens(auth), setStoredUser(auth.user)]);
    set({ user: auth.user, initialized: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // continue cleanup even if the server call fails
    } finally {
      await clearSession();
      set({ user: null, initialized: true });
    }
  },

  initialize: async () => {
    if (get().initialized) {
      set({ loading: false });
      return;
    }

    // Everything below is wrapped, not just the refresh call — initialized must
    // always end up true no matter what fails, or the app is stuck on a blank
    // screen forever (the root layout renders nothing until initialized).
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        set({ user: null, initialized: true });
        return;
      }

      try {
        const auth = await authApi.refreshToken(storedRefreshToken);
        await Promise.all([setTokens(auth), setStoredUser(auth.user)]);
        set({ user: auth.user, initialized: true });
      } catch (error) {
        // Only a confirmed-invalid refresh token (expired/revoked/reused) means the
        // session is really gone. Anything else (no connectivity, backend down) is
        // transient — fall back to the last known user rather than forcing a logout.
        const isConfirmedInvalid = error instanceof ApiError && error.statusCode === 401;
        if (!isConfirmedInvalid) {
          const cachedUser = await getStoredUser<User>();
          set({ user: cachedUser, initialized: true });
          return;
        }

        await clearSession();
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
