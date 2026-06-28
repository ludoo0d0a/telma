import { ref, provide, inject, onMounted } from 'vue';
import googleDriveService from '@/services/googleDriveService';
import axios from 'axios';

interface User {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextType {
  user: typeof user;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContextKey = Symbol('auth');

export const useAuthProvider = () => {
  const user = ref<User | null>(null);

  const loadUser = async (token: string) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      user.value = response.data;
      googleDriveService.setAccessToken(token);
    } catch (error) {
      console.error('Failed to load user', error);
      localStorage.removeItem('googleAccessToken');
      user.value = null;
    }
  };

  onMounted(() => {
    // Load user from localStorage on init
    const token = localStorage.getItem('googleAccessToken');
    if (token) {
      loadUser(token);
    }
  });

  const login = async (accessToken: string) => {
    localStorage.setItem('googleAccessToken', accessToken);
    await loadUser(accessToken);
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem('googleAccessToken');
  };

  const context = {
    user,
    login,
    logout
  };

  provide(AuthContextKey, context);

  return { user, login, logout };
};

export const useAuth = () => {
  const context = inject<{
    user: typeof user;
    login: (accessToken: string) => Promise<void>;
    logout: () => void;
  }>(AuthContextKey);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

