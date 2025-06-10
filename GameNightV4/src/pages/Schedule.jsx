// src/pages/Schedule.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Tabs, Tab, Card, Alert, ListGroup, Badge, Row, Col, Button } from 'react-bootstrap';
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import CreateEventForm from "../components/CreateEventForm";
import EventDetailsContent from "../components/EventDetailsContent";
// import { useColorblind } from '../contexts/ColorblindContext'; // Not used in this snippet, can remove if not needed
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import './styles/Schedule.css'; // Corrected: Importing Schedule.css (was App.css in comment, but actual import is Schedule.css)

function Schedule() {
    const [activeTab, setActiveTab] = useState('my-availability');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [userEvents, setUserEvents] = useState([]);
    const [fetchError, setFetchError] = useState(null);
    const { user, token, loading: authLoading, isAuthenticated } = useAuth(); // Destructure isAuthenticated

    // Log renders to track component lifecycle
    console.log('Schedule.jsx Render - activeTab:', activeTab, 'selectedEventId:', selectedEventId, 'authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);

    const navigate = useNavigate();

    const fetchUserEvents = useCallback(async () => {
        // CRITICAL CHANGE: Only fetch if authentication is fully resolved AND token is present.
        if (authLoading || !isAuthenticated) {
            console.warn(`Schedule.jsx: Skipping fetchUserEvents. authLoading: ${authLoading}, isAuthenticated: ${isAuthenticated}`);
            return;
        }

        console.log(`Schedule.jsx useEffect - Fetching user events for active tab: ${activeTab}`);
        setFetchError(null); // Clear previous errors
        try {
            const response = await fetch('http://localhost:3001/api/events/my-events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch user events.');
                } else {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch user events. Server response: ${errorText}`);
                }
            }
            const data = await response.json();
            setUserEvents(data);
        } catch (error) {
            console.error('Error fetching user events:', error);
            setFetchError(error.message);
        }
    }, [token, isAuthenticated, authLoading, activeTab]); // Dependencies: only re-create if these change

    // This useEffect now explicitly waits for authentication to be loaded AND active,
    // and for the activeTab to potentially change.
    useEffect(() => {
        console.log(`Schedule.jsx useEffect triggered. authLoading: ${authLoading}, isAuthenticated: ${isAuthenticated}, activeTab: ${activeTab}`);
        if (!authLoading && isAuthenticated) {
            fetchUserEvents();
        } else if (!authLoading && !isAuthenticated) {
            // If auth is loaded but not authenticated, clear events to reflect no access
            setUserEvents([]);
            setFetchError("You are not authenticated to view events.");
            // Optionally, redirect to login, but let's just show the message for now
        }
    }, [authLoading, isAuthenticated, activeTab, fetchUserEvents]);


    const eventsByDate = useMemo(() => {
        const eventsMap = new Map();
        userEvents.forEach(event => {
            if (event && event.event_date) {
                const eventDateKey = event.event_date;
                if (!eventsMap.has(eventDateKey)) {
                    eventsMap.set(eventDateKey, []);
                }
                eventsMap.get(eventDateKey).push(event);
            } else {
                console.warn("Skipping malformed event:", event);
            }
        });
        return eventsMap;
    }, [userEvents]);

    const handleEventClick = (eventId) => {
        setSelectedEventId(eventId);
        setActiveTab('event-details');
    };

    const handleTabSelect = (k) => {
        console.log('Schedule.jsx Tabs onSelect - Selected tab:', k);
        setActiveTab(k);
        if (k !== 'event-details' && selectedEventId) {
            console.log('Schedule.jsx Tabs onSelect - Clearing selectedEventId (navigating away from details).');
            setSelectedEventId(null);
        }
    };

    const renderContent = () => {
        // Show a loading indicator if authentication is still in progress
        if (authLoading) {
            return <Alert variant="info" className="mt-3">Loading authentication status...</Alert>;
        }

        switch (activeTab) {
            case 'my-availability':
                return (
                    <div className="calendar-wrapper">
                        <AvailabilityCalendar
                            eventsByDate={eventsByDate}
                            onEventClick={handleEventClick}
                        />
                    </div>
                );
            case 'create-event':
                return <CreateEventForm token={token} onEventCreated={() => {
                    setActiveTab('my-events');
                    // Ensure CreateEventForm also has a mechanism to fetch games only when authenticated
                    // (we'll address CreateEventForm in Step 2)
                }} />;
            case 'my-events':
                return (
                    <Card className="mt-3">
                        <Card.Body>
                            <Card.Title>My Upcoming Events</Card.Title>
                            {fetchError && <Alert variant="danger">{fetchError}</Alert>}
                            {!isAuthenticated ? (
                                <Alert variant="warning">Please log in to view your events.</Alert>
                            ) : userEvents.length === 0 ? (
                                <p>No events found. Start by creating one!</p>
                            ) : (
                                <ListGroup>
                                    {userEvents.map(event => (
                                        <ListGroup.Item key={event.event_id} className="d-flex justify-content-between align-items-center">
                                            <span>
                                                <strong>{event.title}</strong> - {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                                            </span>
                                            <Button variant="info" size="sm" onClick={() => handleEventClick(event.event_id)}>
                                                Details
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                );
            case 'event-details':
                return selectedEventId ? (
                    <EventDetailsContent eventId={selectedEventId} token={token} onGoBack={() => setActiveTab('my-events')} />
                ) : (
                    <Alert variant="warning">No event selected. Please go back to "My Events" to select one.</Alert>
                );
            default:
                return null;
        }
    };

    return (
        // *** ONLY CHANGE MADE HERE ***
        // Add a specific class to the Container that wraps all content for this page.
        // This class will be styled in Schedule.css to give it the unique background.
        <Container fluid className="content-area schedule-page-background">
            <h1>Schedule Your Game Night!</h1>
            {/* The schedule-tabs-wrapper was not needed as the new class on Container covers everything. */}
            <Tabs
                id="schedule-tabs"
                activeKey={activeTab}
                onSelect={handleTabSelect}
                className="mb-3 schedule-tabs"
            >
                <Tab eventKey="my-availability" title="My Availability"></Tab>
                <Tab eventKey="create-event" title="Create Event"></Tab>
                <Tab eventKey="my-events" title="My Events"></Tab>
                <Tab eventKey="event-details" title="Event Details" disabled={!selectedEventId}></Tab>
            </Tabs>
            {renderContent()}
        </Container>
    );
}

export default Schedule;