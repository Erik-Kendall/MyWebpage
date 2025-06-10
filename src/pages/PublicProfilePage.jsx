// D:\Game Night\website\src\pages\PublicProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Image, Button, Alert, Tabs, Tab, ListGroup, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import defaultProfilePic from '../assets/default_profile_pic.png';

// ADDED: React Icons for social media
import { FaTwitch, FaYoutube, FaTwitter, FaInstagram, FaDiscord, FaGlobe, FaLink, FaCommentMedical } from 'react-icons/fa';

const PublicProfilePage = () => {
    const { username } = useParams();
    const { user, token } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [isFriend, setIsFriend] = useState(false);
    const [hasOutgoingRequest, setHasOutgoingRequest] = useState(false);
    const [hasIncomingRequestFromThisUser, setHasIncomingRequestFromThisUser] = useState(null);

    const [publicUserGames, setPublicUserGames] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentMessage, setCommentMessage] = useState('');
    const [commentMessageType, setCommentMessageType] = useState('success');
    const MAX_COMMENT_LENGTH = 500;

    const fetchPublicProfile = useCallback(async () => {
        console.log('fetchPublicProfile called for user:', username);
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const profileResponse = await fetch(`http://localhost:3001/api/users/public-profile/${username}`, { // Ensure the correct path here if main.js adds /api/users
                headers: headers,
            });

            if (!profileResponse.ok) {
                // --- Start of improved error handling for non-OK responses ---
                let errorDetails = `Failed to fetch profile for ${username}.`;
                try {
                    const errorData = await profileResponse.json();
                    errorDetails = errorData.message || errorDetails;
                } catch (jsonError) {
                    // If the response body is not JSON, use the status text
                    errorDetails = `Server responded with ${profileResponse.status} ${profileResponse.statusText}.`;
                }
                throw new Error(errorDetails);
                // --- End of improved error handling ---
            }

            const data = await profileResponse.json();
            console.log('Public Profile Data:', data);

            setProfileData({
                ...data,
                bio: data.bio || '',
                madLibStory: data.madLibStory || '',
                socialMediaLinks: data.socialMediaLinks || []
            });
            setPublicUserGames(data.games || []);

            console.log('Current logged-in user (from AuthContext):', user);
            console.log('Auth token (from AuthContext):', token);
            console.log('Condition for fetching friend status: user && user.id && token ->', user && user?.id && token);

            if (user && user.id && token) {
                console.log('Logged in user detected, checking friendship status.');
                const friendsResponse = await fetch('http://localhost:3001/api/friends', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let friendsList = [];
                if (friendsResponse.ok) {
                    const responseData = await friendsResponse.json();
                    friendsList = Array.isArray(responseData.friends) ? responseData.friends : [];
                    console.log('Fetched friends list:', friendsList);
                } else {
                    console.warn('Could not fetch accepted friends for status check.');
                }

                const pendingRequestsResponse = await fetch('http://localhost:3001/api/friends/pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let incomingRequests = [];
                if (pendingRequestsResponse.ok) {
                    const responseData = await pendingRequestsResponse.json();
                    incomingRequests = Array.isArray(responseData) ? responseData : [];
                    console.log('Fetched incoming requests:', incomingRequests);
                } else {
                    console.warn('Could not fetch pending requests for status check.');
                }

                const outgoingRequestsResponse = await fetch('http://localhost:3001/api/friends/outgoing', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let outgoingRequests = [];
                if (outgoingRequestsResponse.ok) {
                    const responseData = await outgoingRequestsResponse.json();
                    outgoingRequests = Array.isArray(responseData) ? responseData : [];
                    console.log('Fetched outgoing requests:', outgoingRequests);
                } else {
                    console.warn('Could not fetch outgoing requests. Ensure /friends/outgoing is implemented on backend.');
                }

                const foundFriend = friendsList.find(
                    f => f.username === username
                );
                setIsFriend(!!foundFriend);
                console.log('Is Friend:', !!foundFriend);

                const foundOutgoing = outgoingRequests.find(
                    r => r.recipient_username === username
                );
                setHasOutgoingRequest(!!foundOutgoing);
                console.log('Has Outgoing Request:', !!foundOutgoing);

                const foundIncoming = incomingRequests.find(
                    r => r.requester_username === username
                );
                setHasIncomingRequestFromThisUser(foundIncoming ? foundIncoming.requester_id : null);
                console.log('Has Incoming Request From This User (requester_id):', foundIncoming ? foundIncoming.requester_id : null);
            } else {
                console.log('User not logged in or missing ID/token. user:', user, 'token:', token);
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
    }, [username, user, token]);

    const fetchComments = useCallback(async () => {
        setCommentMessage('');
        try {
            // Ensure profileData.id is available before attempting to fetch comments
            if (!profileData || !profileData.id) {
                console.warn('Cannot fetch comments: profileData or profileData.id is missing.');
                return;
            }

            const response = await fetch(`http://localhost:3001/api/users/public-profile/${profileData.id}/comments`, { // Ensure the correct path here
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            if (!response.ok) {
                let errorDetails = 'Failed to fetch comments.';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message || errorDetails;
                } catch (jsonError) {
                    errorDetails = `Server responded with ${response.status} ${response.statusText}.`;
                }
                throw new Error(errorDetails);
            }
            const data = await response.json();
            setComments(data);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setCommentMessage(err.message || 'Failed to load comments.');
            setCommentMessageType('danger');
        }
    }, [profileData?.id, token]);

    useEffect(() => {
        fetchPublicProfile();
    }, [fetchPublicProfile]);

    useEffect(() => {
        if (profileData && profileData.id) {
            fetchComments();
        }
    }, [profileData, fetchComments]);


    const getProfilePicUrl = (relativePath) => {
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };

    const getSocialIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'twitch': return <FaTwitch size="1.5em" />;
            case 'youtube': return <FaYoutube size="1.5em" />;
            case 'twitter': return <FaTwitter size="1.5em" />;
            case 'instagram': return <FaInstagram size="1.5em" />;
            case 'discord': return <FaDiscord size="1.5em" />;
            case 'website': return <FaGlobe size="1.5em" />;
            case 'other': return <FaLink size="1.5em" />;
            default: return <FaLink size="1.5em" />;
        }
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
            const response = await fetch('http://localhost:3001/api/friends/request', {
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
            const response = await fetch(`http://localhost:3001/api/friends/respond`, {
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
            const response = await fetch(`http://localhost:3001/api/friends/respond`, {
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
            const friendsResponse = await fetch('http://localhost:3001/api/friends', {
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
            console.log('Friendship ID to send for DELETE:', friendship ? friendship.friendship_id : 'NOT FOUND');

            if (!friendship || !friendship.friendship_id) {
                setMessage('Not currently friends with this user or friendship ID not found.');
                setMessageType('info');
                return;
            }

            const response = await fetch(`http://localhost:3001/api/friends/${friendship.friendship_id}`, {
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

    const handlePostComment = async (e) => {
        e.preventDefault();
        setCommentMessage('');
        setCommentMessageType('success');

        if (!user || !token) {
            setCommentMessage('You must be logged in to post comments.');
            setCommentMessageType('danger');
            return;
        }

        if (!newComment.trim()) {
            setCommentMessage('Comment cannot be empty.');
            setCommentMessageType('danger');
            return;
        }

        if (newComment.trim().length > MAX_COMMENT_LENGTH) {
            setCommentMessage(`Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters.`);
            setCommentMessageType('danger');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/users/public-profile/${profileData.id}/comments`, { // Ensure the correct path here
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newComment.trim(),
                    profileOwnerId: profileData.id
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setCommentMessage(data.message);
                setCommentMessageType('success');
                setNewComment('');
                await fetchComments();
            } else {
                setCommentMessage(data.message || 'Failed to post comment.');
                setCommentMessageType('danger');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            setCommentMessage('Network error posting comment.');
            setCommentMessageType('danger');
        }
    };

    const handleDeleteComment = async (commentId) => {
        setCommentMessage('');
        setCommentMessageType('success');

        if (!user || !token) {
            setCommentMessage('You must be logged in to delete comments.');
            setCommentMessageType('danger');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/users/public-profile/comments/${commentId}`, { // Ensure the correct path here
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCommentMessage(data.message);
                setCommentMessageType('success');
                await fetchComments();
            } else {
                setCommentMessage(data.message || 'Failed to delete comment.');
                setCommentMessageType('danger');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            setCommentMessage('Network error deleting comment.');
            setCommentMessageType('danger');
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
                            {profileData.bio ? (
                                <p>{profileData.bio}</p>
                            ) : (
                                <p className="text-muted">No bio available yet.</p>
                            )}

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

                            <h4 className="mt-3">Social Media & Websites</h4>
                            {profileData.socialMediaLinks && profileData.socialMediaLinks.length > 0 ? (
                                <ListGroup className="mb-4">
                                    {profileData.socialMediaLinks.map((link, index) => (
                                        <ListGroup.Item key={index} className="d-flex align-items-center">
                                            <span className="me-2">
                                                {getSocialIcon(link.platform)}
                                            </span>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}: {link.url}
                                            </a>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">No social media or website links added yet.</p>
                            )}

                            <p><strong>Favorite Games:</strong> {profileData.favoriteGames || 'Not specified.'}</p>
                        </Tab>
                        <Tab eventKey="games" title="Game Library">
                            <h4 className="mt-3">{profileData.username}'s Game Library ({publicUserGames.length})</h4>
                            {publicUserGames.length === 0 ? (
                                <p>{profileData.username} has not added any games to their public library yet.</p>
                            ) : (
                                <ListGroup>
                                    {publicUserGames.map((game) => (
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

                        <Tab eventKey="comments" title={`Comments (${comments.length})`}>
                            <h4 className="mt-3">Comments on {profileData.username}'s Profile</h4>
                            {commentMessage && <Alert variant={commentMessageType}>{commentMessage}</Alert>}

                            {user && user.id && user.id !== profileData.id && (
                                <Card className="mb-4 p-3 bg-light">
                                    <Card.Title>Leave a Comment</Card.Title>
                                    <Form onSubmit={handlePostComment}>
                                        <Form.Group className="mb-2" controlId="newComment">
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Write your comment here..."
                                                maxLength={MAX_COMMENT_LENGTH}
                                            />
                                            <Form.Text className="text-muted">
                                                {newComment.length}/{MAX_COMMENT_LENGTH} characters.
                                            </Form.Text>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="mt-2">
                                            <FaCommentMedical className="me-1" /> Post Comment
                                        </Button>
                                    </Form>
                                </Card>
                            )}
                            {user && user.id === profileData.id && (
                                <p className="text-info mt-3">You cannot comment on your own profile.</p>
                            )}
                            {!user && (
                                <p className="text-info mt-3">Log in to leave a comment.</p>
                            )}


                            {comments.length === 0 ? (
                                <p className="text-muted">No comments yet. Be the first to leave one!</p>
                            ) : (
                                <ListGroup className="mt-3">
                                    {comments.map((comment) => (
                                        <ListGroup.Item key={comment.id} className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <Image src={getProfilePicUrl(comment.commenter_profile_pic)} roundedCircle style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '8px' }} />
                                                    <Link to={`/public-profile/${comment.commenter_username}`}>
                                                        <strong>{comment.commenter_username}</strong>
                                                    </Link>
                                                    <small className="text-muted ms-2">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </small>
                                                </div>
                                                <p className="mb-0">{comment.content}</p>
                                            </div>
                                            {(user && (user.id === comment.commenter_id || user.id === profileData.id)) && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="ms-3"
                                                >
                                                    Delete
                                                </Button>
                                            )}
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