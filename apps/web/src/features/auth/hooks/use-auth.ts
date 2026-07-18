import useAuthStore from '../context';

/** Convenience hook exposing the full auth state (user/loading/initialized) plus its actions. */
function useAuth() {
  return useAuthStore((state) => state);
}

export default useAuth;
