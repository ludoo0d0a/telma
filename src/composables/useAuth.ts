import { ref, onMounted } from 'vue';
import axios from 'axios';
import googleDriveService from '@/services/googleDriveService';

interface User {
  [key: string]: any;
}

export const useAuth = () => {
  const user = ref<User | null>(null);

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

  onMounted(() => {
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
  });

  return {
    user,
    login,
    logout
  };
};

