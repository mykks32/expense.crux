import { useEffect } from 'react';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';

import { AppShell } from '@/components/layout/app-shell';
import { FullPageSpinner } from '@/components/shared/full-page-spinner';
import useAuthInitialization from '@/features/auth/hooks/use-auth-initialization';
import useAuthStore from '@/features/auth/store';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

/**
 * Wraps every expenses screen. Same client-side-only guard as `_auth.tsx` (see the
 * comment there) — renders a spinner until session restoration finishes, only then
 * decides whether to show the app shell or redirect to /login.
 */
function AuthenticatedLayout() {
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

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
