# Firebase Migration Guide

This document outlines the migration of the Beauty Salon Booking Platform from a traditional architecture (Express + PostgreSQL) to a Firebase-based serverless architecture.

## Overview

The application has been migrated to use Firebase services, leveraging the free Spark Plan features:

- **Firebase Authentication**: User management and authentication
- **Cloud Firestore**: NoSQL database for storing application data
- **Firebase Storage**: File and media storage
- **Cloud Functions**: Serverless backend logic
- **Firebase Hosting**: Web application deployment
- **Firebase Cloud Messaging**: Push notifications

## Firebase Setup

### Prerequisites

1. A Google account
2. Firebase project (created through the [Firebase Console](https://console.firebase.google.com/))
3. Node.js and npm installed

### Configuration

1. Copy `.env.example` to `.env` and fill in your Firebase configuration values:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

2. Initialize Firebase in your project:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

## Authentication

The application now uses Firebase Authentication with the following features:

- Email/password authentication
- Google sign-in
- Custom user claims for role-based access control
- Password reset
- Email verification

### Integration Points

- `FirebaseAuthContext.tsx`: Authentication context provider
- `FirebaseLogin.tsx`: Login component using Firebase Authentication
- `FirebaseRegister.tsx`: Registration component using Firebase Authentication
- `FirebaseProfile.tsx`: User profile management component

## Database

Data is stored in Cloud Firestore with the following collections:

- `users`: User profiles and related information
- `salons`: Salon information
- `services`: Salon services
- `bookings`: User bookings
- `reviews`: User reviews for salons and services
- `promotions`: Promotional offers

### Schema and Access

- Schema definitions are in `client/src/lib/firestore/schema.ts`
- Firestore security rules are defined in `firestore.rules`
- Firestore indexes are defined in `firestore.indexes.json`

## Storage

Firebase Storage is used for storing:

- Salon images
- Service images
- User profile pictures
- Additional media files

### Integration Points

- `client/src/lib/firebase/storage.ts`: Storage utility functions
- Storage security rules are defined in `storage.rules`

## Serverless Functions

Backend logic is implemented using Netlify Functions (instead of Firebase Cloud Functions) to stay within the free Spark Plan:

- User registration and role assignment
- Email notifications for bookings and account activities
- Booking management
- Rating calculations

### Implementation Approach

Since Firebase Cloud Functions require the Blaze (pay-as-you-go) plan, we've implemented an alternative approach using Netlify Functions that interact with Firebase services:

- `netlify/functions/firebaseAuth.js`: Handles authentication operations like setting user roles
- `netlify/functions/firebaseEmail.js`: Manages email notifications using Nodemailer
- `netlify/functions/firebaseBookings.js`: Handles booking operations and status updates

### Client Integration

Client-side code interacts with these Netlify Functions through utility functions in:

```
client/src/lib/firebase/netlifyFunctions.ts
client/src/lib/firebase/bookings.ts
```
- Processing payments
- Calculating salon ratings
- Generating reports

### Development

Cloud Functions code is located in the `functions/` directory:

- `functions/src/index.ts`: Main functions code
- `functions/package.json`: Dependencies for Cloud Functions

## Data Migration

Migration scripts are provided to move data from the PostgreSQL database to Firebase:

- `scripts/migrateToFirebase.js`: Core data migration script
- `scripts/migrateStorage.js`: Storage migration script

To run the migration:

1. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```

2. Configure the environment variables:
   ```bash
   # Database settings
   DATABASE_URL=postgres://username:password@localhost:5432/database_name
   
   # Firebase settings
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

3. Run the migration:
   ```bash
   node migrateToFirebase.js
   node migrateStorage.js
   ```

## Using Firebase Emulators for Development

Firebase emulators allow you to develop locally without affecting your production environment:

1. Start the emulators:
   ```bash
   firebase emulators:start
   ```

2. Use the emulators in your application by setting the appropriate environment variables.

## Deployment

Deploy the application to Firebase Hosting:

```bash
# Build the application
cd client
npm run build

# Deploy to Firebase
firebase deploy
```

## Limitations and Considerations

### Spark Plan Limitations

- Firestore: 1GB storage, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- Storage: 5GB storage, 1GB/day downloads, 20,000 uploads/day
- Functions: 125,000 invocations/month, 40 instances concurrently
- Hosting: 10GB storage, 360MB/day downloads

### Security Considerations

- All client-side Firebase access should be properly secured with Firestore and Storage rules
- Sensitive operations should be performed in Cloud Functions
- Validate data on the server side, not just in the client
