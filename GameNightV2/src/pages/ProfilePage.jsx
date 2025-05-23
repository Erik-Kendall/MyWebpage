// D:\Game Night\website\src\pages\ProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Alert, Tabs, Tab, ListGroup, Image, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import defaultProfilePic from '../assets/default_profile_pic.png';
import { Link } from 'react-router-dom';
import MadLibsAboutMe from './MadLibsAboutMe'; // ADD THIS IMPORT LINE (assuming MadLibsAboutMe is in the same 'pages' directory)

const ProfilePage = () => {
    // Ensure useAuth provides updateUserData
    const { user, token, updateUserData } = useAuth(); // Assuming updateUserData is now available

    const [profileData, setProfileData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        favoriteGames: '',
        profilePictureUrl: null,
        bio: '',
        madLibStory: '' // ADDED: madLibStory field to profileData state
    });
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);

    const [activeTab, setActiveTab] = useState('profile');

    // Friends Management States
    const [friendsList, setFriendsList] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState('');
    const [friendsMessage, setFriendsMessage] = useState('');
    const [friendsMessageType, setFriendsMessageType] = useState('success');

    // Game Library Management States
    const [userGames, setUserGames] = useState([]);
    const [gamesLoading, setGamesLoading] = useState(false);
    const [gamesError, setGamesError] = useState('');
    const [gamesMessage, setGamesMessage] = useState('');
    const [gamesMessageType, setGamesMessageType] = useState('success');
    const [newGameTitle, setNewGameTitle] = useState('');
    const [newGameNotes, setNewGameNotes] = '';
    const [newGameStatus, setNewGameStatus] = useState('owned'); // Default status
    const [editingGameId, setEditingGameId] = useState(null); // State to manage which game is being edited
    const [editGameTitle, setEditGameTitle] = useState('');
    const [editGameNotes, setEditGameNotes] = useState('');
    const [editGameStatus, setEditGameStatus] = useState('');


    // Fetch user profile data - ADJUSTED to include bio and madLibStory
    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        if (!token) {
            setError('You must be logged in to view your profile.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch profile data.');
            }
            const data = await response.json();
            // Ensure bio and madLibStory are initialized, even if null from backend
            setProfileData(prev => ({
                ...prev,
                ...data,
                bio: data.bio || '',
                madLibStory: data.madLibStory || '' // ADDED: Initialize madLibStory
            }));
            setOriginalProfileData(prev => ({
                ...prev,
                ...data,
                bio: data.bio || '',
                madLibStory: data.madLibStory || '' // ADDED: Initialize madLibStory for original data
            }));
            // Ensure AuthContext's user data is up-to-date from this fetch
            updateUserData(data); // Update global user state
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'An error occurred while fetching profile.');
        } finally {
            setLoading(false);
        }
    }, [token, updateUserData]);

    // Fetch friends data - MODIFIED (no changes needed here related to madlibs)
    const fetchFriendsData = useCallback(async () => {
        if (!token) {
            setFriendsError('Not authenticated to view friends.');
            return;
        }
        setFriendsLoading(true);
        setFriendsError('');
        setFriendsMessage('');
        try {
            // Fetch Accepted Friends
            const friendsResponse = await fetch('http://localhost:3001/friends', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const friendsData = await friendsResponse.json();
            if (!friendsResponse.ok) {
                throw new Error(friendsData.message || 'Failed to fetch accepted friends data.');
            }
            console.log('Accepted Friends Data from Backend:', friendsData);
            setFriendsList(friendsData.friends || []);

            // Fetch Incoming Requests
            const incomingResponse = await fetch('http://localhost:3001/friends/pending', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const incomingData = await incomingResponse.json();
            if (!incomingResponse.ok) {
                throw new Error(incomingData.message || 'Failed to fetch incoming requests.');
            }
            console.log('Incoming Requests Data from Backend:', incomingData);
            setIncomingRequests(incomingData || []);

            // Fetch Outgoing Requests
            const outgoingResponse = await fetch('http://localhost:3001/friends/outgoing', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const outgoingData = await outgoingResponse.json();
            if (!outgoingResponse.ok) {
                throw new Error(outgoingData.message || 'Failed to fetch outgoing requests.');
            }
            console.log('Outgoing Requests Data from Backend:', outgoingData);
            setOutgoingRequests(outgoingData || []);

        } catch (err) {
            console.error('Error fetching friends data (all types):', err);
            setFriendsError(err.message || 'An error occurred while fetching friends information.');
        } finally {
            setFriendsLoading(false);
        }
    }, [token]);


    // Fetch user games data - MODIFIED for /games/my-games endpoint (no changes needed here related to madlibs)
    const fetchUserGames = useCallback(async () => {
        if (!token) {
            setGamesError('Not authenticated to view game library.');
            return;
        }
        setGamesLoading(true);
        setGamesError('');
        setGamesMessage('');
        try {
            const response = await fetch('http://localhost:3001/games/my-games', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch game library.');
            }
            const data = await response.json();
            console.log('Game Library Data from Backend:', data);
            setUserGames(data || []);
        } catch (err) {
            console.error('Error fetching user games:', err);
            setGamesError(err.message || 'An error occurred while fetching game library.');
        } finally {
            setGamesLoading(false);
        }
    }, [token]);


    useEffect(() => {
        fetchProfileData();
        // You might want to fetch friends/games only when their respective tabs are active
        // For simplicity, keeping them here as well.
        fetchFriendsData();
        fetchUserGames();
    }, [fetchProfileData, fetchFriendsData, fetchUserGames]);


    // Profile Form Handlers - ADJUSTED to include bio (no changes needed here related to madlibs)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('success');

        const changes = {};
        if (profileData.firstName !== originalProfileData.firstName) {
            changes.firstName = profileData.firstName;
        }
        if (profileData.lastName !== originalProfileData.lastName) {
            changes.lastName = profileData.lastName;
        }
        if (profileData.favoriteGames !== originalProfileData.favoriteGames) {
            changes.favoriteGames = profileData.favoriteGames;
        }
        // ADDED: Bio change check
        if (profileData.bio !== originalProfileData.bio) {
            changes.bio = profileData.bio;
        }
        // IMPORTANT: No need to check for madLibStory change here,
        // as MadLibsAboutMe component handles its own PUT request.


        if (Object.keys(changes).length === 0 && !profilePicFile) {
            setMessage('No changes to save.');
            setMessageType('info');
            return;
        }

        try {
            if (Object.keys(changes).length > 0) {
                const response = await fetch('http://localhost:3001/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(changes),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile.');
                }
                setMessage(data.message);
                setOriginalProfileData(profileData); // Update original data after successful save
            }

            if (profilePicFile) {
                const formData = new FormData();
                formData.append('profilePicture', profilePicFile);

                const uploadResponse = await fetch('http://localhost:3001/profile/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) {
                    throw new Error(uploadData.message || 'Failed to upload profile picture.');
                }
                setMessage(prev => prev + (prev ? ' & ' : '') + uploadData.message);
                setProfileData(prev => ({ ...prev, profilePictureUrl: uploadData.profilePictureUrl }));
                // Update AuthContext's user data with the new profile picture URL
                updateUserData({ profilePictureUrl: uploadData.profilePictureUrl });
                setProfilePicFile(null);
                setProfilePicPreview(null);
            }

            await fetchProfileData(); // Re-fetch all profile data after update to ensure consistency

        } catch (err) {
            console.error('Error during profile update:', err);
            setError(err.message || 'An error occurred during profile update.');
            setMessageType('danger');
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            setProfilePicPreview(URL.createObjectURL(file));
        } else {
            setProfilePicFile(null);
            setProfilePicPreview(null);
        }
    };

    const getProfilePicUrl = (relativePath) => {
        if (profilePicPreview) {
            return profilePicPreview;
        }
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };


    // Friend action handlers (no changes needed here related to madlibs)
    const handleAcceptRequest = async (requesterId) => {
        setFriendsMessage('');
        setFriendsMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ requesterId: requesterId, status: 'accepted' }),
            });
            const data = await response.json();
            if (response.ok) {
                setFriendsMessage(data.message);
                await fetchFriendsData();
            } else {
                setFriendsMessage(data.message || 'Failed to accept request.');
                setFriendsMessageType('danger');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setFriendsMessage('Network error accepting request.');
            setFriendsMessageType('danger');
        }
    };

    const handleRejectRequest = async (requesterId) => {
        setFriendsMessage('');
        setFriendsMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ requesterId: requesterId, status: 'rejected' }),
            });
            const data = await response.json();
            if (response.ok) {
                setFriendsMessage(data.message);
                await fetchFriendsData();
            } else {
                setFriendsMessage(data.message || 'Failed to reject request.');
                setFriendsMessageType('danger');
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            setFriendsMessage('Network error rejecting request.');
            setFriendsMessageType('danger');
        }
    };

    const handleCancelRequest = async (friendshipId) => {
        setFriendsMessage('');
        setFriendsMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/friends/${friendshipId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setFriendsMessage(data.message);
                await fetchFriendsData();
            } else {
                setFriendsMessage(data.message || 'Failed to cancel request.');
                setFriendsMessageType('danger');
            }
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            setFriendsMessage('Network error cancelling request.');
            setFriendsMessageType('danger');
        }
    };

    const handleUnfriend = async (friendshipId) => {
        setFriendsMessage('');
        setFriendsMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/friends/${friendshipId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setFriendsMessage(data.message);
                await fetchFriendsData();
            } else {
                setFriendsMessage(data.message || 'Failed to unfriend.');
                setFriendsMessageType('danger');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            setFriendsMessage('Network error unfriending.');
            setFriendsMessageType('danger');
        }
    };
    // NEW: Game Library Handlers - MODIFIED for /games/my-games endpoints (no changes needed here related to madlibs)
    const handleAddGame = async (e) => {
        e.preventDefault();
        setGamesMessage('');
        setGamesMessageType('success');

        if (!newGameTitle.trim()) {
            setGamesMessage('Game title cannot be empty.');
            setGamesMessageType('danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/games/my-games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_title: newGameTitle.trim(),
                    notes: newGameNotes.trim(),
                    status: newGameStatus,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                setNewGameTitle('');
                setNewGameNotes('');
                setNewGameStatus('owned'); // Reset to default
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to add game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error adding game:', error);
            setGamesMessage('Network error adding game.');
            setGamesMessageType('danger');
        }
    };

    const handleEditClick = (game) => {
        setEditingGameId(game.id);
        setEditGameTitle(game.game_title);
        setEditGameNotes(game.notes);
        setEditGameStatus(game.status);
    };

    const handleSaveEdit = async (gameId) => {
        setGamesMessage('');
        setGamesMessageType('success');

        if (!editGameTitle.trim()) {
            setGamesMessage('Game title cannot be empty.');
            setGamesMessageType('danger');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/games/my-games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_title: editGameTitle.trim(),
                    notes: editGameNotes.trim(),
                    status: editGameStatus,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                setEditingGameId(null); // Exit edit mode
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to update game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error updating game:', error);
            setGamesMessage('Network error updating game.');
            setGamesMessageType('danger');
        }
    };

    const handleCancelEdit = () => {
        setEditingGameId(null);
    };

    const handleDeleteGame = async (gameId) => {
        setGamesMessage('');
        setGamesMessageType('success');
        if (!window.confirm('Are you sure you want to remove this game from your library?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/games/my-games/${gameId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to remove game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            setGamesMessage('Network error deleting game.');
            setGamesMessageType('danger');
        }
    };

    // Callback for MadLibsAboutMe to update profileData
    const handleMadLibStoryUpdate = (newStory) => {
        setProfileData(prev => ({
            ...prev,
            madLibStory: newStory || '' // Ensure it's an empty string if null
        }));
        // No need to call fetchProfileData again, as state is updated directly
    };


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
                <p className="text-danger">{error}</p>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5 text-center">
                <p>Please log in to view your profile.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <h2 className="mb-4">My Profile & Friends & Games</h2>

                    <Tabs
                        id="profile-friends-games-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => {
                            setActiveTab(k);
                            if (k === 'friends') {
                                fetchFriendsData(); // Always refresh friends data when going to this tab
                            } else if (k === 'games') {
                                fetchUserGames(); // Always refresh games data when going to this tab
                            }
                        }}
                        className="mb-3"
                    >
                        {/* Profile Tab */}
                        <Tab eventKey="profile" title="My Profile">
                            {message && <Alert variant={messageType}>{message}</Alert>}
                            <Form onSubmit={handleProfileSubmit} className="mt-3">
                                <div className="text-center mb-4">
                                    <Image
                                        src={getProfilePicUrl(profileData.profilePictureUrl)}
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                    <Form.Group controlId="profilePic" className="mt-3">
                                        <Form.Label>Change Profile Picture</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                        />
                                    </Form.Group>
                                </div>

                                <Form.Group className="mb-3" controlId="username">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" value={profileData.username} disabled />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="favoriteGames">
                                    <Form.Label>Favorite Games</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="favoriteGames"
                                        value={profileData.favoriteGames || ''}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </Form.Group>

                                {/* ADDED: Bio input field */}
                                <Form.Group controlId="formBio" className="mb-3">
                                    <Form.Label>About Me (Bio)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="bio"
                                        rows={4}
                                        value={profileData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us something about yourself..."
                                        maxLength={500}
                                    />
                                    <Form.Text className="text-muted">
                                        Max 500 characters.
                                    </Form.Text>
                                </Form.Group>
                                {/* END ADDED BIO */}

                                <Button variant="primary" type="submit">
                                    Save Profile
                                </Button>
                            </Form>
                        </Tab>
                        {/* Friends Tab */}
                        <Tab eventKey="friends" title="Friends & Requests">
                            {friendsLoading ? (
                                <p className="text-center mt-3">Loading friends data...</p>
                            ) : (
                                <div className="mt-3">
                                    {friendsMessage && <Alert variant={friendsMessageType}>{friendsMessage}</Alert>}
                                    {friendsError && <Alert variant="danger">{friendsError}</Alert>}

                                    {/* My Friends List */}
                                    <h4 className="mb-3">My Friends ({friendsList.length})</h4>
                                    {friendsList.length === 0 ? (
                                        <p>You don't have any friends yet. Start sending requests!</p>
                                    ) : (
                                        <ListGroup>
                                            {friendsList.map(friend => (
                                                <ListGroup.Item key={friend.friendship_id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Image src={getProfilePicUrl(friend.profilePictureUrl)} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />
                                                        <Link to={`/public-profile/${friend.username}`}>
                                                            {friend.username}
                                                        </Link>
                                                    </div>
                                                    <Button variant="danger" size="sm" onClick={() => handleUnfriend(friend.friendship_id)}>Unfriend</Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}

                                    {/* Incoming Requests */}
                                    <h4 className="mt-4 mb-3">Incoming Requests ({incomingRequests.length})</h4>
                                    {incomingRequests.length === 0 ? (
                                        <p>No incoming friend requests.</p>
                                    ) : (
                                        <ListGroup>
                                            {incomingRequests.map(request => (
                                                <ListGroup.Item key={request.friendship_id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Image src={getProfilePicUrl(request.profilePictureUrl)} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />
                                                        <Link to={`/public-profile/${request.requester_username}`}>
                                                            {request.requester_username}
                                                        </Link> wants to be friends.
                                                    </div>
                                                    <div>
                                                        <Button variant="success" size="sm" onClick={() => handleAcceptRequest(request.requester_id)}>Accept</Button>
                                                        <Button variant="danger" size="sm" className="ms-2" onClick={() => handleRejectRequest(request.requester_id)}>Reject</Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}

                                    {/* Outgoing Requests */}
                                    <h4 className="mt-4 mb-3">Outgoing Requests ({outgoingRequests.length})</h4>
                                    {outgoingRequests.length === 0 ? (
                                        <p>No outgoing friend requests.</p>
                                    ) : (
                                        <ListGroup>
                                            {outgoingRequests.map(request => (
                                                <ListGroup.Item key={request.friendship_id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Image src={getProfilePicUrl(request.profilePictureUrl)} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />
                                                        <Link to={`/public-profile/${request.addressee_username}`}>
                                                            {request.addressee_username}
                                                        </Link> (pending)
                                                    </div>
                                                    <Button variant="warning" size="sm" onClick={() => handleCancelRequest(request.friendship_id)}>Cancel Request</Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </div>
                            )}
                        </Tab>

                        {/* Game Library Tab */}
                        <Tab eventKey="games" title="My Game Library">
                            {gamesLoading ? (
                                <p className="text-center mt-3">Loading game library...</p>
                            ) : (
                                <div className="mt-3">
                                    {gamesMessage && <Alert variant={gamesMessageType}>{gamesMessage}</Alert>}
                                    {gamesError && <Alert variant="danger">{gamesError}</Alert>}

                                    <h4 className="mb-3">Add a New Game</h4>
                                    <Form onSubmit={handleAddGame} className="mb-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Game Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter game title"
                                                value={newGameTitle}
                                                onChange={(e) => setNewGameTitle(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Notes</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                placeholder="e.g., Expansion owned, preferred player count, strategy tips"
                                                value={newGameNotes}
                                                onChange={(e) => setNewGameNotes(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={newGameStatus}
                                                onChange={(e) => setNewGameStatus(e.target.value)}
                                            >
                                                <option value="owned">Owned</option>
                                                <option value="wishlist">Wishlist</option>
                                                <option value="played">Played</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <Button variant="success" type="submit">Add Game</Button>
                                    </Form>

                                    <h4 className="mb-3">My Games ({userGames.length})</h4>
                                    {userGames.length === 0 ? (
                                        <p>You haven't added any games to your library yet. Use the form above to add some!</p>
                                    ) : (
                                        <ListGroup>
                                            {userGames.map(game => (
                                                <ListGroup.Item key={game.id} className="d-flex justify-content-between align-items-center">
                                                    {editingGameId === game.id ? (
                                                        <div className="w-100">
                                                            <Form.Group className="mb-2">
                                                                <Form.Control
                                                                    type="text"
                                                                    value={editGameTitle}
                                                                    onChange={(e) => setEditGameTitle(e.target.value)}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group className="mb-2">
                                                                <Form.Control
                                                                    as="textarea"
                                                                    rows={1}
                                                                    value={editGameNotes}
                                                                    onChange={(e) => setEditGameNotes(e.target.value)}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group className="mb-2">
                                                                <Form.Control
                                                                    as="select"
                                                                    value={editGameStatus}
                                                                    onChange={(e) => setEditGameStatus(e.target.value)}
                                                                >
                                                                    <option value="owned">Owned</option>
                                                                    <option value="wishlist">Wishlist</option>
                                                                    <option value="played">Played</option>
                                                                </Form.Control>
                                                            </Form.Group>
                                                            <Button variant="success" size="sm" className="me-2" onClick={() => handleSaveEdit(game.id)}>Save</Button>
                                                            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-start">
                                                            <strong>{game.game_title}</strong>
                                                            <small className="text-muted">Status: {game.status}</small>
                                                            {game.notes && <small className="text-muted">Notes: {game.notes}</small>}
                                                        </div>
                                                    )}
                                                    <div>
                                                        {editingGameId !== game.id && (
                                                            <>
                                                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditClick(game)}>Edit</Button>
                                                                <Button variant="danger" size="sm" onClick={() => handleDeleteGame(game.id)}>Remove</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </div>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePage;