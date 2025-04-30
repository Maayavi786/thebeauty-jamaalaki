// Netlify Function for sending email notifications
const nodemailer = require('nodemailer');
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
    }, 'email-app');
  } else {
    // Try to get the email app or the default app
    try {
      firebaseAdmin = admin.app('email-app');
    } catch (e) {
      firebaseAdmin = admin.app();
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Nodemailer configuration
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "youremail@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

const APP_NAME = "Jamaalaki Salon Booking";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@jamaalaki.com";

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

    // Process different email actions
    switch (action) {
      case 'sendWelcomeEmail':
        const userDoc = await admin.firestore().collection('users').doc(data.userId).get();
        
        if (!userDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
          };
        }
        
        const userData = userDoc.data();
        const email = userData.email;
        const displayName = userData.fullName || email;
        
        // Prepare welcome email content
        const welcomeMailOptions = {
          from: `${APP_NAME} <${SENDER_EMAIL}>`,
          to: email,
          subject: `Welcome to ${APP_NAME}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Welcome to ${APP_NAME}!</h2>
              <p>Hi ${displayName},</p>
              <p>Thank you for joining ${APP_NAME}. We're excited to have you with us!</p>
              <p>With your new account, you can:</p>
              <ul>
                <li>Browse and book salon services</li>
                <li>Manage your appointments</li>
                <li>Leave reviews for services you've experienced</li>
              </ul>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://jamaalaki.com/firebase-login" style="background-color: #4A5568; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In to Your Account</a>
              </div>
              <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The ${APP_NAME} Team</p>
            </div>
          `,
        };
        
        // Send email
        await mailTransport.sendMail(welcomeMailOptions);
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Welcome email sent successfully' })
        };

      case 'sendBookingConfirmation':
        const { bookingId } = data;
        const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
        
        if (!bookingDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Booking not found' })
          };
        }
        
        const bookingData = bookingDoc.data();
        
        // Get user data
        const bookingUserDoc = await admin.firestore().collection('users').doc(bookingData.user_id).get();
        
        if (!bookingUserDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
          };
        }
        
        const bookingUserData = bookingUserDoc.data();
        const userEmail = bookingUserData.email;
        const userName = bookingUserData.fullName || userEmail;
        
        // Get salon data
        const salonDoc = await admin.firestore().collection('salons').doc(bookingData.salon_id).get();
        
        if (!salonDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Salon not found' })
          };
        }
        
        const salonData = salonDoc.data();
        
        // Get service data
        const serviceDoc = await admin.firestore().collection('services').doc(bookingData.service_id).get();
        
        if (!serviceDoc.exists) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Service not found' })
          };
        }
        
        const serviceData = serviceDoc.data();
        
        // Prepare booking confirmation email
        const bookingMailOptions = {
          from: `${APP_NAME} <${SENDER_EMAIL}>`,
          to: userEmail,
          subject: `Your Booking Confirmation - ${APP_NAME}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Booking Confirmation</h2>
              <p>Hi ${userName},</p>
              <p>Thank you for booking with ${APP_NAME}. Here are your booking details:</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Booking Reference:</strong> ${bookingId}</p>
                <p><strong>Salon:</strong> ${salonData?.name_en || 'Unknown'}</p>
                <p><strong>Service:</strong> ${serviceData?.name_en || 'Unknown'}</p>
                <p><strong>Date:</strong> ${bookingData.date}</p>
                <p><strong>Time:</strong> ${bookingData.time}</p>
                <p><strong>Status:</strong> ${bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}</p>
                ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
              </div>
              
              <p>You can view and manage your booking in your <a href="https://jamaalaki.com/firebase-profile" style="color: #4A5568; text-decoration: underline;">account profile</a>.</p>
              
              <p style="margin-top: 20px;">If you have any questions, please contact the salon directly:</p>
              <p>Phone: ${salonData?.phone || 'N/A'}</p>
              <p>Email: ${salonData?.email || 'N/A'}</p>
              
              <p style="margin-top: 20px;">Best regards,<br>The ${APP_NAME} Team</p>
            </div>
          `,
        };
        
        // Send email
        await mailTransport.sendMail(bookingMailOptions);
        
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Booking confirmation email sent successfully' })
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
