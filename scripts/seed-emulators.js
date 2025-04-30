#!/usr/bin/env node

/**
 * Script to seed Firebase emulators with test data
 * This populates the emulators with realistic test data for development
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  fg: {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
  }
};

// Helper functions for console output
const log = {
  info: (message) => console.log(`${colors.fg.blue}ℹ️ ${message}${colors.reset}`),
  success: (message) => console.log(`${colors.fg.green}✅ ${message}${colors.reset}`),
  warning: (message) => console.log(`${colors.fg.yellow}⚠️ ${message}${colors.reset}`),
  error: (message) => console.log(`${colors.fg.red}❌ ${message}${colors.reset}`),
  title: (message) => console.log(`\n${colors.fg.cyan}${colors.bright}${message}${colors.reset}\n`)
};

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

// Initialize the admin SDK with default credentials for emulator use
admin.initializeApp({
  projectId: 'demo-thebeauty-local'
});

const db = admin.firestore();
const auth = admin.auth();

// Import mock data from our mock implementation
const mockDataPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'firebase', 'mockData.ts');
log.title('Reading mock data from: ' + mockDataPath);

// Read the mock data file
let mockDataContent;
try {
  mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
} catch (error) {
  log.error(`Failed to read mock data file: ${error.message}`);
  process.exit(1);
}

// Extract mock data using regex
const extractArrayData = (content, arrayName) => {
  const regex = new RegExp(`export const ${arrayName} = \\[([\\s\\S]*?)\\];`);
  const match = content.match(regex);
  if (!match) {
    log.warning(`Could not extract ${arrayName} from mock data`);
    return [];
  }
  
  // Convert TS object array to JS objects (very basic conversion)
  const arrayContent = match[1];
  // Replace single quotes with double quotes and fix potential syntax issues
  const jsonCompatible = arrayContent
    .replace(/'/g, '"')
    .replace(/(\w+):/g, '"$1":')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*\]/g, ']');
  
  try {
    // Split into objects and parse each one
    const objects = [];
    const objectStrings = jsonCompatible.split('},');
    
    objectStrings.forEach((objStr, index) => {
      if (index < objectStrings.length - 1) {
        objStr += '}';
      }
      try {
        // Clean up the object string
        const cleanObjStr = objStr.trim();
        if (cleanObjStr && cleanObjStr !== '{' && cleanObjStr !== '}') {
          // Make sure it's a complete object
          const validJson = cleanObjStr.startsWith('{') ? cleanObjStr : `{${cleanObjStr}}`;
          const parsedObj = JSON.parse(validJson);
          objects.push(parsedObj);
        }
      } catch (objError) {
        log.warning(`Failed to parse object in ${arrayName}: ${objError.message}`);
        log.info(`Problematic object string: ${objStr}`);
      }
    });
    
    return objects;
  } catch (error) {
    log.error(`Failed to parse ${arrayName}: ${error.message}`);
    return [];
  }
};

// Extract mock data
const users = extractArrayData(mockDataContent, 'mockUsers');
const salons = extractArrayData(mockDataContent, 'mockSalons');
const services = extractArrayData(mockDataContent, 'mockServices');
const bookings = extractArrayData(mockDataContent, 'mockBookings');
const reviews = extractArrayData(mockDataContent, 'mockReviews');

// Function to seed a collection
async function seedCollection(collectionName, data) {
  log.title(`Seeding ${collectionName} collection...`);
  
  // Create a batch for efficient writes
  let batch = db.batch();
  let count = 0;
  
  for (const item of data) {
    const id = item.id;
    // Remove id from the data as it's stored in the document reference
    const docData = {...item};
    delete docData.id;
    
    const docRef = db.collection(collectionName).doc(id);
    batch.set(docRef, docData);
    
    count++;
    
    // Firestore has a limit of 500 operations per batch
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
      log.info(`Committed batch of ${count} documents`);
    }
  }
  
  // Commit any remaining documents
  if (count % 400 !== 0) {
    await batch.commit();
  }
  
  log.success(`Successfully seeded ${count} documents in ${collectionName}`);
}

// Create users in Firebase Auth
async function createAuthUsers(users) {
  log.title('Creating users in Firebase Auth...');
  let count = 0;
  
  for (const user of users) {
    try {
      await auth.createUser({
        uid: user.id,
        email: user.email,
        displayName: user.fullName,
        password: 'password123', // Default password for testing
        emailVerified: true
      });
      count++;
    } catch (error) {
      log.warning(`Failed to create auth user ${user.email}: ${error.message}`);
    }
  }
  
  log.success(`Created ${count} users in Firebase Auth`);
}

// Main function to seed all data
async function seedAllData() {
  try {
    // First create the users in Auth
    await createAuthUsers(users);
    
    // Then seed Firestore collections
    await seedCollection('users', users);
    await seedCollection('salons', salons);
    await seedCollection('services', services);
    await seedCollection('bookings', bookings);
    await seedCollection('reviews', reviews);
    
    log.title('🎉 Emulators seeded successfully!');
    log.info('You can now use the Firebase emulators with test data');
    log.info('Start the emulators with: npm run emulators');
    
  } catch (error) {
    log.error(`Failed to seed data: ${error.message}`);
    process.exit(1);
  }
}

// Run the seeding process
seedAllData();
