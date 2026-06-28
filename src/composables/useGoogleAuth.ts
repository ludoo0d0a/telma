import { useAuth } from './useAuth';

export const useGoogleAuth = () => {
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = () => {
    if (!googleClientId || !googleClientId.trim()) {
      console.error('Google Client ID not configured');
      return;
    }

    // Load Google Identity Services script if not already loaded
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        initializeGoogleAuth();
      };
    } else {
      initializeGoogleAuth();
    }
  };

  const initializeGoogleAuth = () => {
    if (!(window as any).google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    (window as any).google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'https://www.googleapis.com/auth/drive.appdata openid email profile',
      callback: (response: any) => {
        if (response.access_token) {
          login({
            access_token: response.access_token,
          });
        }
      },
    }).requestAccessToken();
  };

  return {
    handleGoogleLogin,
  };
};

