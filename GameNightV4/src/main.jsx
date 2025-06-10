// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ColorblindProvider } from './contexts/ColorblindContext'; // Keep this one!
import App from './App';
import './App.css'; // Your global styles
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ColorblindProvider> {/* This is the SOLE ColorblindProvider */}
            <BrowserRouter>
                <AuthProvider>
                    <App /> {/* App and its children will now consume from the *outer* ColorblindProvider */}
                </AuthProvider>
            </BrowserRouter>
        </ColorblindProvider>
    </React.StrictMode>,
);