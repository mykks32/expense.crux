import useAuthStore from '../context';

/** Returns the currently authenticated user, or null if not signed in. */
function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export default useCurrentUser;
