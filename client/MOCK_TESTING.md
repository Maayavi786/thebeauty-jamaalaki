# Firebase Mock Testing Environment

This document explains how to use the Firebase mock testing environment to develop and test the application without connecting to a real Firebase backend.

## Overview

When developing locally, you can use the mock Firebase implementation to:

1. Test the UI without an internet connection
2. Develop without consuming Firebase quota
3. Work with predictable test data
4. Test edge cases and error handling

## How to Enable Mock Mode

Set the following environment variables in `.env.development`:

```
VITE_USE_MOCK_DATA=true
VITE_USE_FIREBASE_EMULATORS=false
VITE_USE_FIREBASE=true
```

## Visual Indicator

When mock mode is enabled, you'll see an orange "MOCK DATA MODE" indicator in the bottom right corner of the application. This helps you distinguish when you're using mock data versus real data.

## Available Mock Data

The mock environment includes sample data for:

- **Users**: Test customer and salon owner accounts
- **Salons**: Sample salon listings with images and business hours
- **Services**: Various salon services with prices and durations
- **Bookings**: Sample booking records
- **Reviews**: Sample customer reviews

## Mock Implementation Details

The mock system is implemented in:

- `client/src/lib/firebase/mockData.ts` - Sample data definitions
- `client/src/lib/firebase/localTesting.ts` - Mock Firebase service implementations
- `client/src/lib/queryClient.ts` - API request handler that uses mock data

## Extending Mock Data

To add new mock data or modify existing data:

1. Edit the appropriate arrays in `mockData.ts`
2. Update the helper functions if needed
3. No server restart required - changes take effect immediately

## Authentication in Mock Mode

When using mock mode:

- Default user: customer@example.com (customer role)
- Alternative user: owner@example.com (salon_owner role)
- Any password will work
- User state persists only for the current session

## Switching Back to Real Firebase

To use the real Firebase backend:

1. Set `VITE_USE_MOCK_DATA=false` in `.env.development`
2. Optionally, enable emulators with `VITE_USE_FIREBASE_EMULATORS=true` if you have them running locally
3. Restart the development server
