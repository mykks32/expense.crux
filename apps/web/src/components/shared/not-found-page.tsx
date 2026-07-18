import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-muted-foreground text-sm">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild>
        <Link to="/">Back home</Link>
      </Button>
    </div>
  );
}
