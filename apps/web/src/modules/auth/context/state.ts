import { Store } from '@tanstack/store';
import type { User } from '@mykks32/expense-crux-contracts';

export interface AuthData {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export const authStore = new Store<AuthData>({
  user: null,
  loading: true,
  initialized: false,
});

/** Shallow-merges a partial update into the auth store. */
export function patchAuthState(partial: Partial<AuthData>): void {
  authStore.setState((state) => ({ ...state, ...partial }));
}
