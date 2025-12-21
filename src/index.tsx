import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { initGA } from './utils/analytics';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Initialize Google Analytics
initGA();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

