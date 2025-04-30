// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || "AIzaSyDevelopmentKeyNotForProduction",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "thebeauty-dev.firebaseapp.com",
  projectId: self.FIREBASE_PROJECT_ID || "thebeauty-dev",
  storageBucket: self.FIREBASE_STORAGE_BUCKET || "thebeauty-dev.appspot.com",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: self.FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Navigate to a specific URL if provided
  if (event.notification.data && event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  } else {
    // Otherwise, open the main app
    clients.openWindow('/');
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
      .then(() => {
        console.log('Service worker activated');
      })
  );
});

// Handle service worker installation 
self.addEventListener('install', (event) => {
  event.waitUntil(
    self.skipWaiting()
      .then(() => {
        console.log('Service worker installed');
      })
  );
});
