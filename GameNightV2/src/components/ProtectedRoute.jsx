// D:\Game Night\website\src\components\ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is correctly located

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth(); // Get authentication status and loading state

    // While authentication status is being determined, you might want to show a loader
    if (loading) {
        // Or return null, or a simple "Loading..." message
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading authentication...</div>;
    }

    // If not authenticated, redirect to the login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the children (the protected component)
    return children;
};

export default ProtectedRoute;