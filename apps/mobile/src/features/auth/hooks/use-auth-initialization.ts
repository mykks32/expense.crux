import { useEffect } from 'react';

import useAuthStore from '../store';

/** Kicks off session restoration exactly once; call from the root layout. */
function useAuthInitialization(): void {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize().catch((err) => {
      console.error('Auth initialization failed:', err);
    });
  }, [initialize]);
}

export default useAuthInitialization;
