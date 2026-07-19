import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AppShell } from '@/app/layouts/app-shell';
import { AuthGuard } from '@/modules/auth';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

/** Wraps every expenses screen behind the auth guard. */
function AuthenticatedLayout() {
  return (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  );
}
