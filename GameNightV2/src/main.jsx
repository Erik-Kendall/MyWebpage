// src/main.jsx (or index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ColorblindProvider } from './contexts/ColorblindContext';
import App from './App';
import './App.css'; // Your global styles
import 'bootstrap/dist/css/bootstrap.min.css'; // <--- ADD/CONFIRM THIS LINE

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ColorblindProvider>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </ColorblindProvider>
    </React.StrictMode>,
);