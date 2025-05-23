// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initial user state (id, username, isAdmin) from localStorage if available
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

    // Derive isAuthenticated and isAdmin dynamically
    const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);
    const isAdmin = useMemo(() => user?.isAdmin || false, [user]); // Access isAdmin from user object

    // Wrap updateUserData in useCallback
    const updateUserData = useCallback((newData) => {
        setUser(prevUser => {
            const updatedUser = prevUser ? { ...prevUser, ...newData } : newData;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []); // Empty dependency array means this function is created once and never changes

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
                        updateUserData({ id: profileData.id, username: profileData.username, isAdmin: profileData.isAdmin, profilePictureUrl: profileData.profilePictureUrl });
                    } else {
                        console.error('Initial token validation failed:', response.statusText);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error during initial authentication check:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, [token, updateUserData]); // updateUserData is now stable, so this is fine.

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
                const loggedInUser = {
                    id: data.userId,
                    username: data.username,
                    isAdmin: data.isAdmin,
                    profilePictureUrl: data.profilePictureUrl
                };
                updateUserData(loggedInUser);
                setToken(data.token);
                return { success: true, message: data.message };
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
                return { success: false, message: data.message || 'Login failed.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
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
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log('Logged out');
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