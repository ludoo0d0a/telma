import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { initGA } from './utils/analytics';

// Initialize Google Analytics
initGA();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

