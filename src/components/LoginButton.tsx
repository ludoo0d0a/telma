
import React from 'react';
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
        <button className="button is-info is-rounded" onClick={() => handleLogin()}>
            <span className="icon">
                <LogIn />
            </span>
            <span>Sign in with Google</span>
        </button>
    );
};

export default LoginButton;
