// D:\Game Night\website\src\pages\PublicProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Image, Button, Alert, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import defaultProfilePic from '../assets/default_profile_pic.png';

const PublicProfilePage = () => {
    const { username } = useParams();
    const { user, token } = useAuth(); // 'user' is the logged-in user, 'token' for auth
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [isFriend, setIsFriend] = useState(false);
    const [hasOutgoingRequest, setHasOutgoingRequest] = useState(false);
    const [hasIncomingRequestFromThisUser, setHasIncomingRequestFromThisUser] = useState(null); // Stores requester_id if present

    // State for public user's games
    const [publicUserGames, setPublicUserGames] = useState([]);
    const [activeTab, setActiveTab] = useState('profile'); // For managing tabs

    const fetchPublicProfile = useCallback(async () => {
        console.log('fetchPublicProfile called for user:', username);
        setLoading(true);
        setError('');
        setMessage('');
        try {
            // Include Authorization header if a token exists for the main profile fetch
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // 1. Fetch the public user's profile data
            const profileResponse = await fetch(`http://localhost:3001/public-profile/${username}`, {
                headers: headers,
            });

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                throw new Error(errorData.message || `Failed to fetch profile for ${username}.`);
            }
            const data = await profileResponse.json();
            console.log('Public Profile Data:', data);

            // Make sure the bio is properly set, defaulting to empty string if null/undefined
            // Also ensure madLibStory is handled correctly (default to empty string if null/undefined)
            setProfileData({ ...data, bio: data.bio || '', madLibStory: data.madLibStory || '' }); // ADDED madLibStory default
            // Assuming 'games' property from public-profile endpoint contains the game library
            setPublicUserGames(data.games || []);

            // === ADDED NEW CONSOLE LOGS FOR DEBUGGING THE CONDITION ===
            console.log('Current logged-in user (from AuthContext):', user);
            console.log('Auth token (from AuthContext):', token);
            console.log('Condition for fetching friend status: user && user.id && token ->', user && user?.id && token); // Using optional chaining for user.id
            // ==========================================================

            // 2. Fetch friendship status if a user is logged in
            if (user && user.id && token) {
                console.log('Logged in user detected, checking friendship status.');
                // Fetch accepted friends
                const friendsResponse = await fetch('http://localhost:3001/friends', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let friendsList = [];
                if (friendsResponse.ok) {
                    const responseData = await friendsResponse.json();
                    // --- CORRECTED: Access .friends property ---
                    friendsList = Array.isArray(responseData.friends) ? responseData.friends : [];
                    console.log('Fetched friends list:', friendsList);
                } else {
                    console.warn('Could not fetch accepted friends for status check.');
                }

                // Fetch pending requests (incoming requests to the logged-in user)
                const pendingRequestsResponse = await fetch('http://localhost:3001/friends/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let incomingRequests = [];
                if (pendingRequestsResponse.ok) {
                    const responseData = await pendingRequestsResponse.json();
                    // --- CORRECTED: Assuming .incomingRequests property ---
                    incomingRequests = Array.isArray(responseData.incomingRequests) ? responseData.incomingRequests : [];
                    console.log('Fetched incoming requests:', incomingRequests);
                } else {
                    console.warn('Could not fetch pending requests for status check.');
                }

                // Fetch outgoing requests (sent by the logged-in user)
                const outgoingRequestsResponse = await fetch('http://localhost:3001/friends/outgoing', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let outgoingRequests = [];
                if (outgoingRequestsResponse.ok) {
                    const responseData = await outgoingRequestsResponse.json(); // Corrected variable // Changed from responseData to outgoingRequests
                    // --- CORRECTED: Assuming .outgoingRequests property ---
                    outgoingRequests = Array.isArray(responseData.outgoingRequests) ? responseData.outgoingRequests : [];
                    console.log('Fetched outgoing requests:', outgoingRequests);
                } else {
                    console.warn('Could not fetch outgoing requests. Ensure /friends/outgoing is implemented on backend.');
                }

                // Determine friendship status
                // Check if already friends (accepted status)
                const foundFriend = friendsList.find(
                    f => f.username === username // IMPORTANT: Using 'username' here based on your provided JSON
                );
                setIsFriend(!!foundFriend);
                console.log('Is Friend:', !!foundFriend);

                // Check if an outgoing request has been sent by logged-in user to this public user
                const foundOutgoing = outgoingRequests.find(
                    r => r.recipient_username === username
                );
                setHasOutgoingRequest(!!foundOutgoing);
                console.log('Has Outgoing Request:', !!foundOutgoing);

                // Check if an incoming request is from this public user
                const foundIncoming = incomingRequests.find(
                    r => r.requester_username === username
                );
                // Store the requester_id from the incoming request for accept/reject
                setHasIncomingRequestFromThisUser(foundIncoming ? foundIncoming.requester_id : null);
                console.log('Has Incoming Request From This User (requester_id):', foundIncoming ? foundIncoming.requester_id : null);
            } else {
                console.log('User not logged in or missing ID/token. user:', user, 'token:', token); // More detailed log
                // Not logged in, or no token, so no friend status applies
                setIsFriend(false);
                setHasOutgoingRequest(false);
                setHasIncomingRequestFromThisUser(null);
            }

        } catch (err) {
            console.error('Error fetching public profile:', err);
            setError(err.message || 'An error occurred while fetching public profile.');
        } finally {
            setLoading(false);
            console.log('fetchPublicProfile finished.');
        }
    }, [username, user, token]); // Added user and token to dependencies

    useEffect(() => {
        fetchPublicProfile();
    }, [fetchPublicProfile]);

    const getProfilePicUrl = (relativePath) => {
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };

    const handleSendFriendRequest = async () => {
        setMessage('');
        setMessageType('success');
        if (!token) {
            setMessage('You must be logged in to send friend requests.');
            setMessageType('danger');
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ recipientUsername: username }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                // After sending, re-fetch profile to update friend status
                await fetchPublicProfile();
            } else {
                setMessage(data.message || 'Failed to send friend request.');
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            setMessage('Network error sending friend request.');
            setMessageType('danger');
        }
    };

    const handleAcceptRequest = async () => {
        setMessage('');
        setMessageType('success');
        if (!hasIncomingRequestFromThisUser) {
            setMessage('No incoming friend request to accept from this user.');
            setMessageType('danger');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterId: hasIncomingRequestFromThisUser,
                    status: 'accepted'
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile();
            } else {
                setMessage(data.message || 'Failed to accept request.');
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            setMessage('Network error accepting request.');
            setMessageType('danger');
        }
    };

    const handleRejectRequest = async () => {
        setMessage('');
        setMessageType('success');
        if (!hasIncomingRequestFromThisUser) {
            setMessage('No incoming friend request to reject from this user.');
            setMessageType('danger');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterId: hasIncomingRequestFromThisUser,
                    status: 'rejected'
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile();
            } else {
                setMessage(data.message || 'Failed to reject request.');
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            setMessage('Network error rejecting request.');
            setMessageType('danger');
        }
    };

    const handleUnfriend = async () => {
        setMessage('');
        setMessageType('success');
        if (!profileData || !profileData.username) {
            setMessage('Unable to unfriend: profile data missing.');
            setMessageType('danger');
            return;
        }

        try {
            const friendsResponse = await fetch('http://localhost:3001/friends', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!friendsResponse.ok) {
                throw new Error('Failed to fetch friends list to find friendship ID.');
            }
            const friendsData = await friendsResponse.json();
            const friendsList = Array.isArray(friendsData.friends) ? friendsData.friends : [];

            const friendship = friendsList.find(f => f.username === profileData.username);

            console.log('Attempting to unfriend:', profileData.username);
            console.log('Friends List received for unfriend:', friendsList);
            console.log('Found friendship object for unfriend:', friendship);
            // === UPDATED LOG HERE ===
            console.log('Friendship ID to send for DELETE:', friendship ? friendship.friendship_id : 'NOT FOUND');
            // ========================

            if (!friendship || !friendship.friendship_id) { // CHECK FOR friendship.friendship_id
                setMessage('Not currently friends with this user or friendship ID not found.');
                setMessageType('info');
                return;
            }

            // === CHANGE THIS LINE ===
            const response = await fetch(`http://localhost:3001/friends/${friendship.friendship_id}`, {
                // ========================
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile();
            } else {
                setMessage(data.message || 'Failed to unfriend.');
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error unfriending:', error);
            setMessage('Network error unfriending.');
            setMessageType('danger');
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <p>Loading profile for {username}...</p>
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

    if (!profileData) {
        return (
            <Container className="mt-5 text-center">
                <p>Profile not found or inaccessible.</p>
            </Container>
        );
    }

    let friendButton = null;
    const isViewingOwnProfile = user && user.username === username;

    if (!isViewingOwnProfile && user) {
        if (isFriend) {
            friendButton = (
                <Button variant="danger" className="ms-3" onClick={handleUnfriend}>
                    Unfriend
                </Button>
            );
        } else if (hasOutgoingRequest) {
            friendButton = (
                <Button variant="secondary" className="ms-3" disabled>
                    Request Sent
                </Button>
            );
        } else if (hasIncomingRequestFromThisUser) {
            friendButton = (
                <>
                    <Button variant="success" className="ms-3" onClick={handleAcceptRequest}>
                        Accept Request
                    </Button>
                    <Button variant="danger" className="ms-2" onClick={handleRejectRequest}>
                        Reject Request
                    </Button>
                </>
            );
        } else {
            friendButton = (
                <Button variant="primary" className="ms-3" onClick={handleSendFriendRequest}>
                    Add Friend
                </Button>
            );
        }
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <div className="d-flex align-items-center mb-4">
                        <Image
                            src={getProfilePicUrl(profileData.profilePictureUrl)}
                            alt={`${profileData.username}'s Profile`}
                            className="rounded-circle me-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <div>
                            <h2 className="mb-0">{profileData.username}</h2>
                            {profileData.firstName && profileData.lastName && (
                                <p className="text-muted">{profileData.firstName} {profileData.lastName}</p>
                            )}
                        </div>
                        {friendButton}
                    </div>

                    {message && <Alert variant={messageType}>{message}</Alert>}
                    <Tabs
                        id="public-profile-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        <Tab eventKey="profile" title="Profile Info">
                            <h4 className="mt-3">About {profileData.username}</h4>
                            {/* ADDED: Display the bio field */}
                            {profileData.bio ? (
                                <p>{profileData.bio}</p>
                            ) : (
                                <p className="text-muted">No bio available yet.</p>
                            )}
                            {/* END ADDED BIO */}

                            {/* ADDED: Mad Libs About Me section */}
                            {profileData.madLibStory && (
                                <Card className="mt-4 mb-4">
                                    <Card.Header as="h5">About Me (Mad Libs Edition!)</Card.Header>
                                    <Card.Body>
                                        <p className="text-start border p-2 rounded bg-light">
                                            {profileData.madLibStory}
                                        </p>
                                    </Card.Body>
                                </Card>
                            )}
                            {/* END ADDED MAD LIBS SECTION */}

                            <p><strong>Favorite Games:</strong> {profileData.favoriteGames || 'Not specified.'}</p>
                        </Tab>
                        <Tab eventKey="games" title="Game Library">
                            <h4 className="mt-3">{profileData.username}'s Game Library ({publicUserGames.length})</h4>
                            {publicUserGames.length === 0 ? (
                                <p>{profileData.username} has not added any games to their public library yet.</p>
                            ) : (
                                <ListGroup>
                                    {publicUserGames.map((game) => ( // Removed 'index' as key if 'game.id' is available
                                        <ListGroup.Item key={game.id || game.game_title} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{game.game_title}</strong>
                                                <br />
                                                <small className="text-muted">Status: {game.status.replace(/_/g, ' ')}</small>
                                                {game.notes && <><br /><small>Notes: {game.notes}</small></>}
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PublicProfilePage;