// src/components/Profile/FriendsTab.jsx
import React from 'react';
import { Button, Alert, ListGroup, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import defaultProfilePic from '../../assets/default_profile_pic.png'; // Make sure this path is correct

const FriendsTab = ({
                        token,
                        friendsList,
                        incomingRequests,
                        outgoingRequests,
                        friendsLoading,
                        friendsError,
                        friendsMessage,
                        friendsMessageType,
                        setFriendsMessage,
                        setFriendsMessageType,
                        fetchFriendsData // To re-fetch after friend actions
                    }) => {

    const getProfilePicUrl = (relativePath) => {
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };

    const handleAcceptRequest = async (requesterId) => {
        setFriendsMessage('');
        setFriendsMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/friends/respond`, {
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
            const response = await fetch(`http://localhost:3001/api/friends/respond`, {
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
            const response = await fetch(`http://localhost:3001/api/friends/${friendshipId}`, {
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
            const response = await fetch(`http://localhost:3001/api/friends/${friendshipId}`, {
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

    return (
        // Removed <Tab> wrapper here. The content will be rendered directly inside the React-Bootstrap Tab in ProfilePage.jsx
        <>
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
        </>
    );
};

export default FriendsTab;