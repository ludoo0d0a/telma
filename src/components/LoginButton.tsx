
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { login } = useAuth();

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
