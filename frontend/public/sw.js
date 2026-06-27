self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : { title: 'CatSlimDown', body: 'Neue Nachricht!', url: '/' };
    
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: data.url
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Error receiving push event:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus if window is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
