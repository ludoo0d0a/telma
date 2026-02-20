import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/index.scss';
import App from '@/App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import { initGA } from '@/utils/analytics';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Initialize Google Analytics
initGA();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GoogleOAuthProvider clientId={googleClientId}>
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </BrowserRouter>
            </GoogleOAuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);
