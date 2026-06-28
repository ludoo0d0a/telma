import { ref, provide, inject, type App } from 'vue';
import axios from 'axios';
import googleDriveService from '@/services/googleDriveService';

interface User {
  [key: string]: any;
}

interface AuthContextType {
  user: any;
  login: (tokenResponse: { access_token: string }) => void;
  logout: () => void;
}

const AuthContextKey = Symbol('auth');

export function provideAuth(app: App) {
  const user = ref<any>(null);

  const loadUser = async () => {
    const token = localStorage.getItem('googleAccessToken');
    if (token) {
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        user.value = response.data;
        googleDriveService.setAccessToken(token);
      } catch {
        localStorage.removeItem('googleAccessToken');
      }
    }
  };

  // Load user on initialization
  loadUser();

  const login = async (tokenResponse: { access_token: string }) => {
    localStorage.setItem('googleAccessToken', tokenResponse.access_token);
    googleDriveService.setAccessToken(tokenResponse.access_token);
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      user.value = response.data;
    } catch (error) {
      console.error("Failed to fetch user info", error);
    }
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem('googleAccessToken');
  };

  const authContext: AuthContextType = {
    user,
    login,
    logout,
  };

  app.provide(AuthContextKey, authContext);
}

export function useAuth(): AuthContextType {
  const context = inject<AuthContextType>(AuthContextKey);
  if (!context) {
    throw new Error('useAuth must be used within an app that provides auth');
  }
  return context;
}

