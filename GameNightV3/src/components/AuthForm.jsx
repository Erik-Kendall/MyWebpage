// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Import React Bootstrap components
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const AuthForm = ({ mode, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsLoading(true); // Set loading to true

        // Client-side validation for registration
        if (mode === 'register') {
            if (password !== confirmPassword) {
                setMessage('Passwords do not match.');
                setIsLoading(false);
                return;
            }
            if (password.length < 6) { // Example: minimum password length
                setMessage('Password must be at least 6 characters long.');
                setIsLoading(false);
                return;
            }
            // Add other password validation rules here if needed (e.g., complexity)
        }

        let result;

        try {
            if (mode === 'login') {
                result = await login(username, password);
            } else if (mode === 'register') {
                // Pass confirmPassword to backend for server-side validation
                result = await register(username, password, confirmPassword);
            } else if (mode === 'forgot') {
                setMessage('Forgot password functionality not yet implemented.');
                console.log('Forgot password for:', username);
                setIsLoading(false);
                return;
            }

            if (result && result.success) {
                setMessage(result.message);
                setTimeout(() => {
                    navigate('/profile');
                }, 1000);
            } else if (result && result.message) {
                setMessage(result.message);
            } else {
                setMessage('An unexpected error occurred.');
            }
        } catch (error) {
            console.error("AuthForm submission error:", error);
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false); // Always reset loading
        }
    };

    return (
        <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}>
            <Card.Title className="text-center mb-4">
                {mode === 'login'
                    ? 'Login'
                    : mode === 'register'
                        ? 'Register'
                        : 'Forgot Password'}
            </Card.Title>

            {message && (
                <Alert variant={message.includes('success') ? 'success' : 'danger'}>
                    {message}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        value={username}
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>

                {mode !== 'forgot' && (
                    <>
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        {mode === 'register' && ( // Only show confirm password in register mode
                            <Form.Group className="mb-3" controlId="formConfirmPassword">
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    required
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>
                        )}
                    </>
                )}

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            {mode === 'login' ? 'Logging in...' : 'Registering...'}
                        </>
                    ) : (
                        mode === 'login'
                            ? 'Login'
                            : mode === 'register'
                                ? 'Register'
                                : 'Reset Password'
                    )}
                </Button>
            </Form>

            <div className="d-flex justify-content-between mt-3">
                {mode !== 'login' && (
                    <Button variant="link" onClick={() => { setMode('login'); setMessage(''); setUsername(''); setPassword(''); setConfirmPassword(''); }}> {/* Clear fields on mode change */}
                        Login
                    </Button>
                )}
                {mode !== 'register' && (
                    <Button variant="link" onClick={() => { setMode('register'); setMessage(''); setUsername(''); setPassword(''); setConfirmPassword(''); }}> {/* Clear fields on mode change */}
                        Register
                    </Button>
                )}
                {mode !== 'forgot' && (
                    <Button variant="link" onClick={() => { setMode('forgot'); setMessage(''); setUsername(''); setPassword(''); setConfirmPassword(''); }}> {/* Clear fields on mode change */}
                        Forgot Password
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default AuthForm;