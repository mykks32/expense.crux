import { createFileRoute, Outlet } from '@tanstack/react-router';

import { GuestGuard } from '@/modules/auth';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

/** Wraps /login and /register behind the guest guard. */
function AuthLayout() {
  return (
    <GuestGuard>
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </GuestGuard>
  );
}
