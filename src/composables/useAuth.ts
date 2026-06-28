import { ref } from 'vue';
import axios from 'axios';
import googleDriveService from '@/services/googleDriveService';

interface TokenResponse {
  access_token: string;
}

// Shared state - using module-level refs for simplicity
// In a production app, consider using Pinia store
const user = ref<any>(null);

// Initialize on module load
const token = localStorage.getItem('googleAccessToken');
if (token) {
  axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    user.value = response.data;
    googleDriveService.setAccessToken(token);
  }).catch(() => {
    localStorage.removeItem('googleAccessToken');
  });
}

export const useAuth = () => {
  const login = async (tokenResponse: TokenResponse) => {
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

  return {
    user,
    login,
    logout,
  };
};

