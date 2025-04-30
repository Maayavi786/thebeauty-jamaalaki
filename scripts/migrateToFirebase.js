#!/usr/bin/env node

/**
 * Data Migration Script: PostgreSQL to Firebase
 * 
 * This script migrates data from the existing PostgreSQL database to Firebase Firestore
 * Run using: node scripts/migrateToFirebase.js
 * 
 * Environment variables needed:
 * - DATABASE_URL: PostgreSQL connection string
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_PRIVATE_KEY: Firebase service account private key
 * - FIREBASE_CLIENT_EMAIL: Firebase service account client email
 */

const { Pool } = require('pg');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/thebeauty'
});

// Initialize Firebase Admin SDK
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Use environment variables
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
  } else {
    // Check for service account file
    try {
      const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
      serviceAccount = require(serviceAccountPath);
      console.log('Using service account from file');
    } catch (err) {
      console.error('No service account file found. Please provide Firebase credentials.');
      process.exit(1);
    }
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  SALONS: 'salons',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews'
};

// Migration functions
async function migrateUsers() {
  console.log('Starting user migration...');
  const userResult = await pool.query('SELECT * FROM users');
  const users = userResult.rows;
  
  const batch = db.batch();
  let count = 0;
  
  // Create a mapping from PostgreSQL user IDs to Firebase UIDs
  const userIdMap = {};
  
  for (const user of users) {
    try {
      // Try to create a Firebase Auth user
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: user.email,
          password: 'TemporaryPassword123!', // Users will need to reset their password
          displayName: user.name || user.email.split('@')[0],
          disabled: false,
          emailVerified: true
        });
        
        console.log(`Created Firebase user for ${user.email}`);
      } catch (error) {
        // User may already exist in Firebase
        if (error.code === 'auth/email-already-exists') {
          const userRecord = await admin.auth().getUserByEmail(user.email);
          firebaseUser = userRecord;
          console.log(`Firebase user already exists for ${user.email}`);
        } else {
          console.error(`Error creating Firebase user for ${user.email}:`, error);
          continue;
        }
      }
      
      // Store mapping from PostgreSQL ID to Firebase UID
      userIdMap[user.id] = firebaseUser.uid;
      
      // Create user document in Firestore
      const userDocRef = db.collection(COLLECTIONS.USERS).doc(firebaseUser.uid);
      
      batch.set(userDocRef, {
        email: user.email,
        fullName: user.name || '',
        phone: user.phone || '',
        role: user.role === 'owner' ? 'salon_owner' : 'customer',
        preferredLanguage: user.preferred_language || 'en',
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} users`);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }
  
  // Commit any remaining users
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`User migration complete. Migrated ${count} users.`);
  
  // Save user ID mapping to file for other migrations
  fs.writeFileSync(
    path.join(__dirname, 'user-id-mapping.json'),
    JSON.stringify(userIdMap, null, 2)
  );
  
  return userIdMap;
}

async function migrateSalons(userIdMap) {
  console.log('Starting salon migration...');
  const salonResult = await pool.query('SELECT * FROM salons');
  const salons = salonResult.rows;
  
  // Load user ID mapping if not provided
  if (!userIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'user-id-mapping.json');
      userIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('User ID mapping file not found. Run user migration first.');
      process.exit(1);
    }
  }
  
  const batch = db.batch();
  let count = 0;
  
  // Create a mapping from PostgreSQL salon IDs to Firestore IDs
  const salonIdMap = {};
  
  for (const salon of salons) {
    try {
      // Get Firebase UID for salon owner
      const firebaseOwnerId = userIdMap[salon.owner_id];
      
      if (!firebaseOwnerId) {
        console.warn(`No Firebase user found for salon owner ID ${salon.owner_id}. Skipping salon ${salon.name_en}.`);
        continue;
      }
      
      // Create salon document in Firestore
      const salonId = `salon_${uuidv4()}`;
      salonIdMap[salon.id] = salonId;
      
      const salonDocRef = db.collection(COLLECTIONS.SALONS).doc(salonId);
      
      batch.set(salonDocRef, {
        owner_id: firebaseOwnerId,
        name_en: salon.name_en || '',
        name_ar: salon.name_ar || '',
        description_en: salon.description_en || '',
        description_ar: salon.description_ar || '',
        address: salon.address || '',
        location: salon.latitude && salon.longitude ? {
          latitude: parseFloat(salon.latitude),
          longitude: parseFloat(salon.longitude)
        } : null,
        phone: salon.phone || '',
        email: salon.email || '',
        image_url: salon.image_url || '',
        gallery_images: salon.gallery_images || [],
        rating: parseFloat(salon.rating || '4.5'),
        is_featured: salon.is_featured || false,
        ladies_only: salon.ladies_only || false,
        private_rooms: salon.private_rooms || false,
        business_hours: {
          monday: { open: salon.opening_time || '09:00', close: salon.closing_time || '18:00' },
          tuesday: { open: salon.opening_time || '09:00', close: salon.closing_time || '18:00' },
          wednesday: { open: salon.opening_time || '09:00', close: salon.closing_time || '18:00' },
          thursday: { open: salon.opening_time || '09:00', close: salon.closing_time || '18:00' },
          friday: { open: salon.opening_time || '09:00', close: salon.closing_time || '18:00' },
          saturday: { open: salon.opening_time || '10:00', close: salon.closing_time || '16:00' },
          sunday: { open: salon.opening_time || '10:00', close: salon.closing_time || '16:00' },
        },
        createdAt: salon.created_at ? new Date(salon.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} salons`);
      }
    } catch (error) {
      console.error(`Error processing salon ${salon.name_en}:`, error);
    }
  }
  
  // Commit any remaining salons
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Salon migration complete. Migrated ${count} salons.`);
  
  // Save salon ID mapping to file for other migrations
  fs.writeFileSync(
    path.join(__dirname, 'salon-id-mapping.json'),
    JSON.stringify(salonIdMap, null, 2)
  );
  
  return salonIdMap;
}

async function migrateServices(salonIdMap) {
  console.log('Starting service migration...');
  const serviceResult = await pool.query('SELECT * FROM services');
  const services = serviceResult.rows;
  
  // Load salon ID mapping if not provided
  if (!salonIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'salon-id-mapping.json');
      salonIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('Salon ID mapping file not found. Run salon migration first.');
      process.exit(1);
    }
  }
  
  const batch = db.batch();
  let count = 0;
  
  // Create a mapping from PostgreSQL service IDs to Firestore IDs
  const serviceIdMap = {};
  
  for (const service of services) {
    try {
      // Get Firestore ID for salon
      const firestoreSalonId = salonIdMap[service.salon_id];
      
      if (!firestoreSalonId) {
        console.warn(`No Firestore salon found for salon ID ${service.salon_id}. Skipping service ${service.name_en}.`);
        continue;
      }
      
      // Create service document in Firestore
      const serviceId = `service_${uuidv4()}`;
      serviceIdMap[service.id] = serviceId;
      
      const serviceDocRef = db.collection(COLLECTIONS.SERVICES).doc(serviceId);
      
      batch.set(serviceDocRef, {
        salon_id: firestoreSalonId,
        name_en: service.name_en || '',
        name_ar: service.name_ar || '',
        description_en: service.description_en || '',
        description_ar: service.description_ar || '',
        duration: parseInt(service.duration || '60', 10),
        price: parseFloat(service.price || '0'),
        category: service.category || 'Other',
        image_url: service.image_url || '',
        is_featured: service.is_featured || false,
        is_available: service.is_available !== false,
        createdAt: service.created_at ? new Date(service.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} services`);
      }
    } catch (error) {
      console.error(`Error processing service ${service.name_en}:`, error);
    }
  }
  
  // Commit any remaining services
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Service migration complete. Migrated ${count} services.`);
  
  // Save service ID mapping to file for other migrations
  fs.writeFileSync(
    path.join(__dirname, 'service-id-mapping.json'),
    JSON.stringify(serviceIdMap, null, 2)
  );
  
  return serviceIdMap;
}

async function migrateBookings(userIdMap, salonIdMap, serviceIdMap) {
  console.log('Starting booking migration...');
  const bookingResult = await pool.query('SELECT * FROM bookings');
  const bookings = bookingResult.rows;
  
  // Load mappings if not provided
  if (!userIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'user-id-mapping.json');
      userIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('User ID mapping file not found. Run user migration first.');
      process.exit(1);
    }
  }
  
  if (!salonIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'salon-id-mapping.json');
      salonIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('Salon ID mapping file not found. Run salon migration first.');
      process.exit(1);
    }
  }
  
  if (!serviceIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'service-id-mapping.json');
      serviceIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('Service ID mapping file not found. Run service migration first.');
      process.exit(1);
    }
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const booking of bookings) {
    try {
      // Get Firestore IDs for related entities
      const firebaseUserId = userIdMap[booking.user_id];
      const firestoreSalonId = salonIdMap[booking.salon_id];
      const firestoreServiceId = serviceIdMap[booking.service_id];
      
      if (!firebaseUserId) {
        console.warn(`No Firebase user found for user ID ${booking.user_id}. Skipping booking ${booking.id}.`);
        continue;
      }
      
      if (!firestoreSalonId) {
        console.warn(`No Firestore salon found for salon ID ${booking.salon_id}. Skipping booking ${booking.id}.`);
        continue;
      }
      
      if (!firestoreServiceId) {
        console.warn(`No Firestore service found for service ID ${booking.service_id}. Skipping booking ${booking.id}.`);
        continue;
      }
      
      // Create booking document in Firestore
      const bookingId = `booking_${uuidv4()}`;
      const bookingDocRef = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
      
      // Parse date and time
      const bookingDate = new Date(booking.appointment_date);
      const formattedDate = bookingDate.toISOString().split('T')[0];
      const formattedTime = booking.appointment_time || '12:00';
      
      batch.set(bookingDocRef, {
        user_id: firebaseUserId,
        salon_id: firestoreSalonId,
        service_id: firestoreServiceId,
        date: formattedDate,
        time: formattedTime,
        status: booking.status || 'pending',
        notes: booking.notes || '',
        payment_status: booking.payment_status || 'pending',
        createdAt: booking.created_at ? new Date(booking.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} bookings`);
      }
    } catch (error) {
      console.error(`Error processing booking ${booking.id}:`, error);
    }
  }
  
  // Commit any remaining bookings
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Booking migration complete. Migrated ${count} bookings.`);
}

async function migrateReviews(userIdMap, salonIdMap, serviceIdMap) {
  console.log('Starting review migration...');
  const reviewResult = await pool.query('SELECT * FROM reviews');
  const reviews = reviewResult.rows;
  
  // Load mappings if not provided
  if (!userIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'user-id-mapping.json');
      userIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('User ID mapping file not found. Run user migration first.');
      process.exit(1);
    }
  }
  
  if (!salonIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'salon-id-mapping.json');
      salonIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('Salon ID mapping file not found. Run salon migration first.');
      process.exit(1);
    }
  }
  
  if (!serviceIdMap) {
    try {
      const mappingFile = path.join(__dirname, 'service-id-mapping.json');
      serviceIdMap = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (error) {
      console.error('Service ID mapping file not found. Run service migration first.');
      process.exit(1);
    }
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const review of reviews) {
    try {
      // Get Firestore IDs for related entities
      const firebaseUserId = userIdMap[review.user_id];
      const firestoreSalonId = salonIdMap[review.salon_id];
      
      if (!firebaseUserId) {
        console.warn(`No Firebase user found for user ID ${review.user_id}. Skipping review ${review.id}.`);
        continue;
      }
      
      if (!firestoreSalonId) {
        console.warn(`No Firestore salon found for salon ID ${review.salon_id}. Skipping review ${review.id}.`);
        continue;
      }
      
      // Get Firestore service ID if present
      let firestoreServiceId = null;
      if (review.service_id) {
        firestoreServiceId = serviceIdMap[review.service_id];
      }
      
      // Create review document in Firestore
      const reviewId = `review_${uuidv4()}`;
      const reviewDocRef = db.collection(COLLECTIONS.REVIEWS).doc(reviewId);
      
      const reviewData = {
        user_id: firebaseUserId,
        salon_id: firestoreSalonId,
        rating: parseInt(review.rating || '5', 10),
        comment: review.comment || '',
        is_verified: review.is_verified || false,
        createdAt: review.created_at ? new Date(review.created_at).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (firestoreServiceId) {
        reviewData.service_id = firestoreServiceId;
      }
      
      if (review.response) {
        reviewData.response = {
          text: review.response,
          date: review.response_date ? new Date(review.response_date).toISOString() : new Date().toISOString()
        };
      }
      
      batch.set(reviewDocRef, reviewData);
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} reviews`);
      }
    } catch (error) {
      console.error(`Error processing review ${review.id}:`, error);
    }
  }
  
  // Commit any remaining reviews
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Review migration complete. Migrated ${count} reviews.`);
}

// Main migration function
async function migrateData() {
  try {
    console.log('Starting data migration from PostgreSQL to Firebase Firestore...');
    
    // Run migrations in sequence
    const userIdMap = await migrateUsers();
    const salonIdMap = await migrateSalons(userIdMap);
    const serviceIdMap = await migrateServices(salonIdMap);
    await migrateBookings(userIdMap, salonIdMap, serviceIdMap);
    await migrateReviews(userIdMap, salonIdMap, serviceIdMap);
    
    console.log('Data migration complete!');
    
    // Clean up
    await pool.end();
    console.log('PostgreSQL connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData();
