# Firebase Configuration

This document provides instructions on how to set up Firebase for this project.

## 1. Create a Firebase Project

1.  Go to the [Firebase console](https://console.firebase.google.com/).
2.  Click "Add project" and follow the on-screen instructions to create a new project.

## 2. Set up Authentication

1.  In the Firebase console, go to "Authentication" and then the "Sign-in method" tab.
2.  Enable the "Google" provider.

## 3. Set up Cloud Storage

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

## 4. Get Firebase Configuration

1.  In the Firebase console, go to your project's settings.
2.  In the "Your apps" card, click the web icon (`</>`) to add a new web app.
3.  Follow the on-screen instructions to register your app.
4.  You will be given a `firebaseConfig` object. Copy this object.

## 5. Configure Environment Variables

1.  Create a file named `.env` in the root of the project.
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

## 6. Update `src/firebase.ts`

Update the `src/firebase.ts` file to use the environment variables:

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
