// D:\Game Night\website\src\components\EventDetailsContent.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, ListGroup, Badge, Button, Form, Alert, Modal, Row, Col, Image
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

// IMPORTANT: NO 'uuid' IMPORT HERE. This is a frontend component.

const EventDetailsContent = ({ eventId, hostUsername, onEventUpdated, onGoBack }) => {
    const { token, user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [friends, setFriends] = useState([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);
    const [inviting, setInviting] = useState(false);
    const [inviteMessage, setInviteMessage] = useState('');
    const [inviteMessageType, setInviteMessageType] = useState(''); // Corrected: should be useState('')

    const [attendees, setAttendees] = useState([]);

    const [showInviteModal, setShowInviteModal] = useState(false);

    // LOG A: Log render of EventDetailsContent and its received eventId prop
    console.log('EventDetailsContent.jsx Render - eventId prop received:', eventId);


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
        // LOG B: Log when fetchEventDetails is called
        console.log('EventDetailsContent.jsx fetchEventDetails - Attempting fetch for eventId:', eventId);
        if (!eventId || !token) {
            console.log('EventDetailsContent.jsx fetchEventDetails - Skipping fetch: eventId or token is null/undefined.'); // LOG C
            setLoading(false);
            if (!eventId && token) {
                setEvent(null);
                setAttendees([]);
            }
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/events/${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch event details.');
            }
            const data = await response.json();
            setEvent(data);
            setAttendees(Array.isArray(data.attendees) ? data.attendees : []);
            console.log("EventDetailsContent.jsx Fetched event details (including attendees):", data); // LOG D
        } catch (err) {
            console.error('EventDetailsContent.jsx Error fetching event details (and attendees):', err); // LOG E
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
            const response = await fetch('http://localhost:3001/api/friends', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch friends.');
            }
            const data = await response.json();
            setFriends(data.friends || []);
            console.log("EventDetailsContent.jsx Fetched friends for invite:", data.friends);

            // *** ADDED LOGS HERE FOR DEBUGGING friend.id ***
            if (data.friends && Array.isArray(data.friends)) {
                console.log("--- Debugging Friends Data (EventDetailsContent.jsx) ---");
                data.friends.forEach((friend, index) => {
                    console.log(`Friend ${index}:`);
                    console.log(`  Username: ${friend.username}`);
                    console.log(`  ID: "${friend.id}"`);
                    console.log(`  Type of ID: ${typeof friend.id}`);
                    if (friend.id === "" || friend.id === null || friend.id === undefined) {
                        console.warn(`  WARNING: Friend ID is empty, null, or undefined for ${friend.username}`);
                    }
                });
                console.log("--- End Debugging Friends Data ---");
            } else {
                console.warn("EventDetailsContent.jsx: 'friends' data is not an array or is null/undefined.", data);
            }
            // *************************************************

        } catch (err) {
            console.error('EventDetailsContent.jsx Error fetching friends:', err);
        }
    }, [token]);


    // --- useEffects for data fetching ---
    useEffect(() => {
        // LOG F: Log when this useEffect runs
        console.log('EventDetailsContent.jsx useEffect [fetchEventDetails] triggered.');
        fetchEventDetails();
    }, [fetchEventDetails]);

    // This useEffect ensures that when eventId becomes null (e.g., when switching from event-details tab),
    // the component resets its state to reflect "no event selected".
    useEffect(() => {
        // LOG G: Log when this useEffect runs (for eventId null check)
        console.log('EventDetailsContent.jsx useEffect [eventId] triggered. Current eventId:', eventId);
        if (!eventId) {
            setEvent(null);
            setAttendees([]);
            setLoading(false);
            setError('');
        }
    }, [eventId]);


    useEffect(() => {
        if (showInviteModal) {
            fetchFriends();
        }
    }, [showInviteModal, fetchFriends]);


    // --- Invitation Logic ---
    const handleFriendSelection = (e) => {
        const { value, checked } = e.target;
        // Ensure the value is always treated as a string for consistency
        const friendIdAsString = String(value);

        if (checked) {
            setSelectedFriendIds((prev) => [...prev, friendIdAsString]);
        } else {
            setSelectedFriendIds((prev) => prev.filter((id) => id !== friendIdAsString));
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

        // Log the IDs being sent for debugging
        console.log("EventDetailsContent.jsx: Sending invites with IDs:", selectedFriendIds);

        try {
            const response = await fetch(`http://localhost:3001/api/events/${eventId}/invite`, {
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
                setSelectedFriendIds([]); // Clear selections after sending
                fetchEventDetails(); // Re-fetch event details to update attendee list
                if (onEventUpdated) onEventUpdated(); // Notify parent (Schedule.jsx) to update its events
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
            // setShowInviteModal(false); // Close modal only on success or if user manually closes
        }
    };

    // --- UI Rendering ---
    // If eventId is null, show a message. This is important when switching away from this tab.
    if (!eventId) {
        // LOG H: Log when the "no event selected" message is rendered
        console.log('EventDetailsContent.jsx Rendering: No eventId, showing placeholder.');
        return (
            <Card className="mt-3 text-center">
                <Card.Body>
                    <p>Please select an event from "My Events" to see details.</p>
                    {onGoBack && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="float-end ms-2"
                            onClick={onGoBack}
                        >
                            &larr; Go Back
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


    const availableFriendsToInvite = friends.filter(friend =>
        // Only show friends who are not already in the attendees list for this event
        // and are not the current user (host) themselves
        !attendees.some(attendee => attendee.user_id === friend.id) && friend.id !== user.id
    );


    return (
        <Card className="mt-3">
            <Card.Header as="h4">
                {event.title} <Badge bg={getStatusBadgeVariant(event.status)}>{event.status}</Badge>
                {onGoBack && (
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="float-end ms-2"
                        onClick={onGoBack}
                    >
                        &larr; Go Back
                    </Button>
                )}
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item><strong>Date & Time:</strong> {formatDateTime(event.event_date, event.event_time)}</ListGroup.Item>
                    <ListGroup.Item><strong>Location:</strong> {event.location}</ListGroup.Item>
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
                                                    const response = await fetch(`http://localhost:3001/api/events/${event.id}/rsvp`, {
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
                                                    fetchEventDetails();
                                                    if (onEventUpdated) onEventUpdated();
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
                                                    const response = await fetch(`http://localhost:3001/api/events/${event.id}/rsvp`, {
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
                                                    fetchEventDetails();
                                                    if (onEventUpdated) onEventUpdated();
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
                                            value={friend.id} // This is the value that's sent to handleFriendSelection
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