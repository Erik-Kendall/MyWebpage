// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

const BASE_API_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
    // Initialize token and user from localStorage directly once
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    });
    const [loading, setLoading] = useState(true); // Still true initially until status is checked

    const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);
    const isAdmin = useMemo(() => user?.isAdmin || false, [user]);

    const updateUserData = useCallback((newData) => {
        setUser(prevUser => {
            const updatedUser = prevUser ? { ...prevUser, ...newData } : newData;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('AuthContext: User data updated and stored in localStorage:', updatedUser);
            return updatedUser;
        });
    }, []);

    // This useEffect runs only once on mount to check initial auth status
    useEffect(() => {
        const checkAuthStatus = async () => {
            const storedToken = localStorage.getItem('token');
            console.log('AuthContext useEffect: checkAuthStatus initiated. Stored token:', storedToken ? 'present' : 'absent');

            if (storedToken) { // Only attempt validation if a token actually exists in localStorage
                try {
                    const response = await fetch(`${BASE_API_URL}/users`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${storedToken}` // Use storedToken directly
                        },
                    });

                    console.log('AuthContext useEffect: /api/users response status:', response.status);
                    const responseText = await response.text();
                    console.log('AuthContext useEffect: Raw response for /api/users:', responseText);

                    if (response.ok) {
                        const profileData = JSON.parse(responseText);
                        // Only update state if data is valid
                        setToken(storedToken); // Ensure token state is consistent with localStorage
                        updateUserData({
                            id: profileData.id,
                            username: profileData.username,
                            isAdmin: profileData.isAdmin,
                            profilePictureUrl: profileData.profilePictureUrl
                        });
                        console.log('AuthContext useEffect: Token validated, user data set:', profileData.username);
                    } else {
                        // If validation fails, clear token and user
                        console.error('AuthContext useEffect: Initial token validation failed. Status:', response.status, 'Response:', responseText);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null); // Explicitly set user to null
                        console.log('AuthContext useEffect: Token validation failed, token and user removed from localStorage.');
                    }
                } catch (error) {
                    console.error('AuthContext useEffect: Error during initial authentication check (catch block):', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null); // Explicitly set user to null
                    console.log('AuthContext useEffect: Error in catch block, token and user removed from localStorage.');
                }
            } else {
                console.log('AuthContext useEffect: No token found in localStorage on initial startup.');
                // No token to validate, so set loading to false.
                // Token and user are already null/empty from initial state.
            }
            setLoading(false); // Always set loading to false after the check, regardless of outcome
            console.log('AuthContext useEffect: checkAuthStatus finished. Loading set to false.');
        };

        checkAuthStatus();
    }, []); // <-- CRITICAL CHANGE: Empty dependency array. Runs only once on mount.

    const login = async (username, password) => {
        console.log('AuthContext: Attempting login for:', username);
        try {
            const response = await fetch(`${BASE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const responseText = await response.text();
            console.log('AuthContext: Login Response Status:', response.status);
            console.log('AuthContext: Login Raw Response Text:', responseText);

            const data = JSON.parse(responseText);

            if (response.ok) {
                console.log('AuthContext: Login successful. Attempting to store token:', data.token);
                localStorage.setItem('token', data.token);
                // Ensure user data has consistent structure
                const loggedInUser = {
                    id: data.userId, // Assuming backend provides userId
                    username: data.username,
                    isAdmin: data.isAdmin,
                    profilePictureUrl: data.profilePictureUrl
                };
                updateUserData(loggedInUser); // Update localStorage and user state via this
                setToken(data.token); // Update token state
                console.log('AuthContext: Token and user state updated after login.');
                return { success: true, message: data.message };
            } else {
                console.error('AuthContext: Login failed. Response:', data.message || responseText);
                // If login fails, ensure everything is cleared
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
                console.log('AuthContext: Login failed, token and user removed from localStorage.');
                return { success: false, message: data.message || 'Login failed.' };
            }
        } catch (error) {
            console.error('AuthContext: Login error (catch block):', error);
            // If network error, ensure everything is cleared
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            console.log('AuthContext: Login error in catch block, token and user removed from localStorage.');
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    const register = async (username, password, confirmPassword) => {
        console.log('AuthContext: Attempting registration for:', username);
        try {
            const response = await fetch(`${BASE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            const responseText = await response.text();
            console.log('AuthContext: Register Response Status:', response.status);
            console.log('AuthContext: Register Raw Response Text:', responseText);
            const data = JSON.parse(responseText);

            if (response.ok) {
                console.log('AuthContext: Registration successful:', data.message);
                return { success: true, message: data.message };
            } else {
                console.error('AuthContext: Registration failed. Response:', data.message || responseText);
                return { success: false, message: data.message || 'Registration failed.' };
            }
        } catch (error) {
            console.error('AuthContext: Register error (catch block):', error);
            return { success: false, message: 'Network error. Could not connect to server.' };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log('AuthContext: Logged out, token and user removed from localStorage.');
    }, []); // useCallback for logout as it's not dependent on other states for its logic

    const authContextValue = useMemo(() => ({
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUserData,
    }), [user, token, loading, isAuthenticated, isAdmin, login, register, logout, updateUserData]);


    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};