// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import AuthForm from '../components/AuthForm'; // Adjust path if AuthForm is elsewhere

const LoginPage = () => {
    // State to control whether the form shows login, register, or forgot password
    const [mode, setMode] = useState('login'); // Default to 'login'

    return (
        <div style={{
            paddingTop: '4.5rem', // Adjust based on your TopNav height
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 4.5rem)', // Fill remaining viewport height
            backgroundColor: '#f0f2f5' // Light background for the page
        }}>
            <AuthForm mode={mode} setMode={setMode} />
        </div>
    );
};

export default LoginPage;