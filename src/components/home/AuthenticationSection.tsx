import React from 'react';
import { Box, Typography } from '@mui/material';
import { LogIn } from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';

const AuthenticationSection: React.FC = () => {
    const { user } = useAuth();

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LogIn size={24} />
                Authentification
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                    <Typography sx={{ mb: 2 }}>
                        Connectez-vous pour accéder à des fonctionnalités supplémentaires.
                    </Typography>
                    {user ? <Avatar /> : <LoginButton />}
                </Box>
            </Box>
        </Box>
    );
};

export default AuthenticationSection;
