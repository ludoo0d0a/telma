import React from 'react';
import { Button } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

const LoginButton: React.FC = () => {
    const { login } = useAuth();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const hasValidClientId = googleClientId && googleClientId.trim() !== '';

    const handleLogin = useGoogleLogin({
        onSuccess: tokenResponse => {
            login(tokenResponse);
        },
        onError: () => {
            console.log('Login Failed');
        },
        scope: 'https://www.googleapis.com/auth/drive.appdata'
    });

    if (!hasValidClientId) {
        return null;
    }

    return (
        <Button
            variant="contained"
            color="info"
            onClick={() => handleLogin()}
            startIcon={<LogIn size={18} />}
            sx={{ borderRadius: 8 }}
        >
            Sign in with Google
        </Button>
    );
};

export default LoginButton;
