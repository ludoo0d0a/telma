
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { TokenResponse } from '@react-oauth/google';
import googleDriveService from '@/services/googleDriveService';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (tokenResponse: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('googleAccessToken');
    if (token) {
        axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setUser(response.data);
            googleDriveService.setAccessToken(token);
        }).catch(() => {
            localStorage.removeItem('googleAccessToken');
        });
    }
  }, []);

  const login = async (tokenResponse: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
    localStorage.setItem('googleAccessToken', tokenResponse.access_token);
    googleDriveService.setAccessToken(tokenResponse.access_token);
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        setUser(response.data);
    } catch (error) {
        console.error("Failed to fetch user info", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('googleAccessToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
