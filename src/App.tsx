import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './lib/supabaseClient';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';
import Statistics from './pages/Statistics';
import InterventionReports from './pages/InterventionReports';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

import { registerServiceWorker } from './utils/registerServiceWorker';

async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
    });
    
    // Enregistrer l'abonnement dans Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: useAuthStore.getState().user?.id,
        subscription: subscription
      });
    
    if (error) {
      console.error('Error saving push subscription:', error);
    }
  }
}

export default function App() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      registerServiceWorker().then(registration => {
        if (registration) {
          subscribeToPushNotifications(registration);
        }
      });
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SessionContextProvider supabaseClient={supabase}>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
              
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/intervention-reports" element={<InterventionReports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SessionContextProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
