import type { ErrorComponentProps } from '@tanstack/react-router';

import { Button } from '@/shared/components/ui/button';

/** Root-level fallback for any render/loader error that bubbles past a route — pairs with `notFoundComponent` for the 404 case. */
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-muted-foreground text-sm">Error</p>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{error.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
