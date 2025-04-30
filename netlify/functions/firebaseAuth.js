// Netlify Function for Firebase Auth operations
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseAdmin;
try {
  if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  } else {
    firebaseAdmin = admin.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const { action, idToken, data } = payload;

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
      };
    }

    // User ID from the verified token
    const uid = decodedToken.uid;

    // Process different actions
    switch (action) {
      case 'setUserRole':
        // Set custom claims based on user role
        await admin.auth().setCustomUserClaims(uid, {
          role: data.role || 'customer'
        });
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'User role set successfully' })
        };

      case 'updateUserProfile':
        // Update user profile in Firebase Auth
        await admin.auth().updateUser(uid, {
          displayName: data.fullName,
          photoURL: data.photoURL
        });
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'User profile updated successfully' })
        };
        
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
}
