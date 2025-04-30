import { getToken, onMessage } from 'firebase/messaging';
import { initializeMessaging } from '@/lib/firebase';

// Initialize FCM and request permission
export const initializeFCM = async (): Promise<boolean> => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) {
      console.log('This browser does not support Firebase Cloud Messaging');
      return false;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      await getOrRegisterToken();
      setupMessageHandler();
      return true;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await getOrRegisterToken();
      setupMessageHandler();
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return false;
  }
};

// Get or register FCM token
export const getOrRegisterToken = async (): Promise<string | null> => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;

    // Get the token from Firebase
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || ''
    });

    if (currentToken) {
      // Save the token to your user's document in Firestore
      await saveTokenToDatabase(currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Save FCM token to Firestore
const saveTokenToDatabase = async (token: string): Promise<void> => {
  // Get the current user
  const auth = (await import('@/lib/firebase')).auth;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.log('No user logged in, cannot save FCM token');
    return;
  }

  // Save token to user document
  const db = (await import('@/lib/firebase')).db;
  const { doc, updateDoc } = await import('firebase/firestore');
  const userRef = doc(db, 'users', currentUser.uid);

  await updateDoc(userRef, {
    fcmTokens: { [token]: true },
    updatedAt: new Date().toISOString()
  });
};

// Set up message handler for foreground notifications
const setupMessageHandler = async (): Promise<void> => {
  const messaging = await initializeMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    
    // Display a custom notification
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // Show custom notification
      if (Notification.permission === 'granted' && title) {
        const notificationOptions = {
          body: body || '',
          icon: '/favicon.ico',
          data: payload.data
        };
        
        const notification = new Notification(title, notificationOptions);
        
        // Handle notification click
        notification.onclick = () => {
          notification.close();
          // Navigate to relevant page based on payload.data
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }
        };
      }
    }
  });
};

// Register service worker for background notifications
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};
