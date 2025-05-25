// D:\Game Night\website\src\components\CreateEventForm.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap'; // Removed Container, Card
import { useAuth } from '../contexts/AuthContext';
// Removed useNavigate as it will be handled by the parent or simply show message

const CreateEventForm = ({ onEventCreated }) => { // Added onEventCreated prop
    const { token } = useAuth();

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
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        const fetchUserGames = async () => {
            if (!token) {
                setMessage('You must be logged in to view your game library.');
                setMessageType('danger');
                setLoadingGames(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:3001/api/games/my-games', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user games.');
                }
                const data = await response.json();
                setUserGames(data);
            } catch (error) {
                console.error('Error fetching user games:', error);
                setMessage(error.message || 'Error loading your game library.');
                setMessageType('danger');
            } finally {
                setLoadingGames(false);
            }
        };

        fetchUserGames();
    }, [token]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEventDate('');
        setEventTime('');
        setLocation('');
        setMaxPlayers('');
        setSelectedGameId('');
        setCustomGameTitle('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!token) {
            setMessage('You must be logged in to create an event.');
            setMessageType('danger');
            setLoading(false);
            return;
        }

        let gameToSendId = selectedGameId;
        let gameToSendTitle = customGameTitle;

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

    return (
        <> {/* Changed to fragment as Container/Card are removed */}
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
                    {loadingGames ? (
                        <p>Loading your games...</p>
                    ) : (
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
                    )}
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
                    />
                    <Form.Text className="text-muted">
                        If you don't select a game from your library, you can specify one here.
                    </Form.Text>
                </Form.Group>


                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                </Button>
            </Form>
        </>
    );
};

export default CreateEventForm;