// Netlify Function for booking operations
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
    }, 'booking-app');
  } else {
    // Try to get the booking app or the default app
    try {
      firebaseAdmin = admin.app('booking-app');
    } catch (e) {
      firebaseAdmin = admin.app();
    }
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
    const db = admin.firestore();

    // Process different booking actions
    switch (action) {
      case 'updateBookingStatus':
        const { bookingId, newStatus } = data;
        
        if (!bookingId || !newStatus) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Booking ID and new status are required' })
          };
        }

        // Valid status values
        const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
        if (!validStatuses.includes(newStatus)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid status value' })
          };
        }

        // Get the booking document
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingDoc = await bookingRef.get();
        
        if (!bookingDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Booking not found' })
          };
        }
        
        const bookingData = bookingDoc.data();
        
        // Check if the user has permission (is the salon owner or the booking creator)
        const salonRef = db.collection('salons').doc(bookingData.salon_id);
        const salonDoc = await salonRef.get();
        
        if (!salonDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Salon not found' })
          };
        }
        
        const salonData = salonDoc.data();
        
        // Allow customers to cancel their own bookings
        if (
          uid !== salonData.owner_id && 
          uid !== bookingData.user_id
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'User does not have permission to update this booking' })
          };
        }
        
        // Only allow customers to cancel their bookings
        if (
          uid === bookingData.user_id && 
          newStatus !== "cancelled"
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Customers can only cancel bookings' })
          };
        }

        // Update the booking status
        await bookingRef.update({
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
        
        // Trigger email notification via the email function
        try {
          const response = await fetch('/.netlify/functions/firebaseEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'sendBookingStatusEmail',
              idToken,
              data: {
                bookingId
              }
            })
          });
          
          // Log but don't fail if email doesn't send
          if (!response.ok) {
            console.error('Error sending status update email');
          }
        } catch (error) {
          console.error('Error triggering email notification:', error);
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            message: `Booking status updated to ${newStatus}` 
          })
        };

      case 'updateSalonRating':
        const { salonId } = data;
        
        if (!salonId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Salon ID is required' })
          };
        }
        
        // Get all reviews for the salon
        const reviewsSnapshot = await db
          .collection('reviews')
          .where("salon_id", "==", salonId)
          .get();
        
        // Calculate average rating
        let totalRating = 0;
        let reviewCount = 0;
        
        reviewsSnapshot.forEach((doc) => {
          totalRating += doc.data().rating;
          reviewCount++;
        });
        
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
        
        // Update salon document with new rating
        await db.collection('salons').doc(salonId).update({
          rating: averageRating,
          updatedAt: new Date().toISOString(),
        });
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            message: `Updated rating for salon to ${averageRating}`,
            rating: averageRating
          })
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
