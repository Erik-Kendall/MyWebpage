// D:\Game Night\website\src\pages\Schedule.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Container, Tabs, Tab, Card, Alert, ListGroup, Badge, Row, Col, Button } from 'react-bootstrap';
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import CreateEventForm from "../components/CreateEventForm";
import EventDetailsContent from "../components/EventDetailsContent";
import { useColorblind } from '../contexts/ColorblindContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Schedule = () => {
    const { colorblindMode } = useColorblind();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('my-availability');
    const [eventCreationMessage, setEventCreationMessage] = useState({ text: '', type: '' });

    const [userEvents, setUserEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');

    const [selectedEventId, setSelectedEventId] = useState(null);

    // LOG 1: Log initial state and every re-render of Schedule
    console.log('Schedule.jsx Render - activeTab:', activeTab, 'selectedEventId:', selectedEventId);


    const fetchUserEvents = useCallback(async () => {
        if (!token) {
            setEventsError('You must be logged in to view your events.');
            setLoadingEvents(false);
            return;
        }
        setLoadingEvents(true);
        setEventsError('');
        try {
            const response = await fetch('http://localhost:3001/api/events/my-events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch events.');
            }

            const data = await response.json();
            data.sort((a, b) => {
                const dateTimeA = new Date(`${a.event_date}T${a.event_time}`);
                const dateTimeB = new Date(`${b.event_date}T${b.event_time}`);
                return dateTimeA.getTime() - dateTimeB.getTime();
            });
            setUserEvents(data);
            console.log("Fetched User Events:", data);
        } catch (error) {
            console.error('Error fetching user events:', error);
            setEventsError(error.message || 'An error occurred while loading events.');
        } finally {
            setLoadingEvents(false);
        }
    }, [token]);

    // Derived state for calendar events
    const eventsByDate = React.useMemo(() => {
        const eventsMap = new Map();
        userEvents.forEach(event => {
            const eventDateKey = event.event_date; // Assuming event_date is already 'YYYY-MM-DD'
            if (!eventsMap.has(eventDateKey)) {
                eventsMap.set(eventDateKey, []);
            }
            eventsMap.get(eventDateKey).push(event);
        });
        return eventsMap;
    }, [userEvents]);


    useEffect(() => {
        // LOG 2: Log when fetchUserEvents is triggered by useEffect
        console.log('Schedule.jsx useEffect - Fetching user events due to tab/token/user change. Active tab:', activeTab);
        if (token && user) {
            if (activeTab === 'my-events' || activeTab === 'my-availability' || activeTab === 'event-details') {
                fetchUserEvents();
            }
        } else {
            setUserEvents([]);
            setEventsError('Please log in to view your schedule and availability.');
            setLoadingEvents(false);
        }
    }, [token, user, activeTab, fetchUserEvents]);


    const handleEventCreated = () => {
        setEventCreationMessage({ text: 'Event successfully created!', type: 'success' });
        setActiveTab('my-events');
        fetchUserEvents();
    };

    const handleEventClick = (eventId) => {
        // LOG 3: Log when an event is clicked and state is updated
        console.log('Schedule.jsx handleEventClick - Setting selectedEventId to:', eventId);
        setSelectedEventId(eventId);
        setActiveTab('event-details');
        setEventCreationMessage({ text: '', type: '' });
    };

    const isUpcoming = (eventDate, eventTime) => {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        const now = new Date();
        return eventDateTime > now;
    };

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

    // Render a message for non-logged-in users
    if (!token) {
        return (
            <Container className={`mt-5 ${colorblindMode ? 'colorblind' : ''}`}>
                <Card>
                    <Card.Body className="text-center">
                        <h1 className="mb-4">Schedule</h1>
                        <p>Please log in to view and manage your schedule and availability.</p>
                        <Button variant="primary" onClick={() => navigate('/login')}>Log In</Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }


    return (
        <Container className={`mt-5 ${colorblindMode ? 'colorblind' : ''}`}>
            <Card>
                <Card.Body>
                    <h1 className="mb-4">Schedule Your Game Night!</h1>
                    {eventCreationMessage.text && (
                        <Alert variant={eventCreationMessage.type} onClose={() => setEventCreationMessage({ text: '', type: '' })} dismissible>
                            {eventCreationMessage.text}
                        </Alert>
                    )}
                    <Tabs
                        id="schedule-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => {
                            // LOG 4: Log when a tab is selected
                            console.log('Schedule.jsx Tabs onSelect - Selected tab:', k);
                            setActiveTab(k);
                            setEventCreationMessage({ text: '', type: '' });
                            if (k !== 'event-details') {
                                // LOG 5: Log when selectedEventId is being cleared
                                console.log('Schedule.jsx Tabs onSelect - Clearing selectedEventId (navigating away from details).');
                                setSelectedEventId(null);
                            }
                        }}
                        className="mb-3"
                    >
                        {/* My Availability Tab */}
                        <Tab eventKey="my-availability" title="My Availability">
                            <div className="mt-3">
                                <AvailabilityCalendar
                                    eventsByDate={eventsByDate}
                                    onEventClick={handleEventClick}
                                />
                            </div>
                        </Tab>

                        {/* Create Event Tab */}
                        <Tab eventKey="create-event" title="Create Event">
                            <div className="mt-3">
                                <CreateEventForm onEventCreated={handleEventCreated} />
                            </div>
                        </Tab>

                        {/* My Events Tab */}
                        <Tab eventKey="my-events" title={`My Events (${userEvents.length})`}>
                            <div className="mt-3">
                                {loadingEvents ? (
                                    <p>Loading your events...</p>
                                ) : eventsError ? (
                                    <Alert variant="danger">{eventsError}</Alert>
                                ) : userEvents.length === 0 ? (
                                    <p>You haven't created or been invited to any events yet.</p>
                                ) : (
                                    <ListGroup>
                                        {userEvents.map(event => {
                                            return (
                                                <ListGroup.Item
                                                    key={event.event_id} // CHANGED: event.id to event.event_id
                                                    className="mb-3 d-block"
                                                >
                                                    <Row className="align-items-center">
                                                        <Col md={8}>
                                                            <h5>{event.title}</h5>
                                                            <p className="mb-1">
                                                                <strong>Date & Time:</strong> {formatDateTime(event.event_date, event.event_time)}
                                                            </p>
                                                            <p className="mb-1">
                                                                <strong>Location:</strong> {event.location}
                                                            </p>
                                                            {event.game_title && (
                                                                <p className="mb-1">
                                                                    <strong>Game:</strong> {event.game_title}
                                                                </p>
                                                            )}
                                                            <p className="mb-1">
                                                                <strong>Host:</strong> {event.host_username === user.username ? 'You' : event.host_username}
                                                            </p>
                                                        </Col>
                                                        <Col md={4} className="text-md-end mt-2 mt-md-0">
                                                            <Badge bg={getStatusBadgeVariant(event.status)} className="me-2">
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </Badge>
                                                            {event.user_role === 'attendee' && event.attendee_status && (
                                                                <Badge bg={getAttendeeStatusBadgeVariant(event.attendee_status)} className="ms-2">
                                                                    Status: {event.attendee_status.charAt(0).toUpperCase() + event.attendee_status.slice(1)}
                                                                </Badge>
                                                            )}
                                                            {isUpcoming(event.event_date, event.event_time) ? (
                                                                <Badge bg="success" className="ms-2">Upcoming</Badge>
                                                            ) : (
                                                                <Badge bg="secondary" className="ms-2">Past</Badge>
                                                            )}
                                                            <Button variant="outline-info" size="sm" className="mt-2" onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEventClick(event.event_id); // CHANGED: event.id to event.event_id
                                                            }}>View Details</Button>
                                                            {event.user_role === 'attendee' && event.attendee_status === 'invited' && isUpcoming(event.event_date, event.event_time) && (
                                                                <div className="mt-2">
                                                                    <Button
                                                                        variant="success"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                const response = await fetch(`http://localhost:3001/api/events/${event.event_id}/rsvp`, { // CHANGED here too for consistency, though not the primary bug cause
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
                                                                                fetchUserEvents();
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
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                const response = await fetch(`http://localhost:3001/api/events/${event.event_id}/rsvp`, { // CHANGED here too for consistency
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
                                                                                fetchUserEvents();
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
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                )}
                            </div>
                        </Tab>

                        <Tab eventKey="event-details" title="Event Details" disabled={!selectedEventId}>
                            {/* The conditional rendering logic from before is still here. */}
                            {selectedEventId ? (
                                <EventDetailsContent
                                    eventId={selectedEventId}
                                    onEventUpdated={fetchUserEvents}
                                    onGoBack={() => {
                                        console.log('Schedule.jsx onGoBack - Clearing selectedEventId and switching to my-events.'); // LOG 6
                                        setSelectedEventId(null);
                                        setActiveTab('my-events');
                                    }}
                                />
                            ) : (
                                <div className="mt-3 text-center">
                                    <Card.Body>
                                        <p>Please select an event from "My Events" or "My Availability" to see details.</p>
                                        <Button variant="outline-secondary" onClick={() => setActiveTab('my-events')}>
                                            Go to My Events
                                        </Button>
                                    </Card.Body>
                                </div>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Schedule;