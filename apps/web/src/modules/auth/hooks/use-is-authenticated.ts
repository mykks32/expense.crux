import useAuthStore from '../context';

/** Returns whether a user is currently authenticated. */
function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.user !== null);
}

export default useIsAuthenticated;
