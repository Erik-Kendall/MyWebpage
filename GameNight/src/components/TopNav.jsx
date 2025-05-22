// src/components/TopNav.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Make sure this path is correct

const TopNav = () => {
    // MODIFIED: Destructure isAdmin from useAuth()
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3.5rem',
                backgroundColor: '#222',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                zIndex: 1000,
                fontWeight: 'bold',
            }}
        >
            {/* Left side: Your existing navigation links */}
            <div style={{ display: 'flex', gap: '2rem' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Home
                </Link>
                <Link to="/schedule" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Schedule
                </Link>
                <Link to="/games" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Games
                </Link>
                <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
                    About Me
                </Link>
                <Link to="/quicklinks" style={{ color: 'inherit', textDecoration: 'none' }}>
                    QuickLinks
                </Link>
                <Link to="/gamingtools" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Gaming Tools
                </Link>
                {/* Link to the User Search Page */}
                <Link to="/users" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Find Users
                </Link>

                {/* NEW: Admin Panel Link - Only visible if isAdmin is true */}
                {isAdmin && (
                    <Link
                        to="/admin"
                        style={{
                            color: '#dc3545', // Red color to make it stand out as an admin link
                            textDecoration: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Admin Panel
                    </Link>
                )}
            </div>

            {/* Right side: Combined Profile/Welcome link and Logout button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                    <>
                        {/* Combined Welcome message and Profile Link */}
                        <Link
                            to="/profile"
                            style={{
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                border: '1px solid #007bff',
                                backgroundColor: '#007bff',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                            }}
                        >
                            Welcome, {user.username}! (Profile)
                        </Link>
                        <button
                            onClick={handleLogoutClick}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleLoginClick}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}
                    >
                        Login / Register
                    </button>
                )}
            </div>
        </nav>
    );
};

export default TopNav;