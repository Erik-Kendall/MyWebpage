// src/components/TopNav.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './styles/TopNav.css'; // Import the new CSS file

const TopNav = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="top-nav">
            {/* Left side: Your existing navigation links */}
            <div className="top-nav-left">
                <Link to="/" className="top-nav-link">
                    Home
                </Link>
                <Link to="/schedule" className="top-nav-link">
                    Schedule
                </Link>
                <Link to="/games" className="top-nav-link">
                    Games
                </Link>
                <Link to="/contact" className="top-nav-link">
                    About Me
                </Link>
                <Link to="/quicklinks" className="top-nav-link">
                    QuickLinks
                </Link>
                <Link to="/gamingtools" className="top-nav-link">
                    Gaming Tools
                </Link>

                {/* MODIFIED: Link to the consolidated Search Page */}
                {user && ( // Only show Search link if user is logged in (as per ProtectedRoute)
                    <Link to="/search" className="top-nav-link">
                        Search
                    </Link>
                )}

                {/* NEW: Admin Panel Link - Only visible if isAdmin is true */}
                {isAdmin && (
                    <Link to="/admin" className="top-nav-admin-link">
                        Admin Panel
                    </Link>
                )}
            </div>

            {/* Right side: Combined Profile/Welcome link and Logout button */}
            <div className="top-nav-right">
                {user ? (
                    <>
                        {/* Combined Welcome message and Profile Link */}
                        <Link to="/profile" className="top-nav-profile-link">
                            Welcome, {user.username}! (Profile)
                        </Link>
                        <button onClick={handleLogoutClick} className="top-nav-button top-nav-logout-button">
                            Logout
                        </button>
                    </>
                ) : (
                    <button onClick={handleLoginClick} className="top-nav-button top-nav-login-button">
                        Login / Register
                    </button>
                )}
            </div>
        </nav>
    );
};

export default TopNav;