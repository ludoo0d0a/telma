# Google OAuth2 Setup Guide with @react-oauth/google

This app has been configured with Google OAuth2 authentication using the `@react-oauth/google` library. Follow these steps to set up Google Sign-In for your application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** for reference

## Step 2: Configure OAuth Consent Screen

Before creating OAuth credentials, you need to configure the OAuth consent screen:

1. In the Google Cloud Console, navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact email
4. Add scopes (at minimum, `email` and `profile`)
5. Add test users if your app is in testing mode
6. Save and continue through the steps

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Give it a descriptive name (e.g., "Telma Web App")
   - Authorized JavaScript origins:
     - For development: `http://localhost:5173` (or your dev port)
     - For production: `https://telma.geoking.fr`
   - Authorized redirect URIs:
     - For development: `http://localhost:5173` (or your dev port)
     - For production: `https://telma.geoking.fr`
   - Click **Create**
4. Copy your **Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add your Google OAuth Client ID to the `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

3. Replace `your_client_id_here.apps.googleusercontent.com` with your actual Client ID from Step 3 (the OAuth 2.0 Client ID you just created)

4. **Important**: The `.env` file should already be in `.gitignore` - never commit your actual Client ID to version control

## Step 5: Verify Installation

The `@react-oauth/google` package should already be installed. Verify it's in your `package.json`:

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.13.0"
  }
}
```

If it's not installed, run:
```bash
npm install @react-oauth/google
```

## Step 6: Implementation Overview

The OAuth2 implementation consists of three main parts:

### 1. Provider Setup (`src/index.tsx`)

The `GoogleOAuthProvider` wraps your entire application:

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  {/* Your app components */}
</GoogleOAuthProvider>
```

### 2. Login Component (`src/components/LoginButton.tsx`)

The `GoogleLogin` component handles the authentication flow:

```tsx
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={credentialResponse => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
    }
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
```

### 3. Auth Context (`src/contexts/AuthContext.tsx`)

The `AuthContext` manages user state and JWT token:

- Stores the JWT token in localStorage
- Decodes the JWT to extract user information
- Provides `login`, `logout`, and `user` state throughout the app

## Step 7: Using Authentication in Your Components

To use authentication in any component:

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginButton />
      )}
    </div>
  );
};
```

## Environment Variables

The app uses Vite environment variables. Important notes:

- Variables must be prefixed with `VITE_` to be exposed to the client
- The `.env` file should be in `.gitignore` (never commit your actual Client ID)
- **Restart your dev server** after changing `.env` file (Vite needs a restart to pick up new env vars)

### Required Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### Optional Environment Variables (for other features)

```env
VITE_API_KEY=your_sncf_api_key
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXX
```

## Testing

### Development Testing

1. Make sure your `.env` file has `VITE_GOOGLE_CLIENT_ID` set
2. Restart your dev server: `npm start`
3. Navigate to a page with the login button
4. Click the Google Sign-In button
5. You should see the Google sign-in popup
6. After successful login, the user information should be stored

### Production Testing

1. Make sure your production environment has `VITE_GOOGLE_CLIENT_ID` set
2. Verify your production domain is added to **Authorized JavaScript origins** in Google Cloud Console
3. Test the login flow on your production site

## Troubleshooting

### Login button not showing

- Check that `@react-oauth/google` is installed: `npm list @react-oauth/google`
- Verify `GoogleOAuthProvider` wraps your app in `src/index.tsx`
- Check browser console for errors

### "Invalid client" error

- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly in `.env`
- Make sure you restarted your dev server after creating/updating `.env`
- Verify the Client ID matches exactly what's in Google Cloud Console
- Check that your domain/origin is added to **Authorized JavaScript origins**

### "redirect_uri_mismatch" error

- Go to Google Cloud Console > Credentials
- Edit your OAuth 2.0 Client ID
- Add your current URL (including port for dev) to **Authorized redirect URIs**
- Save and wait a few minutes for changes to propagate

### Environment variable not working

- Remember that Vite requires the `VITE_` prefix
- Restart your dev server after changing `.env` file
- Verify the variable name is exactly `VITE_GOOGLE_CLIENT_ID`
- Check that `.env` is in the root directory, not in `src/`

### Token not persisting

- Check browser localStorage (DevTools > Application > Local Storage)
- Verify `AuthContext` is properly implemented
- Check that `login` function is being called with the credential

### User information not available

- The JWT token is decoded using `jwt-decode` library
- Verify the token structure matches what `jwtDecode` expects
- Check that `AuthContext` is properly decoding the token

## Security Considerations

1. **Never commit Client IDs to version control** - Always use `.env` file and ensure it's in `.gitignore`
2. **Use HTTPS in production** - OAuth2 requires secure connections
3. **Validate tokens on backend** - If you have a backend, always validate the JWT token server-side
4. **Set proper redirect URIs** - Only allow your actual domains in Google Cloud Console
5. **Review OAuth consent screen** - Make sure users understand what permissions they're granting

## Additional Resources

- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

For OAuth2-specific issues:
- Check the [Google Identity Services documentation](https://developers.google.com/identity/gsi/web)
- Review [@react-oauth/google GitHub issues](https://github.com/MomenSherif/react-oauth/issues)
- Check browser console for detailed error messages

