import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { FullPageSpinner } from '@/shared/components/common';

import useAuthInitialization from '../hooks/use-auth-initialization';
import useAuthStore from '../context';

/**
 * Gates guest-only routes (/login, /register). Tokens live only in the browser, so the
 * server can never know the session on first render — this guard runs client-side only
 * (mirrors the mobile app's Stack.Protected pattern) rather than in `beforeLoad`, which
 * would run during SSR with no session and incorrectly bounce an already-logged-in user.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  useAuthInitialization();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      void navigate({ to: '/' });
    }
  }, [initialized, user, navigate]);

  if (!initialized || user) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
