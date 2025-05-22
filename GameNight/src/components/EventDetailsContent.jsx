// D:\Game Night\website\src\components\EventDetailsContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, ListGroup, Badge, Button, Form, Alert, Modal, Row, Col, Image
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

// Add onGoBack to the destructured props
const EventDetailsContent = ({ eventId, hostUsername, onEventUpdated, onGoBack }) => { // <--- ADDED onGoBack here
    const { token, user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [friends, setFriends] = useState([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);
    const [inviting, setInviting] = useState(false);
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteMessageType, setInviteMessageType] = useState('');

    const [attendees, setAttendees] = useState([]);

    const [showInviteModal, setShowInviteModal] = useState(false);


    // Helper functions for formatting/badges
    const formatDateTime = (date, time) => {
        const dateTime = new Date(`${date}T${time}`);
        return dateTime.toLocaleString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'cancelled': return 'danger';
            case 'completed': return 'success';
            default: return 'secondary';
        }
    };

    const getAttendeeStatusBadgeVariant = (status) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'invited': return 'info';
            case 'declined': return 'warning';
            case 'attended': return 'secondary';
            default: return 'secondary';
        }
    };


    // Fetch Event Details - NOW ALSO SETS ATTENDEES
    const fetchEventDetails = useCallback(async () => {
        if (!eventId || !token) {
            setLoading(false);
            // If eventId is null but there's a token, perhaps we should clear previous event data
            if (!eventId && token) {
                setEvent(null);
                setAttendees([]);
            }
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/events/${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch event details.');
            }
            const data = await response.json();
            setEvent(data);
            setAttendees(Array.isArray(data.attendees) ? data.attendees : []);
            console.log("Fetched event details (including attendees):", data);
        } catch (err) {
            console.error('Error fetching event details (and attendees):', err);
            setError(err.message);
            setEvent(null); // Clear event data on error
            setAttendees([]);
        } finally {
            setLoading(false);
        }
    }, [eventId, token]);

    // Fetch Friends for Invitation
    const fetchFriends = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:3001/friends', { // Corrected this back to localhost:3001
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch friends.');
            }
            const data = await response.json();
            setFriends(data.friends || []); // Assuming the endpoint returns { friends: [], incomingRequests: [], outgoingRequests: [] }
            console.log("Fetched friends for invite:", data.friends); // Debug log
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    }, [token]);


    // --- useEffects for data fetching ---
    useEffect(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    // This useEffect ensures that when eventId becomes null (e.g., when switching from event-details tab),
    // the component resets its state to reflect "no event selected".
    useEffect(() => {
        if (!eventId) {
            setEvent(null);
            setAttendees([]);
            setLoading(false);
            setError('');
            // No need to setSelectedEventId(null) here, as eventId is a prop, not component state.
        }
    }, [eventId]);


    useEffect(() => {
        if (showInviteModal) {
            fetchFriends(); // Fetch friends only when modal is opening
        }
    }, [showInviteModal, fetchFriends]);


    // --- Invitation Logic ---
    const handleFriendSelection = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedFriendIds((prev) => [...prev, value]);
        } else {
            setSelectedFriendIds((prev) => prev.filter((id) => id !== value));
        }
    };

    const handleSendInvites = async (e) => {
        e.preventDefault();
        setInviting(true);
        setInviteMessage('');
        setInviteMessageType('');

        if (selectedFriendIds.length === 0) {
            setInviteMessage('Please select at least one friend to invite.');
            setInviteMessageType('warning');
            setInviting(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/events/${eventId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ invitedUserIds: selectedFriendIds })
            });

            const data = await response.json();
            if (response.ok) {
                setInviteMessage(data.message || 'Invites sent successfully!');
                setInviteMessageType('success');
                setSelectedFriendIds([]); // Clear selection
                fetchEventDetails(); // Refresh all event data, including attendees
                if (onEventUpdated) onEventUpdated(); // Notify parent
            } else {
                setInviteMessage(data.message || 'Failed to send invites.');
                setInviteMessageType('danger');
            }
        } catch (err) {
            console.error('Error sending invites:', err);
            setInviteMessage('Network error or server unavailable.');
            setInviteMessageType('danger');
        } finally {
            setInviting(false);
            setShowInviteModal(false); // Close modal after attempt
        }
    };

    // --- UI Rendering ---
    // If eventId is null, show a message. This is important when switching away from this tab.
    if (!eventId) {
        return (
            <Card className="mt-3 text-center">
                <Card.Body>
                    <p>Please select an event from "My Events" to see details.</p>
                    {onGoBack && ( // Conditionally render the back button
                        <Button variant="outline-secondary" onClick={onGoBack}>
                            Go to My Events
                        </Button>
                    )}
                </Card.Body>
            </Card>
        );
    }

    if (loading) {
        return <p>Loading event details...</p>;
    }

    if (error) {
        return <Alert variant="danger">Error: {error}</Alert>;
    }

    if (!event) {
        return <Alert variant="info">Event not found.</Alert>;
    }

    const isHost = user && event.host_id === user.id;

    console.log("Current user ID:", user?.id);
    console.log("Event host ID:", event?.host_id);
    console.log("Is Host (evaluated):", isHost);


    // Corrected logic for available friends: use the attendees state directly
    const availableFriendsToInvite = friends.filter(friend =>
        // Check if friend is already in the 'attendees' list (by user_id)
        !attendees.some(attendee => attendee.user_id === friend.id) && friend.id !== user.id
    );


    return (
        <Card className="mt-3">
            <Card.Header as="h4">
                {event.title} <Badge bg={getStatusBadgeVariant(event.status)}>{event.status}</Badge>
                {onGoBack && ( // Add the "Go Back" button to the header as well
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="float-end ms-2" // float-end to align right, ms-2 for margin
                        onClick={onGoBack}
                    >
                        &larr; Go Back
                    </Button>
                )}
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item><strong>Date & Time:</strong> {formatDateTime(event.event_date, event.event_time)}</ListGroup.Item>
                    <ListGroup.Item><strong>Location:</strong> {event.location}</ListGroup.Item> {/* <--- FIXED THIS LINE */}
                    {event.game_title && (
                        <ListGroup.Item><strong>Game:</strong> {event.game_title}</ListGroup.Item>
                    )}
                    {event.description && (
                        <ListGroup.Item><strong>Description:</strong> {event.description}</ListGroup.Item>
                    )}
                    {event.max_players && (
                        <ListGroup.Item><strong>Max Players:</strong> {event.max_players}</ListGroup.Item>
                    )}
                    <ListGroup.Item>
                        <strong>Host:</strong> {event.host_username === user.username ? 'You' : event.host_username || hostUsername}
                    </ListGroup.Item>
                </ListGroup>
                {/* Current User's RSVP Status and Actions */}
                {!isHost && (
                    <div className="mt-4">
                        <h5 className="mb-2">Your RSVP Status:</h5>
                        {attendees.find(att => att.user_id === user.id) ? (
                            <>
                                <Badge bg={getAttendeeStatusBadgeVariant(attendees.find(att => att.user_id === user.id).status)}>
                                    {attendees.find(att => att.user_id === user.id).status.charAt(0).toUpperCase() + attendees.find(att => att.user_id === user.id).status.slice(1)}
                                </Badge>
                                {attendees.find(att => att.user_id === user.id).status === 'invited' && (
                                    <div className="mt-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://localhost:3001/events/${event.id}/rsvp`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ status: 'accepted' })
                                                    });
                                                    if (!response.ok) {
                                                        const errorData = await response.json();
                                                        throw new Error(errorData.message || 'Failed to accept invitation.');
                                                    }
                                                    alert('Invitation accepted!');
                                                    fetchEventDetails(); // Refresh attendees list
                                                    if (onEventUpdated) onEventUpdated(); // Notify parent
                                                } catch (error) {
                                                    console.error('Error accepting invitation:', error);
                                                    alert(error.message);
                                                }
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`http://localhost:3001/events/${event.id}/rsvp`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${token}`
                                                        },
                                                        body: JSON.stringify({ status: 'declined' })
                                                    });
                                                    if (!response.ok) {
                                                        const errorData = await response.json();
                                                        throw new Error(errorData.message || 'Failed to decline invitation.');
                                                    }
                                                    alert('Invitation declined.');
                                                    fetchEventDetails(); // Refresh attendees list
                                                    if (onEventUpdated) onEventUpdated(); // Notify parent
                                                } catch (error) {
                                                    console.error('Error declining invitation:', error);
                                                    alert(error.message);
                                                }
                                            }}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>You are not currently an attendee for this event.</p>
                        )}
                    </div>
                )}
                {isHost && (
                    <Button variant="outline-primary" className="mt-3" onClick={() => setShowInviteModal(true)}>
                        Invite Friends
                    </Button>
                )}

                <h5 className="mt-4">Attendees</h5>
                {loading ? (
                    <p>Loading attendees...</p>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : attendees.length === 0 ? (
                    <p>No attendees yet. {isHost && "Invite some friends!"}</p>
                ) : (
                    <ListGroup>
                        {attendees.map(attendee => (
                            <ListGroup.Item key={attendee.user_id} className="d-flex justify-content-between align-items-center">
                                {attendee.username}
                                <Badge bg={getAttendeeStatusBadgeVariant(attendee.status)}>
                                    {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                                </Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>

            {/* Invite Friends Modal */}
            <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Invite Friends to {event.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {inviteMessage && <Alert variant={inviteMessageType}>{inviteMessage}</Alert>}
                    <Form onSubmit={handleSendInvites}>
                        {availableFriendsToInvite.length === 0 ? (
                            <p>No new friends to invite at the moment (all friends are already attending or invited).</p>
                        ) : (
                            <ListGroup>
                                {availableFriendsToInvite.map(friend => (
                                    <ListGroup.Item key={friend.id} className="d-flex align-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            id={`friend-${friend.id}`}
                                            value={friend.id}
                                            label={friend.username}
                                            checked={selectedFriendIds.includes(String(friend.id))}
                                            onChange={handleFriendSelection}
                                        />
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                        <Button type="submit" variant="primary" className="mt-3" disabled={inviting || selectedFriendIds.length === 0 || availableFriendsToInvite.length === 0}>
                            {inviting ? 'Sending Invites...' : 'Send Invites'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default EventDetailsContent;