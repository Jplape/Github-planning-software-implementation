import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        console.log('Initializing authentication...');
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          setUser(null);
          localStorage.removeItem('supabase.auth.session');
          return;
        }

        if (session) {
          console.log('Found existing session:', session);
          setUser(session.user);
          localStorage.setItem('supabase.auth.session', JSON.stringify({ session }));
        } else {
          console.log('No active session found');
          setUser(null);
          localStorage.removeItem('supabase.auth.session');
        }
      } catch (error) {
        console.error('Error during session check:', error);
        setUser(null);
        localStorage.removeItem('supabase.auth.session');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (!mounted) return;
        
        if (session) {
          console.log('New session detected:', session);
          setUser(session.user);
          localStorage.setItem('supabase.auth.session', JSON.stringify({ session }));
        } else {
          console.log('Session ended');
          setUser(null);
          localStorage.removeItem('supabase.auth.session');
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
