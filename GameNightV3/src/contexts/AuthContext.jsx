// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

const BASE_API_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
    const initialUser = () => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    };

    const [user, setUser] = useState(initialUser);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);
    const isAdmin = useMemo(() => user?.isAdmin || false, [user]);

    const updateUserData = useCallback((newData) => {
        setUser(prevUser => {
            const updatedUser = prevUser ? { ...prevUser, ...newData } : newData;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('User data updated and stored in localStorage:', updatedUser);
            return updatedUser;
        });
    }, []);

    useEffect(() => {
        const checkAuthStatus = async () => {
            console.log('useEffect: checkAuthStatus initiated. Current token:', token);
            if (token) {
                try {
                    const response = await fetch(`${BASE_API_URL}/users`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                    });

                    console.log('useEffect: /api/users response status:', response.status);
                    const responseText = await response.text();
                    console.log('useEffect: Raw response for /api/users:', responseText);

                    if (response.ok) {
                        const profileData = JSON.parse(responseText);
                        updateUserData({
                            id: profileData.id,
                            username: profileData.username,
                            isAdmin: profileData.isAdmin,
                            profilePictureUrl: profileData.profilePictureUrl
                        });
                        console.log('useEffect: Token validated, user data set:', profileData.username);
                    } else {
                        console.error('useEffect: Initial token validation failed. Status:', response.status, 'Response:', responseText);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                        console.log('useEffect: Token validation failed, token and user removed from localStorage.');
                    }
                } catch (error) {
                    console.error('useEffect: Error during initial authentication check (catch block):', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                    console.log('useEffect: Error in catch block, token and user removed from localStorage.');
                }
            } else {
                console.log('useEffect: No token found in localStorage on startup.');
            }
            setLoading(false);
            console.log('useEffect: checkAuthStatus finished. Loading set to false.');
        };

        checkAuthStatus();
    }, [token, updateUserData]);

    const login = async (username, password) => {
        console.log('Attempting login for:', username);
        try {
            const response = await fetch(`${BASE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const responseText = await response.text();
            console.log('Login Response Status:', response.status);
            console.log('Login Raw Response Text:', responseText);

            const data = JSON.parse(responseText);

            if (response.ok) {
                console.log('Login successful. Attempting to store token:', data.token);
                localStorage.setItem('token', data.token);
                const loggedInUser = {
                    id: data.userId,
                    username: data.username,
                    isAdmin: data.isAdmin,
                    profilePictureUrl: data.profilePictureUrl
                };
                updateUserData(loggedInUser);
                setToken(data.token);
                console.log('Token and user state updated after login. Token in state:', token);
                return { success: true, message: data.message };
            } else {
                console.error('Login failed. Response:', data.message || responseText);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
                console.log('Login failed, token and user removed from localStorage.');
                return { success: false, message: data.message || 'Login failed.' };
            }
        } catch (error) {
            console.error('Login error (catch block):', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            console.log('Login error in catch block, token and user removed from localStorage.');
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    // MODIFIED: Added confirmPassword parameter
    const register = async (username, password, confirmPassword) => {
        console.log('Attempting registration for:', username);
        try {
            const response = await fetch(`${BASE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // MODIFIED: Include confirmPassword in the request body
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            const responseText = await response.text();
            console.log('Register Response Status:', response.status);
            console.log('Register Raw Response Text:', responseText);
            const data = JSON.parse(responseText);

            if (response.ok) {
                console.log('Registration successful:', data.message);
                return { success: true, message: data.message };
            } else {
                console.error('Registration failed. Response:', data.message || responseText);
                return { success: false, message: data.message || 'Registration failed.' };
            }
        } catch (error) {
            console.error('Register error (catch block):', error);
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log('Logged out, token and user removed from localStorage.');
    };

    const authContextValue = {
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUserData,
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