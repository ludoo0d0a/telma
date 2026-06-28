import { inject } from 'vue';

export function useGoogleLogin() {
  const googleClientId = inject<string>('googleClientId', import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

  const signIn = (onSuccess?: (tokenResponse: { access_token: string }) => void, onError?: () => void) => {
    if (!googleClientId || !googleClientId.trim()) {
      console.error('Google Client ID not configured');
      onError?.();
      return;
    }

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn(onSuccess, onError);
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn(onSuccess, onError);
    }
  };

  const initializeGoogleSignIn = (
    onSuccess?: (tokenResponse: { access_token: string }) => void,
    onError?: () => void
  ) => {
    if (!window.google) {
      onError?.();
      return;
    }

    window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.appdata openid email profile',
      callback: (tokenResponse: any) => {
        if (tokenResponse.access_token) {
          onSuccess?.(tokenResponse);
        } else {
          onError?.();
        }
      },
      error_callback: () => {
        console.log('Login Failed');
        onError?.();
      },
    }).requestAccessToken();
  };

  return {
    signIn,
  };
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

