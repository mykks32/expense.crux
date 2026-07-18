import { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';

import { FullPageSpinner } from '@/components/shared/full-page-spinner';
import useAuthInitialization from '@/features/auth/hooks/use-auth-initialization';
import useAuthStore from '@/features/auth/store';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

/**
 * Wraps /login and /register. Tokens live only in the browser, so the server can never
 * know the session on first render — this guard runs client-side only (mirrors the mobile
 * app's Stack.Protected pattern) rather than in `beforeLoad`, which would run during SSR
 * with no session and incorrectly bounce an already-logged-in user.
 */
function AuthLayout() {
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

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
