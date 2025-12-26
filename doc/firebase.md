# Firebase Configuration

This document provides instructions on how to set up Firebase for this project.

## 1. Create a Firebase Project

1.  Go to the [Firebase console](https://console.firebase.google.com/).
2.  Click "Add project" and follow the on-screen instructions to create a new project.

## 2. Set up Authentication

1.  In the Firebase console, go to "Authentication" and then the "Sign-in method" tab.
2.  Enable the "Google" provider.

## 3. Set up Firestore Database

1.  In the Firebase console, go to "Firestore Database" and click "Create database".
2.  Choose your preferred mode:
   - **Production mode**: More secure, requires security rules (recommended)
   - **Test mode**: Allows read/write for 30 days (for development only)
3.  Select a location for your database (choose the closest region to your users).
4.  Click "Enable" to create the database.

### 3.1. Configure Firestore Security Rules

1.  Go to the "Rules" tab in Firestore Database.
2.  Update the rules to allow authenticated users to read and write their own favorites:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own favorites
    match /users/{userId}/favorites/{favoriteId} {
      // Allow read and write only if the user is authenticated and matches the userId
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3.  Click "Publish" to save the rules.

### 3.2. Firestore Collection Structure

The application uses the following Firestore structure:

```
users/
  └── {userId}/
      └── favorites/
          └── {favoriteId}/
              ├── id: string (document ID = favoriteId)
              ├── name: string
              ├── type: string
              └── addedAt: string (ISO 8601 timestamp)
```

**Important Notes:**
- Collections and documents are **automatically created** when the first favorite is added
- You don't need to manually create the `users` collection or subcollections
- Each user's favorites are stored in their own subcollection: `users/{userId}/favorites`
- The document ID is the favorite location ID (e.g., `stop_area:OCE:SA:87686006`)
- The `addedAt` field is automatically set when a favorite is created

**Example Document:**
```json
{
  "id": "stop_area:OCE:SA:87686006",
  "name": "Paris Gare du Nord",
  "type": "stop_area",
  "addedAt": "2025-01-15T10:30:00.000Z"
}
```

## 4. Set up Cloud Storage (Optional)

Cloud Storage is used for file storage (if needed). If you plan to use file storage features:

1.  In the Firebase console, go to "Storage" and click "Get started".
2.  Follow the on-screen instructions to create a new storage bucket.
3.  Go to the "Rules" tab and update the rules to allow authenticated users to read and write to their own files:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Get Firebase Configuration

1.  In the Firebase console, go to your project's settings (gear icon).
2.  Scroll down to the "Your apps" section.
3.  Click the web icon (`</>`) to add a new web app.
4.  Follow the on-screen instructions to register your app.
5.  You will be given a `firebaseConfig` object. Copy this object.

## 6. Configure Environment Variables

1.  Create a file named `.env` in the root of the project (if it doesn't exist).
2.  Add the following environment variables to the `.env` file, replacing the placeholder values with the values from your `firebaseConfig` object:

```
VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
VITE_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
```

**Note:** The `.env` file should be in your `.gitignore` to keep your credentials secure.

## 7. Update `src/firebase.ts`

The `src/firebase.ts` file should already be configured to use the environment variables:

```typescript
// TODO: Replace with your app's Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

## 8. Verify Setup

After completing the setup:

1. **Test Authentication:**
   - Run your application and try to sign in with Google
   - Verify that authentication works in the Firebase console under "Authentication" > "Users"

2. **Test Firestore:**
   - Add a favorite location in your application
   - Check the Firebase console under "Firestore Database" to verify:
     - The `users` collection is created
     - A subcollection `favorites` exists under your user ID
     - The favorite document is created with the correct structure

3. **Verify Security Rules:**
   - Try accessing another user's favorites (should be denied)
   - Verify that only authenticated users can read/write their own data

## Troubleshooting

### Collections Not Appearing

- **Firestore collections are created automatically** when the first document is written
- If you don't see collections, make sure:
  1. A user has successfully authenticated
  2. The user has added at least one favorite
  3. You're looking in the correct Firebase project

### Permission Denied Errors

- Check that Firestore security rules are properly configured
- Verify that the user is authenticated (`request.auth != null`)
- Ensure the user ID matches (`request.auth.uid == userId`)

### Authentication Issues

- Verify that Google Sign-in is enabled in Authentication settings
- Check that your Google OAuth client ID is correctly configured
- Ensure the `googleIdToken` is being stored in localStorage after login
