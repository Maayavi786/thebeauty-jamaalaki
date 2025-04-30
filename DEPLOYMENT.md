# Deployment Checklist

## Firebase Environment Variables
Make sure these are set in Netlify's environment settings:

- [ ] `VITE_FIREBASE_API_KEY` - Your Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)
- [ ] `VITE_USE_FIREBASE` - Set to "true"

## Netlify Functions Environment Variables (For Serverless Functions)
- [ ] `FIREBASE_PROJECT_ID` - Your Firebase project ID
- [ ] `FIREBASE_CLIENT_EMAIL` - Service account client email
- [ ] `FIREBASE_PRIVATE_KEY` - Service account private key (with double quotes)
- [ ] `EMAIL_USER` - Email account for sending notifications
- [ ] `EMAIL_PASSWORD` - Email account password
- [ ] `SENDER_EMAIL` - Email address for sending notifications

## Legacy Database Variables (if still using)
- [ ] `DATABASE_URL` - Your Neon database URL
- [ ] `SESSION_SECRET` - A secure random string
- [ ] `NODE_ENV` - Set to "production"
- [ ] `SENTRY_DSN` - Your Sentry project DSN
- [ ] `CORS_ALLOWED_ORIGINS` - Set to "https://thebeauty.netlify.app"

## Database
- [x] Database migrations are applied
- [x] Indexes are created
- [x] Database connection is tested

## Security
- [x] Session configuration is secure
- [x] CORS is properly configured
- [x] Cookies are secure and properly configured
- [x] Password hashing is implemented
- [x] Error handling is in place
- [ ] Firebase Security Rules are properly configured
- [ ] Content Security Policy allows Firebase domains
- [ ] Service account credentials are secured

## Monitoring
- [x] Sentry is configured
- [x] Error tracking is implemented
- [x] Performance monitoring is set up

## Build Configuration
- [x] Node version is set to 20
- [x] Build command is configured
- [ ] Firebase SDK is correctly imported
- [ ] Production environment file (.env.production) is configured
- [ ] Mock data is disabled for production
- [ ] Firebase emulators are disabled for production

## Firebase Configuration
- [ ] Firestore database is created
- [ ] Firebase Authentication is configured
- [ ] Firebase Storage is set up
- [ ] Security rules are deployed
- [ ] Indexes are created
- [ ] Billing alerts are configured (to stay within free tier)

## Netlify Functions
- [ ] Function dependencies are installed
- [ ] Functions directory is properly configured
- [ ] Functions are tested locally
- [ ] Function redirects are configured in netlify.toml
- [x] Publish directory is set
- [x] Functions directory is configured
- [x] Redirects are properly set up

## Pre-deployment Steps
1. Push all changes to GitHub
2. Monitor the build process in Netlify
3. Check for any build errors
4. Verify environment variables are set

## Post-deployment Verification
1. Test user registration
2. Test user login
3. Test salon creation
4. Test booking creation
5. Test review submission
6. Verify error tracking in Sentry
7. Check database connections
8. Verify CORS settings
9. Test session persistence

## Rollback Plan
If issues are encountered:
1. Identify the problem using Sentry logs
2. Revert to the last working commit if necessary
3. Check database migrations
4. Verify environment variables
5. Clear and rebuild the cache if needed

## Monitoring URLs
- Production: https://thebeauty.netlify.app
- Netlify Dashboard: https://app.netlify.com/sites/thebeauty
- Sentry Dashboard: Your-Sentry-URL
- Database Dashboard: Your-Neon-Dashboard-URL

## Support Contacts
- Database Issues: Neon Support
- Deployment Issues: Netlify Support
- Error Monitoring: Sentry Support 