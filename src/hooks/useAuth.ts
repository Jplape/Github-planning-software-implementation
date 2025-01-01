import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // TODO: Implémenter la logique d'authentification avec Supabase
    setLoading(false);
  }, [setUser, setLoading]);

  return { user, loading };
}
