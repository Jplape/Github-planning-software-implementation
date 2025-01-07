// Register event listener for the 'push' event
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const title = data.title || 'New Notification';
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Data synchronization logic
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      syncTasksWithBackend()
    );
  }
});

async function syncTasksWithBackend() {
  const cache = await caches.open('api-cache');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: await request.json()
      });
      
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

async function getAuthToken() {
  const cache = await caches.open('auth-cache');
  const response = await cache.match('/auth/token');
  return response ? response.json().then(data => data.token) : null;
}

// Handle push subscription updates
self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
    })
    .then(function(newSubscription) {
      return fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldSubscription: event.oldSubscription,
          newSubscription: newSubscription
        })
      });
    })
  );
});
