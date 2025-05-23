// src/App.jsx
import React, { useState } from 'react';
// REMOVE BrowserRouter from here: import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom'; // <--- ONLY KEEP Routes and Route

// Ensure these imports are correct and point to the right files
import { ColorblindProvider, useColorblind } from './contexts/ColorblindContext';
import { AuthProvider } from './contexts/AuthContext';

// Your components (keep all original imports)
import TopNav from './components/TopNav';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Games from './pages/Games';
import MadLibsAboutMe from './pages/MadLibsAboutMe.jsx';
import QuickLinks from './pages/QuickLinks';
import GamingTools from './pages/GamingTools';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';

// This component *will* use the hooks, and it must be a child of the providers.
// This is effectively your "main application layout" component.
function MainApplicationLayout() {
    // These hooks are now safely inside a component that will be rendered within the providers.
    const { colorblindMode } = useColorblind();
    const [siteShakeOn, setSiteShakeOn] = useState(false);

    return (
        <div className={`app-container${colorblindMode ? ' colorblind-mode' : ''} ${siteShakeOn ? 'site-shake' : ''}`} style={{ paddingTop: '4rem' }}>
            <TopNav />
            <main className="content-area" style={{ marginTop: '2rem', padding: '1rem', flexGrow: 1 }}>
                {/* Routes should be direct children of a Router (which is in main.jsx) */}
                <Routes>
                    <Route
                        path="/"
                        element={<Home setSiteShakeOn={setSiteShakeOn} />}
                    />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/contact" element={<MadLibsAboutMe />} />
                    <Route path="/quicklinks" element={<QuickLinks />} />
                    <Route path="/gamingtools" element={<GamingTools />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />

                    <Route path="/public-profile/:username" element={<PublicProfilePage />} />

                    <Route path="/search" element={
                        <ProtectedRoute>
                            <SearchPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

// This is your top-level App component exported to main.jsx
function App() {
    return (
        // ALL providers MUST wrap the component that consumes their context
        <ColorblindProvider>
            {/* REMOVE BrowserRouter from here, it's in main.jsx now */}
            {/* <BrowserRouter> */}
            <AuthProvider>
                {/* MainApplicationLayout now correctly sits inside all providers */}
                <MainApplicationLayout />
            </AuthProvider>
            {/* </BrowserRouter> */}
        </ColorblindProvider>
    );
}

export default App;