// Local function simulator for testing
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
let serviceAccount;
try {
  // Try to use environment variables
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    // Fall back to a local service account file if available
    serviceAccount = require('../firebase-service-account.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  console.error('To use this simulator, you need either:');
  console.error('1. A .env.local file with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  console.error('2. OR a firebase-service-account.json file in the root directory');
  process.exit(1);
}

// Set up Express server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simulate firebaseAuth function
app.post('/.netlify/functions/firebaseAuth', async (req, res) => {
  try {
    console.log('Simulating firebaseAuth function:', req.body);
    const { action, idToken, data } = req.body;

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // User ID from the verified token
    const uid = decodedToken.uid;
    console.log('Authenticated user:', uid);

    // Process different actions
    switch (action) {
      case 'setUserRole':
        // Set custom claims based on user role
        await admin.auth().setCustomUserClaims(uid, {
          role: data.role || 'customer'
        });
        console.log(`Set user role to ${data.role} for user ${uid}`);
        return res.json({ success: true, message: 'User role set successfully' });

      case 'updateUserProfile':
        // Update user profile in Firebase Auth
        await admin.auth().updateUser(uid, {
          displayName: data.fullName,
          photoURL: data.photoURL
        });
        console.log(`Updated profile for user ${uid}`);
        return res.json({ success: true, message: 'User profile updated successfully' });
        
      default:
        console.error(`Invalid action: ${action}`);
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Simulate firebaseEmail function
app.post('/.netlify/functions/firebaseEmail', async (req, res) => {
  try {
    console.log('Simulating firebaseEmail function:', req.body);
    const { action, idToken, data } = req.body;

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Log the action but don't actually send emails in simulation
    console.log(`Email action: ${action} requested by user ${decodedToken.uid}`);
    console.log('Email data:', data);

    return res.json({ 
      success: true, 
      message: `Email simulation for ${action} completed (no actual email sent)` 
    });
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Simulate firebaseBookings function
app.post('/.netlify/functions/firebaseBookings', async (req, res) => {
  try {
    console.log('Simulating firebaseBookings function:', req.body);
    const { action, idToken, data } = req.body;

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // User ID from the verified token
    const uid = decodedToken.uid;
    console.log('Authenticated user:', uid);

    // Process different booking actions
    switch (action) {
      case 'updateBookingStatus':
        console.log(`Updating booking ${data.bookingId} status to ${data.newStatus}`);
        return res.json({ 
          success: true, 
          message: `Booking status updated to ${data.newStatus} (simulation)` 
        });

      case 'updateSalonRating':
        console.log(`Updating rating for salon ${data.salonId}`);
        return res.json({ 
          success: true, 
          message: `Updated rating for salon (simulation)`,
          rating: 4.5 // Simulated rating
        });
        
      default:
        console.error(`Invalid action: ${action}`);
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Local Netlify Functions simulator running on port ${PORT}`);
  console.log(`Test endpoints:`);
  console.log(`- http://localhost:${PORT}/.netlify/functions/firebaseAuth`);
  console.log(`- http://localhost:${PORT}/.netlify/functions/firebaseEmail`);
  console.log(`- http://localhost:${PORT}/.netlify/functions/firebaseBookings`);
});
