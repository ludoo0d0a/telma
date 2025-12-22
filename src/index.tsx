import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/index.scss';
import App from '@/App';
import { BrowserRouter } from 'react-router-dom';
import { initGA } from '@/utils/analytics';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Initialize Google Analytics
initGA();

// Log environment variables for verification
console.log('Environment Variables Check:');
console.log('VITE_GOOGLE_ADSENSE_ID:', import.meta.env.VITE_GOOGLE_ADSENSE_ID);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_SHOW_ADS:', import.meta.env.VITE_SHOW_ADS);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasValidClientId = googleClientId && googleClientId.trim() !== '';

const AppContent = () => (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </BrowserRouter>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        {hasValidClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
                <AppContent />
            </GoogleOAuthProvider>
        ) : (
            <AppContent />
        )}
    </React.StrictMode>
);

