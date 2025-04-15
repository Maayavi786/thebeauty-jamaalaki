# Environment Variables Documentation

This document outlines all environment variables used in the Jamaalaki project.

## Required Production Variables

### Database Configuration
- `DATABASE_URL`
  - **Type**: URL
  - **Description**: Connection string for the PostgreSQL database (Neon)
  - **Format**: `postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require`
  - **Example**: `postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Security
- `SESSION_SECRET`
  - **Type**: String
  - **Description**: Secret key used for session encryption
  - **Format**: 64-byte hexadecimal string
  - **Example**: `8f451b67441a2fcd380bdaf3e82134e89e28071939c59f359cb62ca6f03e6333a6d042fb5849a759057efdff40db825c0a87135b604d3b314960e3c6d19b1230`

- `JWT_SECRET`
  - **Type**: String
  - **Description**: Secret key used for JWT token signing
  - **Format**: 32-byte hexadecimal string
  - **Example**: `684337a5035e9baa89d0b8f51f0cecc375b509cf71524ae22cddb3820ea77913`

### API Configuration
- `VITE_API_URL`
  - **Type**: URL
  - **Description**: Base URL for API requests
  - **Format**: `https://[your-domain]`
  - **Example**: 
    - Netlify: `https://jamaalaki.netlify.app`
    - Vercel: `https://[your-project-name].vercel.app`

- `VITE_WS_URL`
  - **Type**: URL
  - **Description**: WebSocket URL for real-time features
  - **Format**: `wss://[your-domain]`
  - **Example**:
    - Netlify: `wss://jamaalaki.netlify.app`
    - Vercel: `wss://[your-project-name].vercel.app`

### Environment
- `NODE_ENV`
  - **Type**: String
  - **Description**: Application environment
  - **Values**: `development` | `production` | `test`
  - **Default**: `development`
  - **Production Value**: `production`

## Optional Variables

### Server Configuration
- `PORT`
  - **Type**: String
  - **Description**: Port number for the server
  - **Default**: `5000`
  - **Example**: `5000`

## Development Only Variables

- `REPL_ID`
  - **Type**: String
  - **Description**: Used by Replit for development
  - **Note**: Not needed in production

## Setting Up Environment Variables

### Netlify
1. Go to Site settings > Environment variables
2. Add each variable with its corresponding value
3. Make sure to mark sensitive variables as "Sensitive"

### Vercel
1. Go to Project settings > Environment Variables
2. Add each variable with its corresponding value
3. Select the appropriate environments (Production, Preview, Development)

## Security Notes

1. Never commit sensitive environment variables to version control
2. Keep all secrets secure and rotate them periodically
3. Use different values for development and production environments
4. Make sure to set up proper CORS and security headers in production

## Validation

The application uses Zod schema validation for environment variables in `server/config.ts`. Make sure all required variables are properly set before deployment.

## Troubleshooting

If you encounter issues:
1. Verify all required variables are set
2. Check variable formats (especially URLs)
3. Ensure sensitive variables are properly marked in your deployment platform
4. Check deployment logs for any environment-related errors 