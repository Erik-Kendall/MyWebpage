// src/components/Profile/GameLibraryTab.jsx
import React from 'react';
import { Form, Button, Alert, ListGroup } from 'react-bootstrap';

const GameLibraryTab = ({
                            token,
                            userGames,
                            gamesLoading,
                            gamesError,
                            gamesMessage,
                            gamesMessageType,
                            newGameTitle,
                            newGameNotes,
                            newGameStatus,
                            editingGameId,
                            editGameTitle,
                            editGameNotes,
                            editGameStatus,
                            setGamesMessage,
                            setGamesMessageType,
                            setNewGameTitle,
                            setNewGameNotes,
                            setNewGameStatus,
                            setEditingGameId,
                            setEditGameTitle,
                            setEditGameNotes,
                            setEditGameStatus,
                            fetchUserGames // To re-fetch after game actions
                        }) => {

    const handleAddGame = async (e) => {
        e.preventDefault();
        setGamesMessage('');
        setGamesMessageType('success');

        if (!newGameTitle.trim()) {
            setGamesMessage('Game title cannot be empty.');
            setGamesMessageType('danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/games/my-games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_title: newGameTitle.trim(),
                    notes: newGameNotes.trim(),
                    status: newGameStatus,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                setNewGameTitle('');
                setNewGameNotes('');
                setNewGameStatus('owned'); // Reset to default
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to add game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error adding game:', error);
            setGamesMessage('Network error adding game.');
            setGamesMessageType('danger');
        }
    };

    const handleEditGameClick = (game) => {
        setEditingGameId(game.id);
        setEditGameTitle(game.game_title);
        setEditGameNotes(game.notes || ''); // Ensure notes is not null
        setEditGameStatus(game.status);
    };

    const handleSaveGame = async (gameId) => {
        setGamesMessage('');
        setGamesMessageType('success');

        if (!editGameTitle.trim()) {
            setGamesMessage('Game title cannot be empty.');
            setGamesMessageType('danger');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/games/my-games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_title: editGameTitle.trim(),
                    notes: editGameNotes.trim(),
                    status: editGameStatus,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                setEditingGameId(null); // Exit edit mode
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to update game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error updating game:', error);
            setGamesMessage('Network error updating game.');
            setGamesMessageType('danger');
        }
    };

    const handleCancelEditGame = () => {
        setEditingGameId(null);
    };

    const handleDeleteGame = async (gameId) => {
        setGamesMessage('');
        setGamesMessageType('success');
        if (!window.confirm('Are you sure you want to remove this game from your library?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/games/my-games/${gameId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setGamesMessage(data.message);
                await fetchUserGames(); // Refresh the list
            } else {
                setGamesMessage(data.message || 'Failed to remove game.');
                setGamesMessageType('danger');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            setGamesMessage('Network error deleting game.');
            setGamesMessageType('danger');
        }
    };

    return (
        // Removed <Tab> wrapper here. The content will be rendered directly inside the React-Bootstrap Tab in ProfilePage.jsx
        <>
            {gamesLoading ? (
                <p className="text-center mt-3">Loading game library...</p>
            ) : (
                <div className="mt-3">
                    {gamesMessage && <Alert variant={gamesMessageType}>{gamesMessage}</Alert>}
                    {gamesError && <Alert variant="danger">{gamesError}</Alert>}

                    <h4 className="mb-3">Add a New Game</h4>
                    <Form onSubmit={handleAddGame} className="mb-4">
                        <Form.Group className="mb-3">
                            <Form.Label>Game Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter game title"
                                value={newGameTitle}
                                onChange={(e) => setNewGameTitle(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="e.g., Expansion owned, preferred player count, strategy tips"
                                value={newGameNotes}
                                onChange={(e) => setNewGameNotes(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                as="select"
                                value={newGameStatus}
                                onChange={(e) => setNewGameStatus(e.target.value)}
                            >
                                <option value="owned">Owned</option>
                                <option value="wishlist">Wishlist</option>
                                <option value="played">Played</option>
                            </Form.Control>
                        </Form.Group>
                        <Button variant="success" type="submit">Add Game</Button>
                    </Form>

                    <h4 className="mb-3">My Games ({userGames.length})</h4>
                    {userGames.length === 0 ? (
                        <p>You haven't added any games to your library yet. Use the form above to add some!</p>
                    ) : (
                        <ListGroup>
                            {userGames.map(game => (
                                <ListGroup.Item key={game.id} className="d-flex justify-content-between align-items-center">
                                    {editingGameId === game.id ? (
                                        <div className="w-100">
                                            <Form.Group className="mb-2">
                                                <Form.Control
                                                    type="text"
                                                    value={editGameTitle}
                                                    onChange={(e) => setEditGameTitle(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Control
                                                    as="textarea"
                                                    rows={1}
                                                    value={editGameNotes}
                                                    onChange={(e) => setEditGameNotes(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Control
                                                    as="select"
                                                    value={editGameStatus}
                                                    onChange={(e) => setEditGameStatus(e.target.value)}
                                                >
                                                    <option value="owned">Owned</option>
                                                    <option value="wishlist">Wishlist</option>
                                                    <option value="played">Played</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Button variant="success" size="sm" className="me-2" onClick={() => handleSaveGame(game.id)}>Save</Button>
                                            <Button variant="secondary" size="sm" onClick={handleCancelEditGame}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column align-items-start">
                                            <strong>{game.game_title}</strong>
                                            <small className="text-muted">Status: {game.status.replace(/_/g, ' ')}</small>
                                            {game.notes && <small className="text-muted">Notes: {game.notes}</small>}
                                        </div>
                                    )}
                                    <div>
                                        {editingGameId !== game.id && (
                                            <>
                                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditGameClick(game)}>Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteGame(game.id)}>Remove</Button>
                                            </>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </div>
            )}
        </>
    );
};

export default GameLibraryTab;