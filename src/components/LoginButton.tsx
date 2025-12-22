
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { login } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasValidClientId = googleClientId && googleClientId.trim() !== '';

  // Don't render GoogleLogin if client ID is not configured
  if (!hasValidClientId) {
    return null;
  }

  return (
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
  );
};

export default LoginButton;
