import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { LogOutIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/features/theme';
import { useAuthStore } from '@/features/auth';

export function AppShell({ children }: { children: ReactNode }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link to="/" className="text-lg font-semibold">
          expense.crux
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/expenses/new">
              <PlusIcon />
              New expense
            </Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={() => void logout()}>
            <LogOutIcon />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
