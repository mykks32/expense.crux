import { useSelector } from '@tanstack/react-store';

import { authStore, type AuthData } from './state';
import { initialize, logout, onAuthSuccess } from './actions';

interface AuthState extends AuthData {
  onAuthSuccess: typeof onAuthSuccess;
  logout: typeof logout;
  initialize: typeof initialize;
}

/** Selector hook over the auth TanStack Store, so call sites read `useAuthStore((s) => s.x)`. */
export default function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useSelector(authStore, (state) => selector({ ...state, onAuthSuccess, logout, initialize }));
}
