export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      console.log('Service Worker registered:', registration);
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }
  throw new Error('Service Workers are not supported in this browser');
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  return permission;
};

export const getPushSubscription = async (registration: ServiceWorkerRegistration) => {
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    return subscription;
  }

  const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
  
  if (!vapidPublicKey) {
    throw new Error('VAPID public key is not defined');
  }

  const newSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey
  });

  return newSubscription;
};

export const registerTaskSync = async () => {
  if (!('SyncManager' in window)) {
    throw new Error('Background Sync is not supported in this browser');
  }

  const registration = await navigator.serviceWorker.ready;
  
  try {
    await registration.sync.register('sync-tasks');
    console.log('Task sync registered');
    return true;
  } catch (error) {
    console.error('Task sync registration failed:', error);
    throw error;
  }
};

export const sendSubscriptionToServer = async (subscription: PushSubscriptionJSON) => {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    throw new Error('Failed to send subscription to server');
  }

  return response.json();
};
