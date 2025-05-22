// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const AuthForm = ({ mode, setMode }) => { // Remove onSubmit prop, we'll use context directly
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // For success/error messages
    const { login, register } = useAuth(); // Get login and register functions from context
    const navigate = useNavigate(); // Get navigate function

    const handleSubmit = async (e) => { // Make handleSubmit async
        e.preventDefault();
        setMessage(''); // Clear previous messages

        let result; // To store the result from login/register call

        if (mode === 'login') {
            result = await login(username, password);
        } else if (mode === 'register') {
            result = await register(username, password);
        } else if (mode === 'forgot') {
            setMessage('Forgot password functionality not yet implemented.');
            console.log('Forgot password for:', username);
            return; // Exit as we don't have backend for this yet
        }

        if (result && result.success) {
            setMessage(result.message);
            // Redirection is handled by the AuthContext login/register functions
            // No need to navigate here directly unless you want different behavior
        } else if (result && result.message) {
            setMessage(result.message); // Display error message from backend
        } else {
            setMessage('An unexpected error occurred.'); // Generic error
        }
    };

    return (
        <div className="inset-border" style={{ maxWidth: '400px', margin: 'auto', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                {mode === 'login'
                    ? 'Login'
                    : mode === 'register'
                        ? 'Register'
                        : 'Forgot Password'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    placeholder="Username"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />

                {mode !== 'forgot' && (
                    <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                )}

                <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                    {mode === 'login'
                        ? 'Login'
                        : mode === 'register'
                            ? 'Register'
                            : 'Reset Password'}
                </button>

                {message && (
                    <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('success') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>
                )}
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {mode !== 'login' && (
                    <button
                        onClick={() => setMode('login')}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'transparent', color: '#007bff', cursor: 'pointer', marginRight: '10px' }}
                    >
                        Login
                    </button>
                )}
                {mode !== 'register' && (
                    <button
                        onClick={() => setMode('register')}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'transparent', color: '#007bff', cursor: 'pointer', marginRight: '10px' }}
                    >
                        Register
                    </button>
                )}
                {mode !== 'forgot' && (
                    <button
                        onClick={() => setMode('forgot')}
                        style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #007bff', backgroundColor: 'transparent', color: '#007bff', cursor: 'pointer' }}
                    >
                        Forgot Password
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthForm;