// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    // NEW: Add isAuthenticated state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true'); // NEW: Initialize isAdmin from localStorage

    // This useEffect will run once when the component mounts
    // to check for an existing token and validate it.
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (token) {
                try {
                    const response = await fetch('http://localhost:3001/profile', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                    });

                    if (response.ok) {
                        const profileData = await response.json();
                        setUser({ id: profileData.id, username: profileData.username });
                        setIsAuthenticated(true);
                        // NEW: Set isAdmin based on profileData from the backend
                        setIsAdmin(profileData.isAdmin);
                        localStorage.setItem('isAdmin', profileData.isAdmin); // NEW: Store in localStorage
                    } else {
                        console.error('Initial token validation failed:', response.statusText);
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                        setIsAuthenticated(false); // Set isAuthenticated to false
                    }
                } catch (error) {
                    console.error('Error during initial authentication check:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false); // Set isAuthenticated to false on error
                }
            } else {
                setIsAuthenticated(false); // No token, so not authenticated
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser({ id: data.id, username: data.username });
                setIsAuthenticated(true);
                // NEW: Set isAdmin based on data from the backend
                setIsAdmin(data.isAdmin);
                localStorage.setItem('isAdmin', data.isAdmin); // NEW: Store in localStorage
                return { success: true, message: data.message };
            } else {
                setIsAuthenticated(false); // Ensure isAuthenticated is false on failed login
                return { success: false, message: data.message || 'Login failed.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            setIsAuthenticated(false); // Ensure isAuthenticated is false on network error
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    const register = async (username, password) => {
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Registration failed.' };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin'); // NEW: Clear isAdmin from localStorage on logout
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false); // NEW: Set isAdmin to false on logout
        console.log('Logged out');
    };

    const authContextValue = {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin, // NEW: Expose isAdmin
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};