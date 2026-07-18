import { useSelector } from '@tanstack/react-store';

import { authStore, type AuthData } from './state';
import { initialize, logout, onAuthSuccess } from './actions';

interface AuthState extends AuthData {
  onAuthSuccess: typeof onAuthSuccess;
  logout: typeof logout;
  initialize: typeof initialize;
}

/** Zustand-style selector hook over the auth Store, so call sites read `useAuthStore((s) => s.x)` regardless of the underlying store implementation. */
export default function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useSelector(authStore, (state) => selector({ ...state, onAuthSuccess, logout, initialize }));
}
