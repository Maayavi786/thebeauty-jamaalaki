import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { format } from "date-fns";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Nodemailer configuration
// Note: In production, you would use environment variables to store these values
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "youremail@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

const APP_NAME = "Jamaalaki Salon Booking";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@jamaalaki.com";

// Define collection names
const COLLECTIONS = {
  USERS: "users",
  SALONS: "salons",
  SERVICES: "services",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
  PROMOTIONS: "promotions",
};

// Function to add user roles to the Firebase Auth custom claims
export const setUserRole = functions.firestore
  .document(`${COLLECTIONS.USERS}/{userId}`)
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    const userData = snapshot.data();

    try {
      // Set custom claims based on user role
      await admin.auth().setCustomUserClaims(userId, {
        role: userData.role,
      });

      console.log(`Set custom claims for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error setting custom claims:", error);
      return false;
    }
  });

// Function to send welcome email when a user registers
export const sendWelcomeEmail = functions.auth
  .user()
  .onCreate(async (user) => {
    try {
      // Get user data from Firestore
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
      
      if (!userDoc.exists) {
        console.log(`No user document found for ${user.uid}`);
        return null;
      }
      
      const userData = userDoc.data();
      const email = user.email;
      const displayName = userData?.fullName || email;
      
      if (!email) {
        console.log("User has no email address");
        return null;
      }
      
      // Prepare email content
      const mailOptions = {
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
      await mailTransport.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
      return null;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return null;
    }
  });

// Function to send booking confirmation email
export const sendBookingConfirmation = functions.firestore
  .document(`${COLLECTIONS.BOOKINGS}/{bookingId}`)
  .onCreate(async (snapshot, context) => {
    try {
      const bookingData = snapshot.data();
      const bookingId = context.params.bookingId;
      
      // Get user data
      const userDoc = await db
        .collection(COLLECTIONS.USERS)
        .doc(bookingData.user_id)
        .get();
        
      if (!userDoc.exists) {
        console.log(`No user document found for ${bookingData.user_id}`);
        return null;
      }
      
      const userData = userDoc.data();
      const email = userData?.email;
      const displayName = userData?.fullName || email;
      
      if (!email) {
        console.log("User has no email address");
        return null;
      }
      
      // Get salon data
      const salonDoc = await db
        .collection(COLLECTIONS.SALONS)
        .doc(bookingData.salon_id)
        .get();
        
      if (!salonDoc.exists) {
        console.log(`No salon document found for ${bookingData.salon_id}`);
        return null;
      }
      
      const salonData = salonDoc.data();
      
      // Get service data
      const serviceDoc = await db
        .collection(COLLECTIONS.SERVICES)
        .doc(bookingData.service_id)
        .get();
        
      if (!serviceDoc.exists) {
        console.log(`No service document found for ${bookingData.service_id}`);
        return null;
      }
      
      const serviceData = serviceDoc.data();
      
      // Format date
      const bookingDate = bookingData.date;
      const bookingTime = bookingData.time;
      
      // Prepare email content
      const mailOptions = {
        from: `${APP_NAME} <${SENDER_EMAIL}>`,
        to: email,
        subject: `Your Booking Confirmation - ${APP_NAME}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Booking Confirmation</h2>
            <p>Hi ${displayName},</p>
            <p>Thank you for booking with ${APP_NAME}. Here are your booking details:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Salon:</strong> ${salonData?.name_en || 'Unknown'}</p>
              <p><strong>Service:</strong> ${serviceData?.name_en || 'Unknown'}</p>
              <p><strong>Date:</strong> ${bookingDate}</p>
              <p><strong>Time:</strong> ${bookingTime}</p>
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
      await mailTransport.sendMail(mailOptions);
      console.log(`Booking confirmation email sent to ${email}`);
      return null;
    } catch (error) {
      console.error("Error sending booking confirmation email:", error);
      return null;
    }
  });

// Function to update booking status and send notifications
export const updateBookingStatus = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to update booking status."
      );
    }

    const { bookingId, newStatus } = data;
    
    if (!bookingId || !newStatus) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Booking ID and new status are required."
      );
    }

    // Valid status values
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid status value."
      );
    }

    try {
      // Get the booking document
      const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
      const bookingDoc = await bookingRef.get();
      
      if (!bookingDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Booking not found."
        );
      }
      
      const bookingData = bookingDoc.data();
      
      // Check if the user has permission (is the salon owner)
      const salonRef = db.collection(COLLECTIONS.SALONS).doc(bookingData!.salon_id);
      const salonDoc = await salonRef.get();
      
      if (!salonDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Salon not found."
        );
      }
      
      const salonData = salonDoc.data();
      
      // Allow customers to cancel their own bookings
      if (
        context.auth.uid !== salonData!.owner_id && 
        context.auth.uid !== bookingData!.user_id
      ) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User does not have permission to update this booking."
        );
      }
      
      // Only allow customers to cancel their bookings
      if (
        context.auth.uid === bookingData!.user_id && 
        newStatus !== "cancelled"
      ) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Customers can only cancel bookings."
        );
      }

      // Update the booking status
      await bookingRef.update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Send notification email about the status change
      const userRef = db.collection(COLLECTIONS.USERS).doc(bookingData!.user_id);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log(`No user document found for ${bookingData!.user_id}`);
        return { success: true };
      }
      
      const userData = userDoc.data();
      const email = userData?.email;
      
      if (!email) {
        console.log("User has no email address");
        return { success: true };
      }
      
      // Get service data
      const serviceRef = db.collection(COLLECTIONS.SERVICES).doc(bookingData!.service_id);
      const serviceDoc = await serviceRef.get();
      
      if (!serviceDoc.exists) {
        console.log(`No service document found for ${bookingData!.service_id}`);
        return { success: true };
      }
      
      const serviceData = serviceDoc.data();
      
      // Prepare email content
      const mailOptions = {
        from: `${APP_NAME} <${SENDER_EMAIL}>`,
        to: email,
        subject: `Booking Status Updated - ${APP_NAME}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Booking Status Updated</h2>
            <p>Hi ${userData?.fullName || email},</p>
            <p>Your booking status has been updated to: <strong>${
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
            }</strong></p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Salon:</strong> ${salonData!.name_en}</p>
              <p><strong>Service:</strong> ${serviceData!.name_en}</p>
              <p><strong>Date:</strong> ${bookingData!.date}</p>
              <p><strong>Time:</strong> ${bookingData!.time}</p>
              <p><strong>Status:</strong> ${
                newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
              }</p>
            </div>
            
            <p>You can view and manage your booking in your <a href="https://jamaalaki.com/firebase-profile" style="color: #4A5568; text-decoration: underline;">account profile</a>.</p>
            
            <p style="margin-top: 20px;">If you have any questions, please contact the salon directly:</p>
            <p>Phone: ${salonData!.phone}</p>
            <p>Email: ${salonData!.email}</p>
            
            <p style="margin-top: 20px;">Best regards,<br>The ${APP_NAME} Team</p>
          </div>
        `,
      };
      
      // Send email
      await mailTransport.sendMail(mailOptions);
      console.log(`Status update email sent to ${email}`);

      return { success: true };
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error updating booking status."
      );
    }
  }
);

// Function to update salon rating when a new review is created
export const updateSalonRating = functions.firestore
  .document(`${COLLECTIONS.REVIEWS}/{reviewId}`)
  .onCreate(async (snapshot, context) => {
    try {
      const reviewData = snapshot.data();
      const salonId = reviewData.salon_id;
      
      // Get all reviews for the salon
      const reviewsSnapshot = await db
        .collection(COLLECTIONS.REVIEWS)
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
      await db.collection(COLLECTIONS.SALONS).doc(salonId).update({
        rating: averageRating,
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Updated rating for salon ${salonId} to ${averageRating}`);
      return null;
    } catch (error) {
      console.error("Error updating salon rating:", error);
      return null;
    }
  });

// Function to generate and save a daily report of bookings
export const generateDailyBookingReport = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .timeZone("Asia/Riyadh") // Saudi Arabia time zone
  .onRun(async (context) => {
    try {
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = format(yesterday, "yyyy-MM-dd");
      
      // Query bookings created yesterday
      const bookingsSnapshot = await db
        .collection(COLLECTIONS.BOOKINGS)
        .where("createdAt", ">=", `${formattedDate}T00:00:00.000Z`)
        .where("createdAt", "<=", `${formattedDate}T23:59:59.999Z`)
        .get();
      
      // Group bookings by salon
      const salonBookings: Record<string, any[]> = {};
      
      bookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        const salonId = booking.salon_id;
        
        if (!salonBookings[salonId]) {
          salonBookings[salonId] = [];
        }
        
        salonBookings[salonId].push({
          id: doc.id,
          ...booking,
        });
      });
      
      // For each salon, generate a report and notify the owner
      for (const [salonId, bookings] of Object.entries(salonBookings)) {
        // Get salon details
        const salonDoc = await db.collection(COLLECTIONS.SALONS).doc(salonId).get();
        
        if (!salonDoc.exists) {
          console.log(`No salon document found for ${salonId}`);
          continue;
        }
        
        const salonData = salonDoc.data();
        
        // Get owner details
        const ownerDoc = await db
          .collection(COLLECTIONS.USERS)
          .doc(salonData!.owner_id)
          .get();
          
        if (!ownerDoc.exists) {
          console.log(`No owner document found for ${salonData!.owner_id}`);
          continue;
        }
        
        const ownerData = ownerDoc.data();
        const ownerEmail = ownerData?.email;
        
        if (!ownerEmail) {
          console.log(`Owner ${salonData!.owner_id} has no email`);
          continue;
        }
        
        // Generate booking summary HTML
        let bookingsHtml = "";
        
        for (const booking of bookings) {
          // Get service details
          const serviceDoc = await db
            .collection(COLLECTIONS.SERVICES)
            .doc(booking.service_id)
            .get();
            
          if (!serviceDoc.exists) {
            console.log(`No service document found for ${booking.service_id}`);
            continue;
          }
          
          const serviceData = serviceDoc.data();
          
          // Generate HTML row for this booking
          bookingsHtml += `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.id}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${serviceData!.name_en}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.date}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.time}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
              }</td>
            </tr>
          `;
        }
        
        // Send email report
        const mailOptions = {
          from: `${APP_NAME} <${SENDER_EMAIL}>`,
          to: ownerEmail,
          subject: `Daily Booking Report - ${formattedDate} - ${salonData!.name_en}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Daily Booking Report</h2>
              <p>Hi ${ownerData?.fullName || ownerEmail},</p>
              <p>Here is your daily booking report for ${salonData!.name_en} on ${formattedDate}:</p>
              
              <p><strong>Total New Bookings:</strong> ${bookings.length}</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Booking ID</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Service</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Time</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${bookingsHtml || `
                    <tr>
                      <td colspan="5" style="padding: 10px; text-align: center;">No bookings found</td>
                    </tr>
                  `}
                </tbody>
              </table>
              
              <p style="margin-top: 20px;">You can view and manage all your bookings in your <a href="https://jamaalaki.com/owner/bookings" style="color: #4A5568; text-decoration: underline;">salon dashboard</a>.</p>
              
              <p style="margin-top: 20px;">Best regards,<br>The ${APP_NAME} Team</p>
            </div>
          `,
        };
        
        // Send email
        await mailTransport.sendMail(mailOptions);
        console.log(`Daily report email sent to ${ownerEmail} for salon ${salonId}`);
      }
      
      return null;
    } catch (error) {
      console.error("Error generating daily booking report:", error);
      return null;
    }
  });
