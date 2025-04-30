# Firebase Implementation Guide

This document provides an overview of the Firebase implementation in the application, including development options, testing approaches, and deployment procedures.

## Development Options

The application supports three main development approaches:

1. **Mock Data Mode** (simplest)
   - Uses JavaScript objects to simulate Firebase
   - No Firebase connection required
   - Indicated by orange "MOCK DATA MODE" badge in UI
   - Set with `VITE_USE_MOCK_DATA=true`

2. **Firebase Emulators** (realistic local testing)
   - Runs local Firebase services on your machine
   - Indicated by blue "FIREBASE EMULATOR" badge in UI
   - Set with `VITE_USE_FIREBASE_EMULATORS=true`
   - Requires Firebase CLI installed

3. **Real Firebase** (production mode)
   - Connects to real Firebase services
   - Requires Firebase project and configuration
   - Used in production deployment

## Available NPM Scripts

```bash
# Standard development with mock data
npm run dev

# Start Firebase emulators and development server
npm run dev:emulators

# Start only the Firebase emulators
npm run emulators

# Seed the emulators with test data
npm run emulators:seed

# Export emulator data for future sessions
npm run emulators:export

# Validate your environment setup
npm run test:env

# Run pre-deployment checks
npm run predeploy

# Deploy to Netlify with all checks
npm run deploy
```

## Mock Data Implementation

The mock data implementation provides a way to develop and test the application without connecting to real Firebase services.

### Key Files:
- `client/src/lib/firebase/mockData.ts` - Mock data definitions
- `client/src/lib/firebase/localTesting.ts` - Mock service implementations
- `client/src/lib/queryClient.ts` - Request handler with mock support
- `client/src/components/MockDataIndicator.tsx` - UI indicator

### Available Test Accounts:
- **Customer**: `customer@example.com` (any password)
- **Salon Owner**: `owner@example.com` (any password)

## Firebase Emulators

Firebase emulators provide a more realistic testing environment by running actual Firebase services locally.

### Available Emulators:
- **Authentication**: Port 9099
- **Firestore**: Port 8080
- **Functions**: Port 5001
- **Storage**: Port 9199
- **Hosting**: Port 5000

### Using Emulators:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Set environment variables:
   ```
   VITE_USE_MOCK_DATA=false
   VITE_USE_FIREBASE=true
   VITE_USE_FIREBASE_EMULATORS=true
   ```
3. Start emulators: `npm run emulators`
4. Run application: `cd client && npm run dev`

## Production Deployment

To deploy to production with Firebase:

1. Make sure all pre-deployment checks pass: `npm run predeploy`
2. Create a Firebase project in the Firebase Console
3. Configure environment variables in Netlify
4. Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`
5. Deploy the application: `npm run deploy`

For detailed deployment instructions, see [FIREBASE_PRODUCTION.md](FIREBASE_PRODUCTION.md).

## Testing

The application includes tests for Firebase functionality:

### Integration Tests:
- `client/src/lib/firebase/tests/integration.test.ts` - Tests for Firebase integration
- `client/src/lib/firebase/tests/firebase.test.ts` - Tests for Firebase functionality

### Running Tests:
```bash
# Run unit tests
cd client && npm run test:unit

# Test environment setup
npm run test:env
```

## Troubleshooting

### Common Issues:

1. **"DEBUG is not defined" error**:
   - This is resolved in the implementation. The DEBUG variable is defined locally within functions.

2. **Mock data not loading**:
   - Check that `VITE_USE_MOCK_DATA=true` is set in your development environment.
   - Look for console errors related to Firebase initialization.

3. **Firebase emulators not connecting**:
   - Ensure Firebase CLI is installed: `npm install -g firebase-tools`
   - Check that emulators are running: `npm run emulators`
   - Verify environment variables are set correctly.

4. **TypeScript errors**:
   - Run `npm run check` to identify type issues.
   - Most common issues are related to implicit any types in mock implementations.

## Security Considerations

1. **Security Rules**:
   - Firestore and Storage security rules are defined in `firestore.rules` and `storage.rules`.
   - Rules enforce role-based access control and owner-based permissions.

2. **Environment Variables**:
   - Never commit Firebase API keys or credentials to the repository.
   - Use Netlify environment variables for sensitive information.

3. **Content Security Policy**:
   - The application uses a Content Security Policy that allows Firebase domains.
   - See `netlify.toml` for the full CSP configuration.

## Next Steps

1. **Add More Mock Data**:
   - Extend mock data with additional test cases.
   - Add edge case scenarios for better testing.

2. **Implement Cloud Functions**:
   - Add Firebase Cloud Functions for server-side logic.
   - Use the emulator for local testing.

3. **Add Analytics**:
   - Integrate Firebase Analytics for user tracking.
   - Use Firebase Performance Monitoring.

4. **Enhance Security**:
   - Review and refine security rules.
   - Implement more granular role-based access control.
