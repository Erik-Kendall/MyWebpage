// D:\Game Night\website\src\pages\ProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Tabs, Tab, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Import the new sub-components
import ProfileInfoTab from '../components/Profile/ProfileInfoTab';
import SocialMediaTab from '../components/Profile/SocialMediaTab';
import AccountSettingsTab from '../components/Profile/AccountSettingsTab';
import FriendsTab from '../components/Profile/FriendsTab';
import GameLibraryTab from '../components/Profile/GameLibraryTab';


const ProfilePage = () => {
    const { user, token, updateUserData } = useAuth();

    // --- MAIN PROFILE DATA STATES ---
    const [profileData, setProfileData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        favoriteGames: '',
        profilePictureUrl: null,
        bio: '',
        socialMediaLinks: []
    });
    const [originalProfileData, setOriginalProfileData] = useState(null); // To track changes for saving
    const [loading, setLoading] = useState(true); // Overall page loading state
    const [error, setError] = useState('');       // Overall page error state
    const [message, setMessage] = useState(''); // General success message for profile tab
    const [messageType, setMessageType] = useState('success');

    // --- PROFILE PICTURE STATES ---
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);

    // --- TABS STATE ---
    const [activeTab, setActiveTab] = useState('profile');

    // --- FRIENDS MANAGEMENT STATES ---
    const [friendsList, setFriendsList] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false); // Specific loading for friends tab
    const [friendsError, setFriendsError] = useState('');
    const [friendsMessage, setFriendsMessage] = useState('');
    const [friendsMessageType, setFriendsMessageType] = useState('success');

    // --- GAME LIBRARY MANAGEMENT STATES ---
    const [userGames, setUserGames] = useState([]);
    const [gamesLoading, setGamesLoading] = useState(false); // Specific loading for games tab
    const [gamesError, setGamesError] = useState('');
    const [gamesMessage, setGamesMessage] = useState('');
    const [gamesMessageType, setGamesMessageType] = useState('success');
    const [newGameTitle, setNewGameTitle] = useState('');
    const [newGameNotes, setNewGameNotes] = useState('');
    const [newGameStatus, setNewGameStatus] = useState('owned');
    const [editingGameId, setEditingGameId] = useState(null);
    const [editGameTitle, setEditGameTitle] = useState('');
    const [editGameNotes, setEditGameNotes] = useState('');
    const [editGameStatus, setEditGameStatus] = useState('');

    // --- SOCIAL MEDIA LINK MANAGEMENT STATES ---
    const [editingLinkIndex, setEditingLinkIndex] = useState(null);
    const [newLinkPlatform, setNewLinkPlatform] = useState('website');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [linkMessage, setLinkMessage] = useState('');
    const [linkMessageType, setLinkMessageType] = useState('success');

    // --- ACCOUNT SETTINGS STATES (for username and password change) ---
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [accountMessage, setAccountMessage] = useState('');
    const [accountMessageType, setAccountMessageType] = useState('success');


    // ----------------------------------------------------
    //                 FETCHING FUNCTIONS
    //    (Kept here as they manage primary page states)
    // ----------------------------------------------------

    // Fetch user profile data
    const fetchProfileData = useCallback(async () => {
        setError(''); // Clear main page error

        try {
            if (!token) {
                console.error("fetchProfileData: No token available for fetching profile data.");
                setError("Authentication token not found. Please log in.");
                return;
            }

            const response = await fetch('http://localhost:3001/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const contentType = response.headers.get("content-type");
            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Server error (${response.status}): ${responseText}`;
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (jsonError) {
                        console.warn("fetchProfileData: Could not parse error JSON:", jsonError);
                    }
                }
                throw new Error(errorMessage);
            }

            const data = JSON.parse(responseText);
            setProfileData({
                username: data.username || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                favoriteGames: data.favoriteGames || '',
                profilePictureUrl: data.profilePictureUrl || null,
                bio: data.bio || '',
                socialMediaLinks: data.socialMediaLinks || []
            });
            setOriginalProfileData({ ...data }); // Store original data for comparison
        } catch (err) {
            console.error('fetchProfileData: Error fetching profile:', err);
            setError(err.message || 'An error occurred while fetching profile data.');
        }
    }, [token]);


    // Fetch friends data
    const fetchFriendsData = useCallback(async () => {
        setFriendsLoading(true);
        setFriendsError('');
        setFriendsMessage('');

        try {
            if (!token) {
                setFriendsError('Not authenticated to view friends.');
                return;
            }

            const friendsResponse = await fetch('http://localhost:3001/api/friends', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const contentType = friendsResponse.headers.get('Content-Type');
            const friendsResponseText = await friendsResponse.text();

            if (!friendsResponse.ok) {
                let errorMessage = `Server error (${friendsResponse.status}): ${friendsResponseText}`;
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const friendsErrorData = JSON.parse(friendsResponseText);
                        errorMessage = friendsErrorData.message || errorMessage;
                    } catch (jsonError) {
                        console.warn("fetchFriendsData: Could not parse error JSON:", jsonError);
                    }
                }
                throw new Error(errorMessage);
            }
            const friendsData = JSON.parse(friendsResponseText);

            setFriendsList(friendsData.friends || []);
            setIncomingRequests(friendsData.incomingRequests || []);
            setOutgoingRequests(friendsData.outgoingRequests || []);

        } catch (err) {
            console.error('fetchFriendsData: Error fetching friends data (all types):', err);
            setFriendsError(err.message || 'An error occurred while fetching friends information.');
        } finally {
            setFriendsLoading(false);
        }
    }, [token]);


    // Fetch user games data
    const fetchUserGames = useCallback(async () => {
        setGamesLoading(true);
        setGamesError('');
        setGamesMessage('');

        try {
            if (!token) {
                setGamesError('Not authenticated to view game library.');
                return;
            }
            const response = await fetch('http://localhost:3001/api/games/my-games', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const contentType = response.headers.get("content-type");
            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Server error (${response.status}): ${responseText}`;
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (jsonError) {
                        console.warn("fetchUserGames: Could not parse error JSON:", jsonError);
                    }
                }
                throw new Error(errorMessage);
            }
            const data = JSON.parse(responseText);
            setUserGames(data || []);
        } catch (err) {
            console.error('fetchUserGames: Error fetching user games:', err);
            setGamesError(err.message || 'An error occurred while fetching game library.');
        } finally {
            setGamesLoading(false);
        }
    }, [token]);


    // Master useEffect to fetch all data when component mounts or token changes
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true); // Start overall page loading
            setError(''); // Clear overall page error

            // Use Promise.all to fetch all data concurrently
            await Promise.all([
                fetchProfileData(),
                fetchFriendsData(),
                fetchUserGames()
            ]).catch(err => {
                // Individual fetch functions set their own errors, but this catches unhandled promise rejections
                console.error("loadAllData: An unhandled error occurred during parallel data fetching:", err);
            }).finally(() => {
                setLoading(false); // Stop overall page loading once all fetches are done
                console.log('loadAllData: All data fetching attempts completed. Overall loading set to false.');
            });
        };

        if (token) {
            loadAllData();
        } else {
            setLoading(false);
            // Clear all data if not authenticated
            setProfileData({
                username: '', firstName: '', lastName: '', favoriteGames: '',
                profilePictureUrl: null, bio: '', socialMediaLinks: []
            });
            setFriendsList([]);
            setIncomingRequests([]);
            setOutgoingRequests([]);
            setUserGames([]);
            setError("User not authenticated. Please log in.");
            console.log('loadAllData: No token found, user not authenticated. Cleared data and set loading to false.');
        }
        // Cleanup function for object URLs if any
        return () => {
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
            }
        };
    }, [token, fetchProfileData, fetchFriendsData, fetchUserGames, profilePicPreview]); // Dependencies


    // General form change handler for ProfileInfoTab
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // Profile picture change handler for ProfileInfoTab
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            setProfilePicPreview(URL.createObjectURL(file));
        } else {
            setProfilePicFile(null);
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
            }
            setProfilePicPreview(null);
        }
    };


    // ----------------------------------------------------
    //                     RENDER LOGIC
    // ----------------------------------------------------

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <p>Loading profile...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">
                    Error loading profile: {error}
                </Alert>
            </Container>
        );
    }

    if (!user) { // Should technically be caught by `if (error)` above if token is missing
        return (
            <Container className="mt-5 text-center">
                <Alert variant="info">
                    Please log in to view your profile.
                </Alert>
                <Button as={Link} to="/login" variant="primary" className="mt-3">Log In</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <h2 className="mb-4">My Profile</h2>

                    <Tabs
                        id="profile-friends-games-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => {
                            setActiveTab(k);
                            // Clear messages specific to other tabs when switching
                            setMessage(''); setMessageType('success');
                            setAccountMessage(''); setAccountMessageType('success');
                            setFriendsMessage(''); setFriendsMessageType('success');
                            setGamesMessage(''); setGamesMessageType('success');
                            setLinkMessage(''); setLinkMessageType('success');

                            // Optionally re-fetch data for a tab when it becomes active
                            if (k === 'friends') {
                                fetchFriendsData();
                            } else if (k === 'games') {
                                fetchUserGames();
                            }
                        }}
                        className="mb-3"
                    >
                        {/* Profile Tab */}
                        <Tab eventKey="profile" title="My Profile">
                            <ProfileInfoTab
                                profileData={profileData}
                                originalProfileData={originalProfileData}
                                token={token}
                                updateUserData={updateUserData}
                                message={message}
                                messageType={messageType}
                                error={error}
                                handleChange={handleChange}
                                profilePicFile={profilePicFile}
                                profilePicPreview={profilePicPreview}
                                handleProfilePicChange={handleProfilePicChange}
                                setMessage={setMessage}
                                setMessageType={setMessageType}
                                setError={setError}
                                setProfileData={setProfileData}
                                setOriginalProfileData={setOriginalProfileData}
                                setProfilePicFile={setProfilePicFile}
                                setProfilePicPreview={setProfilePicPreview}
                            />
                        </Tab>

                        {/* Social Media Links Tab */}
                        <Tab eventKey="socialMedia" title="Social Media & Links">
                            <SocialMediaTab
                                profileData={profileData}
                                token={token}
                                fetchProfileData={fetchProfileData}
                                linkMessage={linkMessage}
                                linkMessageType={linkMessageType}
                                editingLinkIndex={editingLinkIndex}
                                newLinkPlatform={newLinkPlatform}
                                newLinkUrl={newLinkUrl}
                                setLinkMessage={setLinkMessage}
                                setLinkMessageType={setLinkMessageType}
                                setEditingLinkIndex={setEditingLinkIndex}
                                setNewLinkPlatform={setNewLinkPlatform}
                                setNewLinkUrl={setNewLinkUrl}
                                setProfileData={setProfileData}
                            />
                        </Tab>

                        {/* Account Settings Tab */}
                        <Tab eventKey="accountSettings" title="Account Settings">
                            <AccountSettingsTab
                                token={token}
                                updateUserData={updateUserData}
                                fetchProfileData={fetchProfileData}
                                accountMessage={accountMessage}
                                accountMessageType={accountMessageType}
                                newUsername={newUsername}
                                currentPassword={currentPassword}
                                newPassword={newPassword}
                                confirmNewPassword={confirmNewPassword}
                                setAccountMessage={setAccountMessage}
                                setAccountMessageType={setAccountMessageType}
                                setNewUsername={setNewUsername}
                                setCurrentPassword={setCurrentPassword}
                                setNewPassword={setNewPassword}
                                setConfirmNewPassword={setConfirmNewPassword}
                                setLoading={setLoading}
                            />
                        </Tab>

                        {/* Friends Tab */}
                        <Tab eventKey="friends" title="Friends & Requests">
                            <FriendsTab
                                token={token}
                                friendsList={friendsList}
                                incomingRequests={incomingRequests}
                                outgoingRequests={outgoingRequests}
                                friendsLoading={friendsLoading}
                                friendsError={friendsError}
                                friendsMessage={friendsMessage}
                                friendsMessageType={friendsMessageType}
                                setFriendsMessage={setFriendsMessage}
                                setFriendsMessageType={setFriendsMessageType}
                                fetchFriendsData={fetchFriendsData}
                            />
                        </Tab>

                        {/* Game Library Tab */}
                        <Tab eventKey="games" title="My Game Library">
                            <GameLibraryTab
                                token={token}
                                userGames={userGames}
                                gamesLoading={gamesLoading}
                                gamesError={gamesError}
                                gamesMessage={gamesMessage}
                                gamesMessageType={gamesMessageType}
                                newGameTitle={newGameTitle}
                                newGameNotes={newGameNotes}
                                newGameStatus={newGameStatus}
                                editingGameId={editingGameId}
                                editGameTitle={editGameTitle}
                                editGameNotes={editGameNotes}
                                editGameStatus={editGameStatus}
                                setGamesMessage={setGamesMessage}
                                setGamesMessageType={setGamesMessageType}
                                setNewGameTitle={setNewGameTitle}
                                setNewGameNotes={setNewGameNotes}
                                setNewGameStatus={setNewGameStatus}
                                setEditingGameId={setEditingGameId}
                                setEditGameTitle={setEditGameTitle}
                                setEditGameNotes={setEditGameNotes}
                                setEditGameStatus={setEditGameStatus}
                                fetchUserGames={fetchUserGames}
                            />
                        </Tab>

                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePage;