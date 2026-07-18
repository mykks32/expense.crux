import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { FullPageSpinner } from '@/components/shared/full-page-spinner';

import useAuthInitialization from '../hooks/use-auth-initialization';
import useAuthStore from '../context';

/** Gates authenticated-only routes: shows a spinner until session restoration finishes, then redirects to /login if there's no user. */
export function AuthGuard({ children }: { children: ReactNode }) {
  useAuthInitialization();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      void navigate({ to: '/login' });
    }
  }, [initialized, user, navigate]);

  if (!initialized || !user) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
