import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Lets the standalone TanStack Query Chrome/Firefox DevTools extension find this
  // client (separate from the in-app ReactQueryDevtools panel below).
  useEffect(() => {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
