import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { init, subscribeToTasks } = useTaskStore();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { user, loading });
    
    if (!loading && user) {
      console.log('Initializing task store...');
      try {
        init();
        const subscription = subscribeToTasks();
        console.log('Task store initialized successfully');

        // Cleanup subscription on unmount
        return () => {
          console.log('Unsubscribing from task updates');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing task store:', error);
      }
    }
  }, [loading, user, init, subscribeToTasks]);

  useEffect(() => {
    if (!loading) {
      console.log('Checking session restoration...');
      const timeout = setTimeout(() => {
        console.log('Session check complete');
        setIsCheckingSession(false);
      }, 1000); // Increased timeout to 1 second

      return () => {
        console.log('Clearing session check timeout');
        clearTimeout(timeout);
      };
    }
  }, [loading]);

  if (loading || isCheckingSession) {
    return null; // ou un composant de chargement
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
