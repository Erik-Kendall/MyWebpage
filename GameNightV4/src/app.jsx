import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

// Ensure these imports are correct and point to the right files
import { ColorblindProvider, useColorblind } from './contexts/ColorblindContext';
import { AuthProvider } from './contexts/AuthContext';
import { SecretsProvider, useSecrets } from './contexts/SecretsContext';

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

// NEW: Import Socket.IO client
import io from 'socket.io-client';

// NEW: Define your backend URL (where your Socket.IO server is running)
// IMPORTANT: Change this to your actual backend URL if different from 3001
const SOCKET_SERVER_URL = 'http://localhost:3001';

// Secret #12: The Unbound Current Konami Code - **NEW SEQUENCE: 'secret'**
const KONAMI_CODE_UNBOUND = [
    's', 'e', 'c', 'r', 'e', 't'
];

// This component *will* use the hooks, and it must be a child of the providers.
// This is effectively your "main application layout" component.
function MainApplicationLayout() {
    const { colorblindMode } = useColorblind();
    const [siteShakeOn, setSiteShakeOn] = useState(false);
    const [socket, setSocket] = useState(null); // State to hold the socket instance

    // Use secrets context
    const { incrementSecretsFound, isSecretFound } = useSecrets();
    const [konamiCodeSequenceUnbound, setKonamiCodeSequenceUnbound] = useState([]);

    // Effect to apply/remove the 'colorblind-mode' class to the <body> element
    useEffect(() => {
        if (colorblindMode) {
            document.body.classList.add('colorblind-mode');
        } else {
            document.body.classList.remove('colorblind-mode');
        }
    }, [colorblindMode]);

    // Effect to apply/remove the 'site-shake' class to the <body> element
    useEffect(() => {
        if (siteShakeOn) {
            document.body.classList.add('site-shake');
        } else {
            document.body.classList.remove('site-shake');
        }
    }, [siteShakeOn]);

    // Effect to establish Socket.IO connection
    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Frontend: Connected to Socket.IO server!');
        });

        newSocket.on('disconnect', () => {
            console.log('Frontend: Disconnected from Socket.IO server.');
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            console.log('Frontend: Disconnecting Socket.IO client.');
            newSocket.disconnect();
        };
    }, []);

    // Konami Code Listener for "The Unbound Current"
    useEffect(() => {
        const handleKonamiKeyDown = (event) => {
            const keyPressed = event.key.toLowerCase();
            console.log('Global Unbound Current Listener: Key pressed:', keyPressed);

            setKonamiCodeSequenceUnbound(prevSequence => {
                const expectedKey = KONAMI_CODE_UNBOUND[prevSequence.length];

                // If the pressed key matches the next expected key in the sequence
                if (keyPressed === expectedKey) {
                    const newSequence = [...prevSequence, keyPressed];
                    console.log('Global Unbound Current Listener: Sequence match, current:', newSequence.join(''));
                    // If the entire Konami Code has been entered
                    if (newSequence.length === KONAMI_CODE_UNBOUND.length) {
                        const secretId = 'secret-unbound-current';
                        if (!isSecretFound(secretId)) {
                            incrementSecretsFound(secretId);
                            console.log(`%cSecret Found! ID: ${secretId} (Global Unbound Current Konami Code)`, 'color: green; font-weight: bold;');
                            // Provide immediate visual feedback for testing
                            alert('Congratulations! Secret #12 (The Unbound Current) found via Global Konami Code!');
                            return [];
                        }
                        console.log(`%cSecret ID: ${secretId} already found.`, 'color: orange;');
                        return []; // Reset if already found or completed
                    }
                    return newSequence;
                } else {
                    // If the key doesn't match the *next* expected key, reset the sequence
                    // Unless it's the very first key of the sequence
                    if (keyPressed === KONAMI_CODE_UNBOUND[0]) {
                        console.log('Global Unbound Current Listener: Sequence reset, starting new with:', keyPressed);
                        return [keyPressed];
                    } else {
                        console.log('Global Unbound Current Listener: Sequence reset, mismatch on:', keyPressed);
                        return [];
                    }
                }
            });
        };

        window.addEventListener('keydown', handleKonamiKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKonamiKeyDown);
        };
    }, [incrementSecretsFound, isSecretFound]);

    return (
        <div className="app-container" style={{ paddingTop: '4rem' }}>
            <TopNav />
            {/* MODIFIED: Removed inline style from <main> element */}
            <main className="content-area">
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
        <AuthProvider>
            <ColorblindProvider>
                <SecretsProvider>
                    <MainApplicationLayout />
                </SecretsProvider>
            </ColorblindProvider>
        </AuthProvider>
    );
}

export default App;