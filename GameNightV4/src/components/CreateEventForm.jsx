// src/components/CreateEventForm.jsx

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const CreateEventForm = ({ onEventCreated }) => {
    // Destructure all relevant states from useAuth
    const { token, user, loading: authLoading, isAuthenticated } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [selectedGameId, setSelectedGameId] = useState('');
    const [customGameTitle, setCustomGameTitle] = useState('');

    const [userGames, setUserGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [fetchGamesError, setFetchGamesError] = useState(null); // Separate error state for games fetch
    const [loading, setLoading] = useState(false); // For form submission
    const [message, setMessage] = useState(''); // For form submission messages
    const [messageType, setMessageType] = useState('success');

    // Use useCallback to memoize the fetchGames function
    const fetchUserGames = useCallback(async () => {
        // CRITICAL CHANGE: Only fetch if authentication is loaded AND user is authenticated
        if (authLoading || !isAuthenticated) {
            console.warn(`CreateEventForm: Skipping fetchUserGames. authLoading: ${authLoading}, isAuthenticated: ${isAuthenticated}`);
            setLoadingGames(false); // Ensure loading state is false if skipping
            setFetchGamesError('Not authenticated or authentication is still loading.');
            setUserGames([]); // Clear any previous games
            return;
        }

        console.log("CreateEventForm: Attempting to fetch user games...");
        setLoadingGames(true);
        setFetchGamesError(null); // Clear previous errors
        try {
            const response = await fetch('http://localhost:3001/api/games/my-games', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch user games.');
                } else {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch user games. Server response: ${errorText}`);
                }
            }
            const data = await response.json();
            setUserGames(data);
        } catch (error) {
            console.error('Error fetching user games:', error);
            setFetchGamesError(error.message || 'Error loading your game library.');
            setUserGames([]); // Clear games on error
        } finally {
            setLoadingGames(false);
        }
    }, [token, authLoading, isAuthenticated]); // Dependencies: only re-create if these change

    // This useEffect now explicitly waits for authentication to be loaded AND active
    useEffect(() => {
        console.log(`CreateEventForm useEffect triggered. authLoading: ${authLoading}, isAuthenticated: ${isAuthenticated}`);
        if (!authLoading && isAuthenticated) {
            fetchUserGames();
        } else if (!authLoading && !isAuthenticated) {
            // Auth is loaded but not authenticated, handle this state
            setUserGames([]);
            setLoadingGames(false);
            setFetchGamesError("Please log in to manage your game library.");
        }
    }, [authLoading, isAuthenticated, fetchUserGames]); // Dependencies for this useEffect

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEventDate('');
        setEventTime('');
        setLocation('');
        setMaxPlayers('');
        setSelectedGameId('');
        setCustomGameTitle('');
        setMessage(''); // Clear form messages on reset
        setMessageType('success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages

        // Additional guard for form submission
        if (authLoading || !isAuthenticated) {
            setMessage('You are not authenticated to create an event. Please log in.');
            setMessageType('danger');
            setLoading(false);
            return;
        }

        let gameToSendId = selectedGameId;
        let gameToSendTitle = customGameTitle;

        // Validation logic for game selection
        if (selectedGameId) {
            const game = userGames.find(g => g.id === selectedGameId);
            if (game) {
                gameToSendTitle = game.game_title;
            } else {
                setMessage('Selected game not found in your library. Please select again or use custom title.');
                setMessageType('danger');
                setLoading(false);
                return;
            }
        } else if (customGameTitle.trim() === '') {
            setMessage('Please select a game from your library or provide a custom game title.');
            setMessageType('danger');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    event_date: eventDate,
                    event_time: eventTime,
                    location,
                    max_players: maxPlayers ? parseInt(maxPlayers) : null,
                    game_id: gameToSendId || null,
                    game_title: gameToSendTitle || null
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || 'Event created successfully!');
                setMessageType('success');
                resetForm(); // Clear the form fields
                if (onEventCreated) {
                    onEventCreated(); // Notify parent component if event created
                }
            } else {
                setMessage(data.message || 'Failed to create event.');
                setMessageType('danger');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setMessage('Network error or server unavailable.');
            setMessageType('danger');
        } finally {
            setLoading(false);
        }
    };

    // Render logic - show messages for loading or errors
    const renderGameSelection = () => {
        if (authLoading) {
            return <p>Loading authentication status...</p>;
        }
        if (!isAuthenticated) {
            return <Alert variant="warning">Please log in to access your game library.</Alert>;
        }
        if (loadingGames) {
            return <p>Loading your games...</p>;
        }
        if (fetchGamesError) {
            return <Alert variant="danger">{fetchGamesError}</Alert>;
        }
        return (
            <Form.Select
                value={selectedGameId}
                onChange={(e) => {
                    setSelectedGameId(e.target.value);
                    setCustomGameTitle('');
                }}
            >
                <option value="">-- Choose from your library --</option>
                {userGames.map((game) => (
                    <option key={game.id} value={game.id}>
                        {game.game_title} ({game.status.replace(/_/g, ' ')})
                    </option>
                ))}
            </Form.Select>
        );
    };


    return (
        <>
            <h4 className="mb-4">Create New Event</h4>
            {message && <Alert variant={messageType}>{message}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="eventTitle">
                    <Form.Label>Event Title</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g., Friday Night Board Games"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="eventDescription">
                    <Form.Label>Description (Optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Tell your friends about the event..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>

                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="eventDate">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="eventTime">
                            <Form.Label>Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>


                <Form.Group className="mb-3" controlId="eventLocation">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g., My Place, Local Game Store"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="maxPlayers">
                    <Form.Label>Max Players (Optional)</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="e.g., 4"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        min="1"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="selectGame">
                    <Form.Label>Select a Game from Your Library (Optional)</Form.Label>
                    {renderGameSelection()} {/* Call the new render function here */}
                </Form.Group>

                <div className="text-center my-3">OR</div>

                <Form.Group className="mb-3" controlId="customGameTitle">
                    <Form.Label>Enter a Custom Game Title (Optional)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g., Cards Against Humanity"
                        value={customGameTitle}
                        onChange={(e) => {
                            setCustomGameTitle(e.target.value);
                            setSelectedGameId('');
                        }}
                        disabled={!isAuthenticated} // Disable if not authenticated
                    />
                    <Form.Text className="text-muted">
                        If you don't select a game from your library, you can specify one here.
                    </Form.Text>
                </Form.Group>


                <Button variant="primary" type="submit" disabled={loading || authLoading || !isAuthenticated}>
                    {loading ? 'Creating...' : 'Create Event'}
                </Button>
            </Form>
        </>
    );
};

export default CreateEventForm;