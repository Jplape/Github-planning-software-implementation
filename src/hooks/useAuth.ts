import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Vérifier la session existante
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Erreur de session:', error);
          setUser(null);
          return;
        }

        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (!mounted) return;
        
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [setUser, setLoading]);

  return { user, loading };
}
