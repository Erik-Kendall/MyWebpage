// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorblindProvider, useColorblind } from './contexts/ColorblindContext';
import TopNav from './components/TopNav'; // Assuming this is your NavigationBar
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
// Import your existing page components
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Games from './pages/Games';
import MadLibsAboutMe from './pages/MadLibsAboutMe.jsx'; // This seems to be your "Contact" page
import QuickLinks from './pages/QuickLinks';
import GamingTools from './pages/GamingTools';

// NEW IMPORTS for profile and user search features
import ProfilePage from './pages/ProfilePage'; // Your personal, editable profile
import PublicProfilePage from './pages/PublicProfilePage'; // The public view of a profile
import UserSearchPage from './pages/UserSearchPage'; // The page to search for other users
import ProtectedRoute from './components/ProtectedRoute'; // Essential for protecting routes
import AdminPanel from './pages/AdminPanel'; // NEW: Import AdminPanel

function AppContent() {
    const { colorblindMode } = useColorblind();

    return (
        <div className={`app-container${colorblindMode ? ' colorblind-mode' : ''}`} style={{ paddingTop: '4rem' }}>
            {/* TopNav is now your NavigationBar */}
            <TopNav />
            <main className="content-area" style={{ marginTop: '2rem', padding: '1rem', flexGrow: 1 }}>
                <Routes>
                    {/* Existing Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/contact" element={<MadLibsAboutMe />} /> {/* Your existing Contact route */}
                    <Route path="/quicklinks" element={<QuickLinks />} />
                    <Route path="/gamingtools" element={<GamingTools />} />
                    <Route path="/login" element={<LoginPage />} />
                    {/* <Route path="/profile" element={<ProfilePage />} /> Removed directly here, now protected */}

                    {/* NEW: Protected Profile Route */}
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />

                    {/* NEW: Public Profile Route - Not Protected */}
                    <Route path="/public-profile/:username" element={<PublicProfilePage />} />

                    {/* NEW: User Search Route - Not Protected (anyone can search) */}
                    <Route path="/users" element={<UserSearchPage />} />

                    {/* NEW: Admin Panel Route - Protected */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />

                    {/* Add other routes here as you build them */}
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <ColorblindProvider>
            <BrowserRouter>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </BrowserRouter>
        </ColorblindProvider>
    );
}

export default App;