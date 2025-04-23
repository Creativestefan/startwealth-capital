/**
 * Service Worker for Stratwealth Capital
 * Handles push notifications
 */

// Service Worker Version
const SW_VERSION = '1.0.1';

// Cache name with version
const CACHE_NAME = `stratwealth-cache-v${SW_VERSION}`;

// Log events to help debugging
function logEvent(event, details = {}) {
  console.log(`[Service Worker] ${event}`, details);
  
  // Try to send message to clients if possible
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_LOG',
        event,
        details,
        timestamp: new Date().toISOString()
      });
    });
  });
}

// Listen for push events
self.addEventListener('push', function(event) {
  logEvent('Push Received', { data: event.data ? event.data.text() : 'no payload' });
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('Error parsing push notification data:', e);
      // Fallback to text
      notificationData = {
        title: 'New Notification',
        body: event.data.text(),
        icon: '/logo.png'
      };
    }
  } else {
    notificationData = {
      title: 'New Notification',
      body: 'You have a new notification from Stratwealth Capital',
      icon: '/logo.png'
    };
  }
  
  // Get the notification options
  const options = {
    body: notificationData.body || '',
    icon: notificationData.icon || '/logo.png',
    badge: notificationData.badge || '/badge.png',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    silent: false,
    vibrate: [100, 50, 100],
    timestamp: notificationData.data?.dateOfArrival || Date.now()
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Stratwealth Capital', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  logEvent('Notification clicked', { title: event.notification.title });
  
  // Close the notification
  event.notification.close();
  
  // Get the action URL from the notification data
  const actionUrl = event.notification.data?.actionUrl || '/dashboard';
  
  // Open or focus the relevant page
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // Try to find an existing window/tab to use
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === actionUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});

// Extend the service worker life when showing notification
self.addEventListener('notificationclose', function(event) {
  logEvent('Notification closed', { title: event.notification.title });
});

// Listen for install event
self.addEventListener('install', function(event) {
  logEvent('Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      logEvent('Cache opened, caching essential assets');
      return cache.addAll([
        '/',
        '/logo.png',
        '/badge.png',
        '/favicon.ico',
        // Add other important assets here
      ]).then(() => {
        logEvent('Assets cached successfully');
        return self.skipWaiting(); // Force activation
      });
    }).catch(error => {
      logEvent('Cache error', { error: error.message });
    })
  );
});

// Listen for activate event
self.addEventListener('activate', function(event) {
  logEvent('Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('stratwealth-cache-') && 
                 cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          logEvent('Deleting old cache', { cacheName });
          return caches.delete(cacheName);
        })
      ).then(() => {
        logEvent('Claiming clients');
        return self.clients.claim(); // Take control of clients
      });
    })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', function(event) {
  // Don't handle non-GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

// Message handler for debugging
self.addEventListener('message', function(event) {
  logEvent('Message received', event.data);
  
  // If it's a ping, respond with a pong
  if (event.data && event.data.type === 'PING') {
    event.ports[0].postMessage({
      type: 'PONG',
      status: 'active',
      version: SW_VERSION
    });
  }
});
