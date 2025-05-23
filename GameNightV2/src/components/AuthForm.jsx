// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Import React Bootstrap components
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap'; // Added Spinner

const AuthForm = ({ mode, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsLoading(true); // Set loading to true

        let result;

        try {
            if (mode === 'login') {
                result = await login(username, password);
            } else if (mode === 'register') {
                result = await register(username, password);
            } else if (mode === 'forgot') {
                setMessage('Forgot password functionality not yet implemented.');
                console.log('Forgot password for:', username);
                setIsLoading(false); // Reset loading
                return;
            }

            if (result && result.success) {
                setMessage(result.message);
                // Redirect after a short delay to allow message to be seen, or immediately
                setTimeout(() => {
                    navigate('/profile'); // Redirect to the user's profile page
                }, 1000); // Redirect after 1 second
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
        <Card className="p-4" style={{ maxWidth: '400px', width: '100%' }}> {/* Use Card for a nice container */}
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
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                )}

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isLoading} // Disable button while loading
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
                    <Button variant="link" onClick={() => setMode('login')}>
                        Login
                    </Button>
                )}
                {mode !== 'register' && (
                    <Button variant="link" onClick={() => setMode('register')}>
                        Register
                    </Button>
                )}
                {mode !== 'forgot' && (
                    <Button variant="link" onClick={() => setMode('forgot')}>
                        Forgot Password
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default AuthForm;