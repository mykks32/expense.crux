import { useEffect } from 'react';

import useAuthStore from '../store';

/** Kicks off session restoration exactly once; call from the auth-gated layout routes. */
function useAuthInitialization(): void {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch((err: unknown) => {
      console.error('Auth initialization failed:', err);
    });
  }, [initialize]);
}

export default useAuthInitialization;
