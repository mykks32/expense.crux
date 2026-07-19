import type { ReactNode } from 'react';
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ErrorPage, NotFoundPage } from '@/shared/components/common';
import { Toaster } from '@/shared/components/ui/sonner';
import { QueryProvider } from '@/app/providers/query-provider';
import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'expense.crux' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function RootComponent() {
  return (
    <RootDocument>
      <QueryProvider>
        <Outlet />
        <Toaster position="top-center" />
        {import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' && <TanStackRouterDevtools position="bottom-right" />}
      </QueryProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
