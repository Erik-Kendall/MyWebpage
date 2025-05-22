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
    const [hasIncomingRequestFromThisUser, setHasIncomingRequestFromThisUser] = useState(null); // Stores requestId if present

    // State for public user's games
    const [publicUserGames, setPublicUserGames] = useState([]);
    const [activeTab, setActiveTab] = useState('profile'); // For managing tabs

    const fetchPublicProfile = useCallback(async () => {
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

            setProfileData(data);
            // Assuming 'games' property from public-profile endpoint contains the game library
            setPublicUserGames(data.games || []);


            // 2. Fetch friendship status if a user is logged in
            if (user && user.id && token) {
                // Fetch accepted friends
                const friendsResponse = await fetch('http://localhost:3001/friends', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let friendsList = [];
                if (friendsResponse.ok) {
                    friendsList = await friendsResponse.json();
                } else {
                    console.warn('Could not fetch accepted friends for status check.');
                }

                // Fetch pending requests (incoming requests to the logged-in user)
                const pendingRequestsResponse = await fetch('http://localhost:3001/friends/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let incomingRequests = [];
                if (pendingRequestsResponse.ok) {
                    incomingRequests = await pendingRequestsResponse.json();
                } else {
                    console.warn('Could not fetch pending requests for status check.');
                }

                // Fetch outgoing requests (sent by the logged-in user)
                const outgoingRequestsResponse = await fetch('http://localhost:3001/friends/outgoing', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let outgoingRequests = [];
                if (outgoingRequestsResponse.ok) {
                    outgoingRequests = await outgoingRequestsResponse.json();
                } else {
                    console.warn('Could not fetch outgoing requests. Ensure /friends/outgoing is implemented on backend.');
                }

                // Determine friendship status
                // Check if already friends (accepted status)
                const foundFriend = friendsList.find(
                    f => f.friend_username === username
                );
                setIsFriend(!!foundFriend);

                // Check if an outgoing request has been sent by logged-in user to this public user
                const foundOutgoing = outgoingRequests.find(
                    r => r.recipient_username === username
                );
                setHasOutgoingRequest(!!foundOutgoing);

                // Check if an incoming request is from this public user
                const foundIncoming = incomingRequests.find(
                    r => r.requester_username === username
                );
                // Store the friendship_id from the incoming request for accept/reject
                setHasIncomingRequestFromThisUser(foundIncoming ? foundIncoming.requester_id : null); // <-- CORRECTED
            } else {
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

    const handleAcceptRequest = async (friendshipId) => { // Changed to friendshipId
        setMessage('');
        setMessageType('success');
        try {
            // Note: Your backend route is /friends/respond and expects requesterId and status.
            // You'll need to send the requesterId, not the friendshipId.
            // The hasIncomingRequestFromThisUser state already stores the friendshipId.
            // If you want to use the friendshipId, your backend /friends/respond needs to accept it.
            // Let's adjust the backend route name to match your frontend expectation for clarity,
            // or modify this to send requesterId.
            // For now, I'm assuming you want to send requesterId as per your backend route /friends/respond
            // and that hasIncomingRequestFromThisUser actually stores requester_id (not friendship_id).

            // Re-evaluating: Your backend '/friends/respond' expects `requesterId`.
            // The `hasIncomingRequestFromThisUser` currently stores `friendship_id`.
            // You need to either:
            // 1. Change backend '/friends/respond' to accept `friendshipId` instead of `requesterId`.
            // 2. Modify `WorkspacePublicProfile` to store `requester_id` in `hasIncomingRequestFromThisUser`.
            // Let's go with option 2 for consistency with existing backend.

            // So, `hasIncomingRequestFromThisUser` should store `foundIncoming.requester_id`
            // Let's re-correct this in fetchPublicProfile.

            // --- RE-RE-CORRECTION FOR handleAccept/Reject: ---
            // In fetchPublicProfile, change:
            // setHasIncomingRequestFromThisUser(foundIncoming ? foundIncoming.friendship_id : null);
            // TO:
            // setHasIncomingRequestFromThisUser(foundIncoming ? foundIncoming.requester_id : null);
            // This assumes your backend's /friends/pending returns requester_id.
            // Your server.js currently returns: u.id AS requester_id, u.username AS requester_username
            // So, it's `requester_id` that needs to be passed here.

            // Assuming `hasIncomingRequestFromThisUser` now holds `requester_id`
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterId: hasIncomingRequestFromThisUser, // This should be the requester's user ID
                    status: 'accepted'
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile(); // Re-fetch to update status
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

    const handleRejectRequest = async () => { // Changed to remove requestId param
        setMessage('');
        setMessageType('success');
        try {
            // Assuming `hasIncomingRequestFromThisUser` now holds `requester_id`
            const response = await fetch(`http://localhost:3001/friends/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requesterId: hasIncomingRequestFromThisUser, // This should be the requester's user ID
                    status: 'rejected'
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile(); // Re-fetch to update status
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

    // Assuming you'd want to be able to unfriend from here too
    const handleUnfriend = async () => {
        setMessage('');
        setMessageType('success');
        if (!profileData || !profileData.username) {
            setMessage('Unable to unfriend: profile data missing.');
            setMessageType('danger');
            return;
        }

        try {
            // Find the friendship ID from accepted friends list
            const friendsResponse = await fetch('http://localhost:3001/friends', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!friendsResponse.ok) {
                throw new Error('Failed to fetch friends list to find friendship ID.');
            }
            const friendsData = await friendsResponse.json();
            // The `/friends` endpoint returns objects with `id` (friendship ID), `friend_id`, `friend_username`
            const friendship = friendsData.find(f => f.friend_username === profileData.username);

            if (!friendship) {
                setMessage('Not currently friends with this user or friendship ID not found.');
                setMessageType('info');
                return;
            }

            // Your backend's DELETE /friends/:id route expects the FRIENDSHIP_ID
            const response = await fetch(`http://localhost:3001/friends/${friendship.id}`, { // Use friendship.id here
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                await fetchPublicProfile(); // Re-fetch to update status
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

    // Determine button state based on friendship status and logged-in user
    let friendButton = null;
    const isViewingOwnProfile = user && user.username === username;

    if (!isViewingOwnProfile && user) { // If logged in and not viewing own profile
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
        } else if (hasIncomingRequestFromThisUser) { // hasIncomingRequestFromThisUser now holds requester_id
            friendButton = (
                <>
                    <Button variant="success" className="ms-3" onClick={() => handleAcceptRequest()}>
                        Accept Request
                    </Button>
                    <Button variant="danger" className="ms-2" onClick={() => handleRejectRequest()}>
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
                        {friendButton} {/* Friend action button */}
                    </div>

                    {message && <Alert variant={messageType}>{message}</Alert>}
                    <Tabs
                        id="public-profile-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        {/* Public Profile Info Tab */}
                        <Tab eventKey="profile" title="Profile Info">
                            <h4 className="mt-3">About {profileData.username}</h4>
                            <p><strong>Favorite Games:</strong> {profileData.favoriteGames || 'Not specified.'}</p>
                            {/* Add other public profile details here if any */}
                        </Tab>
                        {/* NEW: Public Game Library Tab */}
                        <Tab eventKey="games" title="Game Library">
                            <h4 className="mt-3">{profileData.username}'s Game Library ({publicUserGames.length})</h4>
                            {publicUserGames.length === 0 ? (
                                <p>{profileData.username} has not added any games to their public library yet.</p>
                            ) : (
                                <ListGroup>
                                    {publicUserGames.map((game, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
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