#!/usr/bin/env node

/**
 * Storage Migration Script: Local/S3 to Firebase Storage
 * 
 * This script migrates images and files from the existing storage solution to Firebase Storage
 * Run using: node scripts/migrateStorage.js
 * 
 * Environment variables needed:
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_PRIVATE_KEY: Firebase service account private key
 * - FIREBASE_CLIENT_EMAIL: Firebase service account client email
 * - SOURCE_IMAGES_DIR: Directory containing images to migrate (optional, default: '../uploads')
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { createReadStream } = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.projectId}.appspot.com`
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const bucket = admin.storage().bucket();

// Function to get all files from a directory recursively
async function* getFiles(dir) {
  const dirEntries = await readdir(dir, { withFileTypes: true });
  for (const entry of dirEntries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* getFiles(filePath);
    } else {
      yield filePath;
    }
  }
}

// Function to upload a file to Firebase Storage
async function uploadLocalFile(filePath, destinationPath) {
  try {
    const destination = destinationPath || path.basename(filePath);
    
    // Upload file to bucket
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: getContentType(filePath),
        cacheControl: 'public, max-age=31536000' // Cache for 1 year
      }
    });
    
    // Make the file publicly accessible
    await bucket.file(destination).makePublic();
    
    // Get the public URL
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    console.log(`Uploaded ${filePath} to ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

// Function to upload a file from a URL to Firebase Storage
async function uploadFromUrl(url, destinationPath) {
  try {
    const fileName = path.basename(url);
    const destination = destinationPath || `url-uploads/${fileName}`;
    
    // Fetch the file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const tempFilePath = path.join(__dirname, 'temp_' + fileName);
    const fileStream = fs.createWriteStream(tempFilePath);
    
    // Save the file locally first
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    // Upload to Firebase Storage
    const file = bucket.file(destination);
    await bucket.upload(tempFilePath, {
      destination,
      metadata: {
        contentType: getContentType(fileName),
        cacheControl: 'public, max-age=31536000' // Cache for 1 year
      }
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    console.log(`Uploaded from URL ${url} to ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`Error uploading from URL ${url}:`, error);
    return null;
  }
}

// Function to get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.xls':
      return 'application/vnd.ms-excel';
    case '.xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

// Function to update Firestore documents with new image URLs
async function updateImageUrlsInFirestore(urlMapping) {
  console.log('Updating image URLs in Firestore...');
  const db = admin.firestore();
  
  // Update salon images
  const salonsSnapshot = await db.collection('salons').get();
  for (const doc of salonsSnapshot.docs) {
    const data = doc.data();
    let updated = false;
    
    // Check if image_url needs to be updated
    if (data.image_url && urlMapping.has(data.image_url)) {
      data.image_url = urlMapping.get(data.image_url);
      updated = true;
    }
    
    // Check gallery images
    if (data.gallery_images && Array.isArray(data.gallery_images)) {
      for (let i = 0; i < data.gallery_images.length; i++) {
        const url = data.gallery_images[i];
        if (urlMapping.has(url)) {
          data.gallery_images[i] = urlMapping.get(url);
          updated = true;
        }
      }
    }
    
    // Update document if needed
    if (updated) {
      await doc.ref.update({
        image_url: data.image_url,
        gallery_images: data.gallery_images,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated salon document: ${doc.id}`);
    }
  }
  
  // Update service images
  const servicesSnapshot = await db.collection('services').get();
  for (const doc of servicesSnapshot.docs) {
    const data = doc.data();
    
    // Check if image_url needs to be updated
    if (data.image_url && urlMapping.has(data.image_url)) {
      await doc.ref.update({
        image_url: urlMapping.get(data.image_url),
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated service document: ${doc.id}`);
    }
  }
  
  // Update user profile photos
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    
    // Check if photoURL needs to be updated
    if (data.photoURL && urlMapping.has(data.photoURL)) {
      await doc.ref.update({
        photoURL: urlMapping.get(data.photoURL),
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated user document: ${doc.id}`);
    }
  }
  
  console.log('Finished updating Firestore documents');
}

// Main migration function
async function migrateStorage() {
  try {
    console.log('Starting storage migration to Firebase Storage...');
    
    // Store old URL to new URL mapping
    const urlMapping = new Map();
    
    // Check for local uploads directory
    const sourceDir = process.env.SOURCE_IMAGES_DIR || path.join(__dirname, '../uploads');
    
    if (fs.existsSync(sourceDir)) {
      console.log(`Migrating files from local directory: ${sourceDir}`);
      
      // Upload local files
      for await (const filePath of getFiles(sourceDir)) {
        const relativePath = path.relative(sourceDir, filePath);
        const destinationPath = `migrated/${relativePath}`;
        
        const newUrl = await uploadLocalFile(filePath, destinationPath);
        if (newUrl) {
          // Create a mapping from the old URL pattern to the new URL
          const oldUrlPattern = `/uploads/${relativePath}`;
          urlMapping.set(oldUrlPattern, newUrl);
        }
      }
    } else {
      console.log(`Local directory ${sourceDir} not found. Skipping local file migration.`);
    }
    
    // Load additional URLs from file if exists
    const urlsFilePath = path.join(__dirname, 'image-urls.txt');
    if (fs.existsSync(urlsFilePath)) {
      console.log(`Migrating images from URLs listed in ${urlsFilePath}`);
      
      const urlsContent = fs.readFileSync(urlsFilePath, 'utf8');
      const urls = urlsContent.split('\n').filter(url => url.trim() !== '');
      
      // Upload files from URLs
      for (const url of urls) {
        const newUrl = await uploadFromUrl(url);
        if (newUrl) {
          urlMapping.set(url, newUrl);
        }
      }
    }
    
    // Update Firestore documents with new URLs
    if (urlMapping.size > 0) {
      await updateImageUrlsInFirestore(urlMapping);
      
      // Save URL mapping to file for reference
      const mappingContent = Array.from(urlMapping.entries())
        .map(([oldUrl, newUrl]) => `${oldUrl} -> ${newUrl}`)
        .join('\n');
      
      fs.writeFileSync(
        path.join(__dirname, 'url-mapping.txt'),
        mappingContent
      );
      
      console.log(`Saved URL mapping to url-mapping.txt`);
    } else {
      console.log('No files were migrated. Nothing to update in Firestore.');
    }
    
    console.log('Storage migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during storage migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateStorage();
