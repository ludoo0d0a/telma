
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import firebaseStorageService from '@/services/firebaseStorageService';

interface AuthContextType {
  user: any;
  login: (credentialResponse: CredentialResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('googleIdToken');
    if (token) {
        firebaseStorageService.signInWithGoogle(token)
        .then(() => {
            const userObject = JSON.parse(atob(token.split('.')[1]));
            setUser(userObject);
        }).catch(() => {
            localStorage.removeItem('googleIdToken');
        });
    }
  }, []);

  const login = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
        const idToken = credentialResponse.credential;
        await firebaseStorageService.signInWithGoogle(idToken);
        const userObject = JSON.parse(atob(idToken.split('.')[1]));
        setUser(userObject);
        localStorage.setItem('googleIdToken', idToken);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('googleIdToken');
    firebaseStorageService.signOut();
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
