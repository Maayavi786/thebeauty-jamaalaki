# Firebase Production Deployment Guide

This guide provides step-by-step instructions for deploying your application to production using Firebase and Netlify.

## Prerequisites

Before you begin, ensure you have:

1. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
2. A Netlify account with access to deploy
3. Completed the Firebase migration
4. Tested the application with mock data and/or Firebase emulators

## Step 1: Configure Firebase Project

### Authentication
1. Go to Firebase Console > Authentication
2. Enable Email/Password authentication
3. Optionally, enable Google Sign-In
4. Add authorized domains (your Netlify domain)

### Firestore Database
1. Create a Firestore database in Native mode
2. Choose a region closest to your users (e.g., europe-west3)
3. Start in production mode

### Storage
1. Create a Storage bucket
2. Choose the same region as your Firestore database
3. Start in production mode

### Security Rules
1. Deploy the security rules for Firestore:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Deploy the security rules for Storage:
   ```bash
   firebase deploy --only storage:rules
   ```

## Step 2: Create a Service Account

For Netlify Functions to interact with Firebase:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely (do not commit to repository)
4. Extract the following values for Netlify environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (include the quotes around the private key)

## Step 3: Configure Netlify Environment Variables

In the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add the following environment variables:

```
# Firebase Web SDK Variables (client-side)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Control flags
VITE_USE_FIREBASE=true
VITE_USE_MOCK_DATA=false
VITE_USE_FIREBASE_EMULATORS=false

# Firebase Admin SDK Variables (server-side, for Netlify Functions)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"

# Email configuration (for notifications)
EMAIL_USER=your-email-username
EMAIL_PASSWORD=your-email-password
SENDER_EMAIL=your-sender-email
```

## Step 4: Deploy to Netlify

You can deploy using either the command line or the Netlify dashboard:

### Using Our Deploy Script

Run the deployment script, which will guide you through the process:

```bash
npm run deploy
```

### Manual Deployment via CLI

If you prefer to deploy manually:

```bash
# Make sure you're logged in
netlify login

# Deploy to production
netlify deploy --prod
```

### Using Netlify Dashboard

1. Push your changes to GitHub
2. Connect your repository in the Netlify dashboard
3. Configure build settings:
   - Build command: `cd client && npm install && npm run build && cd ../netlify && npm install && npm run build`
   - Publish directory: `client/dist`
4. Set environment variables as described above
5. Deploy

## Step 5: Verify Deployment

After deployment:

1. Test authentication flows
2. Verify data is being stored in Firestore
3. Test file uploads to Storage
4. Ensure Netlify Functions are working correctly

## Step 6: Monitor Usage

To stay within the Firebase free tier:

1. Set up billing alerts in Firebase Console
2. Monitor database usage regularly
3. Monitor storage usage
4. Check authentication usage

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Content Security Policy in Netlify.toml allows Firebase domains.

2. **Authentication Issues**: Check browser console for errors. Ensure authorized domains are configured.

3. **Security Rules Blocking Access**: Test rules in Firebase Console and adjust if needed.

4. **Netlify Function Timeouts**: Check function logs in Netlify dashboard.

5. **Private Key Format**: Ensure FIREBASE_PRIVATE_KEY includes double quotes and newlines.

## Maintenance

After deployment, periodically:

1. Update Firebase SDK dependencies
2. Review security rules
3. Monitor performance
4. Check for console errors
5. Update environment variables as needed

---

For any questions or issues, refer to the [Firebase Documentation](https://firebase.google.com/docs) or the [Netlify Documentation](https://docs.netlify.com/).
