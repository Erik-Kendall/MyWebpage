// D:\Game Night\website\src\pages\SearchPage.jsx

import React, { useState, useCallback } from 'react';
import { Container, Form, FormControl, Button, ListGroup, Card, Alert, Spinner, Tabs, Tab, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import defaultProfilePic from '../assets/default_profile_pic.png'; // Make sure this path is correct

const SearchPage = () => {
    const { token, user } = useAuth(); // Logged-in user for self-filtering and auth
    const [activeTab, setActiveTab] = useState('users'); // Default to users tab

    // --- State for User Search ---
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [userSearchError, setUserSearchError] = useState('');

    // --- State for Game Search ---
    const [gameSearchQuery, setGameSearchQuery] = useState('');
    const [gameSearchResults, setGameSearchResults] = useState([]);
    const [gameSearchLoading, setGameSearchLoading] = useState(false);
    const [gameSearchError, setGameSearchError] = useState('');
    const [gameSearchMessage, setGameSearchMessage] = useState('');
    const [gameSearchMessageType, setGameSearchMessageType] = useState('success');
    const [addedGames, setAddedGames] = useState({}); // To track which games have been added to library

    // Helper for profile picture URL
    const getProfilePicUrl = (relativePath) => {
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };

    // --- User Search Handlers ---
    const handleUserSearch = useCallback(async (e) => {
        e.preventDefault();
        setUserSearchLoading(true);
        setUserSearchError('');
        setUserSearchResults([]); // Clear previous results

        if (!token) {
            setUserSearchError('You must be logged in to search for users.');
            setUserSearchLoading(false);
            return;
        }

        if (!userSearchTerm.trim()) {
            setUserSearchError('Please enter a search term.');
            setUserSearchLoading(false);
            return;
        }

        // Prevent searching for yourself (optional, but good practice)
        if (user && userSearchTerm.toLowerCase() === user.username.toLowerCase()) {
            setUserSearchError("You cannot search for your own username.");
            setUserSearchLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/users/search?term=${encodeURIComponent(userSearchTerm.trim())}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user search results.');
            }

            const data = await response.json();
            // Filter out the current user from search results if they somehow appear
            const filteredData = data.filter(foundUser => user && foundUser.id !== user.id);
            setUserSearchResults(filteredData);

            if (filteredData.length === 0) {
                setUserSearchError(`No users found matching "${userSearchTerm}".`);
            }

        } catch (err) {
            console.error('Error during user search:', err);
            setUserSearchError(err.message || 'An error occurred during user search.');
        } finally {
            setUserSearchLoading(false);
        }
    }, [userSearchTerm, token, user]);

    // --- Game Search Handlers ---
    const handleGameSearch = useCallback(async (e) => {
        e.preventDefault();
        setGameSearchLoading(true);
        setGameSearchError('');
        setGameSearchMessage(''); // Clear previous messages
        setGameSearchResults([]); // Clear previous results
        setAddedGames({}); // Clear added state for new search

        if (!gameSearchQuery.trim()) {
            setGameSearchError('Please enter a game title to search.');
            setGameSearchLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/games/search?q=${encodeURIComponent(gameSearchQuery.trim())}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to search for games.');
            }
            const data = await response.json();
            setGameSearchResults(data);
            if (data.length === 0) {
                setGameSearchMessage('No games found matching your search.');
                setGameSearchMessageType('info');
            }
        } catch (err) {
            console.error('Error during game search:', err);
            setGameSearchError(err.message || 'An error occurred during game search.');
        } finally {
            setGameSearchLoading(false);
        }
    }, [gameSearchQuery]);

    const handleAddGameToLibrary = useCallback(async (gameTitle, gameId) => {
        setGameSearchMessage('');
        setGameSearchMessageType('success');

        if (!token) {
            setGameSearchMessage('You must be logged in to add games to your library.');
            setGameSearchMessageType('danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/games/my-games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_title: gameTitle,
                    notes: '', // Can allow user to add notes later, or keep empty
                    status: 'owned', // Default to 'owned' when adding from search
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setGameSearchMessage(`"${gameTitle}" added to your library!`);
                setGameSearchMessageType('success');
                setAddedGames(prev => ({ ...prev, [gameId]: true })); // Mark as added
            } else {
                setGameSearchMessage(data.message || `Failed to add "${gameTitle}" to your library.`);
                setGameSearchMessageType('danger');
            }
        } catch (error) {
            console.error('Error adding game to library:', error);
            setGameSearchMessage('Network error when adding game.');
            setGameSearchMessageType('danger');
        }
    }, [token]);


    return (
        <Container className="mt-5">
            <Card className="p-4">
                <h2 className="mb-4 text-center">Search</h2>

                <Tabs
                    id="search-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => {
                        setActiveTab(k);
                        // Optionally clear messages/errors when switching tabs
                        setUserSearchError('');
                        setGameSearchError('');
                        setGameSearchMessage('');
                    }}
                    className="mb-3"
                >
                    <Tab eventKey="users" title="Search Users">
                        <div className="mt-3">
                            {userSearchError && <Alert variant="danger">{userSearchError}</Alert>}

                            <Form onSubmit={handleUserSearch} className="mb-4 d-flex">
                                <FormControl
                                    type="text"
                                    placeholder="Search by username, first name, or last name"
                                    className="me-2"
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                />
                                <Button variant="primary" type="submit" disabled={userSearchLoading}>
                                    {userSearchLoading ? <Spinner animation="border" size="sm" /> : 'Search'}
                                </Button>
                            </Form>

                            <ListGroup>
                                {userSearchResults.length > 0 ? (
                                    userSearchResults.map((foundUser) => (
                                        <ListGroup.Item key={foundUser.username} className="mb-2">
                                            <Card>
                                                <Card.Body className="d-flex align-items-center">
                                                    <Image
                                                        src={getProfilePicUrl(foundUser.profilePictureUrl)}
                                                        alt="Profile"
                                                        className="rounded-circle me-3"
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <Card.Title className="mb-0">{foundUser.username}</Card.Title>
                                                        {foundUser.firstName && foundUser.lastName && (
                                                            <Card.Subtitle className="mb-2 text-muted">
                                                                {foundUser.firstName} {foundUser.lastName}
                                                            </Card.Subtitle>
                                                        )}
                                                        <Link to={`/public-profile/${foundUser.username}`} className="btn btn-sm btn-outline-info">
                                                            View Profile
                                                        </Link>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    !userSearchLoading && !userSearchError && userSearchTerm.trim() && <p className="text-center">No users found matching "{userSearchTerm}".</p>
                                )}
                                {!userSearchTerm.trim() && !userSearchLoading && <p className="text-center">Enter a term to search for users.</p>}
                                {!token && <Alert variant="warning" className="mt-3 text-center">You must be logged in to search for users.</Alert>}
                            </ListGroup>
                        </div>
                    </Tab>

                    <Tab eventKey="games" title="Discover Games">
                        <div className="mt-3">
                            {gameSearchMessage && <Alert variant={gameSearchMessageType}>{gameSearchMessage}</Alert>}
                            {gameSearchError && <Alert variant="danger">{gameSearchError}</Alert>}

                            <Form onSubmit={handleGameSearch} className="mb-4 d-flex">
                                <FormControl
                                    type="text"
                                    placeholder="Search for a game title..."
                                    className="me-2"
                                    value={gameSearchQuery}
                                    onChange={(e) => setGameSearchQuery(e.target.value)}
                                />
                                <Button variant="primary" type="submit" disabled={gameSearchLoading}>
                                    {gameSearchLoading ? <Spinner animation="border" size="sm" /> : 'Search'}
                                </Button>
                            </Form>

                            {gameSearchResults.length > 0 && (
                                <div className="mt-4">
                                    <h4>Search Results</h4>
                                    <ListGroup>
                                        {gameSearchResults.map(game => (
                                            <ListGroup.Item key={game.id} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{game.title}</strong>
                                                    {game.description && <p className="text-muted mb-0"><small>{game.description}</small></p>}
                                                </div>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleAddGameToLibrary(game.title, game.id)}
                                                    disabled={!token || addedGames[game.id]} // Disable if not logged in or already added
                                                >
                                                    {addedGames[game.id] ? 'Added' : 'Add to Library'}
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </div>
                            )}
                            {!gameSearchQuery.trim() && !gameSearchLoading && <p className="text-center">Enter a term to search for games.</p>}
                            {!token && <Alert variant="warning" className="mt-3 text-center">You must be logged in to add games to your library.</Alert>}
                        </div>
                    </Tab>
                </Tabs>
            </Card>
        </Container>
    );
};

export default SearchPage;