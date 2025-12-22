import React from 'react';
import { LogIn } from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';

const AuthenticationSection: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className='mb-6'>
            <h2 className='title is-3 mb-4'>
                <span className='icon mr-2'>
                    <LogIn size={24} />
                </span>
                Authentification
            </h2>
            <div className='columns is-centered'>
                <div className='column is-half has-text-centered'>
                    <p className='mb-4'>Connectez-vous pour accéder à des fonctionnalités supplémentaires.</p>
                    {user ? <Avatar /> : <LoginButton />}
                </div>
            </div>
        </div>
    );
};

export default AuthenticationSection;

