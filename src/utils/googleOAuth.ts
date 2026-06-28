/**
 * Google OAuth helper for Vue
 * Uses Google Identity Services library
 */

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export const useGoogleLogin = (options: {
  onSuccess: (tokenResponse: TokenResponse) => void;
  onError?: () => void;
  scope?: string;
}) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleLogin = () => {
    if (!googleClientId) {
      console.error('Google Client ID is not configured');
      options.onError?.();
      return;
    }

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleLogin();
      };
      document.head.appendChild(script);
    } else {
      initGoogleLogin();
    }
  };

  const initGoogleLogin = () => {
    if (!window.google) {
      options.onError?.();
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: options.scope || 'https://www.googleapis.com/auth/drive.appdata',
      callback: (response: TokenResponse) => {
        if (response.access_token) {
          options.onSuccess(response);
        } else {
          options.onError?.();
        }
      },
      error_callback: () => {
        options.onError?.();
      }
    });
    
    client.requestAccessToken();
  };

  return handleLogin;
};

// Extend Window interface
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: () => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

