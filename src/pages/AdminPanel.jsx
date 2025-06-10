// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Button, Alert, Spinner, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const { token, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // --- State Management ---
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [friendships, setFriendships] = useState([]);
    const [masterGames, setMasterGames] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // State for User Edit Modal
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editedUserFormData, setEditedUserFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        profilePictureUrl: ''
    });

    // State for Master Game Add/Edit Modal
    const [showMasterGameModal, setShowMasterGameModal] = useState(false);
    const [editingMasterGame, setEditingMasterGame] = useState(null);
    const [masterGameFormData, setMasterGameFormData] = useState({
        title: '',
        thumbnailUrl: '',
        description: ''
    });

    // --- Data Fetching Functions ---

    const fetchUsers = useCallback(async () => {
        setError('');
        setLoading(true);
        if (!token) { setError('Authentication token not found. Please log in.'); setLoading(false); return; }
        try {
            const response = await fetch('http://localhost:3001/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch users.'); }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users for admin panel:', err);
            setError(err.message || 'An error occurred while fetching users.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchEvents = useCallback(async () => {
        setError('');
        setLoading(true);
        if (!token) { setError('Authentication token not found. Please log in.'); setLoading(false); return; }
        try {
            const response = await fetch('http://localhost:3001/api/events', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch events.'); }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events for admin panel:', err);
            setError(err.message || 'An error occurred while fetching events.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchFriendships = useCallback(async () => {
        setError('');
        setLoading(true);
        if (!token) { setError('Authentication token not found. Please log in.'); setLoading(false); return; }
        try {
            const response = await fetch('http://localhost:3001/api/admin/friendships', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch friendships.'); }
            const data = await response.json();
            setFriendships(data);
        } catch (err) {
            console.error('Error fetching friendships for admin panel:', err);
            setError(err.message || 'An error occurred while fetching friendships.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchMasterGames = useCallback(async () => {
        setError('');
        setLoading(true);
        if (!token) { setError('Authentication token not found. Please log in.'); setLoading(false); return; }
        try {
            const response = await fetch('http://localhost:3001/api/games', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to fetch master games.'); }
            const data = await response.json();
            setMasterGames(data);
        } catch (err) {
            console.error('Error fetching master games for admin panel:', err);
            setError(err.message || 'An error occurred while fetching master games.');
        } finally {
            setLoading(false);
        }
    }, [token]);


    // --- Lifecycle and Authorization Check ---

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login', { replace: true });
                return;
            }
            if (!isAdmin) {
                navigate('/', { replace: true });
                alert('Access Denied: You do not have administrator privileges.');
                return;
            }
            fetchUsers();
            fetchEvents();
            fetchFriendships();
            fetchMasterGames();
        }
    }, [authLoading, isAuthenticated, isAdmin, navigate, fetchUsers, fetchEvents, fetchFriendships, fetchMasterGames]);

    // --- Admin Actions (User Management) ---

    const handleSetAdminStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to set this user's admin status to ${newStatus}?`)) {
            return;
        }
        setMessage(''); setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/set-admin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isAdmin: newStatus }),
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchUsers(); }
            else { throw new Error(data.message || 'Failed to update admin status.'); }
        } catch (err) {
            console.error('Error setting admin status:', err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${username}" and all their associated data (events, friends, games, etc.)? This action cannot be undone.`)) {
            return;
        }
        setMessage(''); setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message); setMessageType('success');
                fetchUsers();
                fetchEvents();
                fetchFriendships();
            } else { throw new Error(data.message || 'Failed to delete user.'); }
        } catch (err) {
            console.error('Error deleting user:', err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    const handleShowUserEditModal = (user) => {
        setEditingUser(user);
        setEditedUserFormData({
            username: user.username,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            profilePictureUrl: user.profilePictureUrl || ''
        });
        setShowUserEditModal(true);
    };

    const handleCloseUserEditModal = () => {
        setShowUserEditModal(false);
        setEditingUser(null);
        setEditedUserFormData({ username: '', firstName: '', lastName: '', email: '', profilePictureUrl: '' });
    };

    const handleUserFormChange = (e) => {
        const { name, value } = e.target;
        setEditedUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setMessage(''); setMessageType('success');
        if (!editingUser) return;
        try {
            const response = await fetch(`http://localhost:3001/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editedUserFormData),
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchUsers(); handleCloseUserEditModal(); }
            else { throw new Error(data.message || 'Failed to update user.'); }
        } catch (err) {
            console.error('Error updating user:', err);
            setMessage(err.message || 'An error occurred while updating user.'); setMessageType('danger');
        }
    };

    // --- Admin Actions (Event Management) ---
    const handleDeleteEvent = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete the event "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }
        setMessage(''); setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchEvents(); }
            else { throw new Error(data.message || 'Failed to delete event.'); }
        } catch (err) {
            console.error('Error deleting event:', err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    // --- Admin Actions (Friendship Management) ---
    const handleDeleteFriendship = async (friendshipId, user1, user2) => {
        if (!window.confirm(`Are you sure you want to delete the friendship between ${user1} and ${user2}? This action cannot be undone.`)) {
            return;
        }
        setMessage(''); setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/friendships/${friendshipId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchFriendships(); }
            else { throw new Error(data.message || 'Failed to delete friendship.'); }
        } catch (err) {
            console.error('Error deleting friendship:', err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    // --- Admin Actions (Master Game Management) ---

    const handleShowMasterGameModal = (game = null) => {
        setEditingMasterGame(game);
        if (game) {
            setMasterGameFormData({
                title: game.title,
                thumbnailUrl: game.thumbnailUrl || '',
                description: game.description || ''
            });
        } else {
            setMasterGameFormData({
                title: '',
                thumbnailUrl: '',
                description: ''
            });
        }
        setShowMasterGameModal(true);
    };

    const handleCloseMasterGameModal = () => {
        setShowMasterGameModal(false);
        setEditingMasterGame(null);
        setMasterGameFormData({ title: '', thumbnailUrl: '', description: '' });
    };

    const handleMasterGameFormChange = (e) => {
        const { name, value } = e.target;
        setMasterGameFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdateMasterGame = async (e) => {
        e.preventDefault();
        setMessage(''); setMessageType('success');

        const method = editingMasterGame ? 'PUT' : 'POST';
        const url = editingMasterGame
            ? `http://localhost:3001/api/admin/games/master/${editingMasterGame.id}`
            : 'http://localhost:3001/api/admin/games/master';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(masterGameFormData),
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchMasterGames(); handleCloseMasterGameModal(); }
            else { throw new Error(data.message || `Failed to ${editingMasterGame ? 'update' : 'add'} master game.`); }
        } catch (err) {
            console.error(`Error ${editingMasterGame ? 'updating' : 'adding'} master game:`, err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    const handleDeleteMasterGame = async (gameId, gameTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete the master game "${gameTitle}"? This will remove it from the system's available games, but not from users' collections or existing events. This action cannot be undone.`)) {
            return;
        }
        setMessage(''); setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/api/admin/games/master/${gameId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) { setMessage(data.message); setMessageType('success'); fetchMasterGames(); }
            else { throw new Error(data.message || 'Failed to delete master game.'); }
        } catch (err) {
            console.error('Error deleting master game:', err);
            setMessage(err.message || 'An error occurred.'); setMessageType('danger');
        }
    };

    // --- NEW: Safer Reset Actions ---

    const handleClearAllCaches = async () => {
        if (!window.confirm('Are you sure you want to clear ALL server-side caches? This may temporarily impact performance while caches rebuild.')) {
            return;
        }
        setMessage('');
        setMessageType('success');
        try {
            const response = await fetch('http://localhost:3001/api/admin/reset/clear-cache', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                // No data refresh needed, as cache clearing is backend-side
            } else {
                throw new Error(data.message || 'Failed to clear caches.');
            }
        } catch (err) {
            console.error('Error clearing caches:', err);
            setMessage(err.message || 'An error occurred while clearing caches.');
            setMessageType('danger');
        }
    };

    const handleForceGlobalPasswordReset = async () => {
        if (!window.confirm('WARNING: Are you absolutely sure you want to force ALL users to reset their passwords? This is a highly disruptive action and should only be used in a security emergency. Users will be logged out and required to set a new password upon their next login.')) {
            return;
        }
        // Add an extra layer of confirmation for this critical action
        const confirmAgain = prompt("Type 'CONFIRM RESET' to proceed with forcing global password reset:");
        if (confirmAgain !== 'CONFIRM RESET') {
            setMessage('Global password reset cancelled.');
            setMessageType('info');
            return;
        }

        setMessage('');
        setMessageType('success');
        try {
            const response = await fetch('http://localhost:3001/api/admin/reset/force-password-reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message + ' Advise users to check their email for instructions if applicable.');
                setMessageType('success');
                // You might want to refresh users or just rely on the message
                fetchUsers(); // To reflect potentially updated last_password_reset_at
            } else {
                throw new Error(data.message || 'Failed to force global password reset.');
            }
        } catch (err) {
            console.error('Error forcing global password reset:', err);
            setMessage(err.message || 'An error occurred while forcing global password reset.');
            setMessageType('danger');
        }
    };


    // --- Render Logic ---

    if (authLoading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading authentication status...</span>
                </Spinner>
            </Container>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">
                    Access Denied. You must be an administrator to view this page.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <h2 className="mb-4">Admin Panel</h2>

                    {message && <Alert variant={messageType}>{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading data...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {/* ... (Existing sections for User, Event, Friendship, Master Game Management) ... */}

                            {/* NEW: Safer Reset Actions Section */}
                            <hr className="my-5" />
                            <h3 className="mt-4 mb-3">System Maintenance & Resets</h3>
                            <div className="d-flex flex-wrap gap-3 mb-5">
                                <Button variant="warning" onClick={handleClearAllCaches}>
                                    Clear All Server Caches
                                </Button>
                                <Button variant="danger" onClick={handleForceGlobalPasswordReset}>
                                    Force Global Password Reset
                                </Button>
                                {/* Add more 'soft reset' buttons here as needed */}
                            </div>

                            {/* User Management Section */}
                            <h3 className="mt-4 mb-3">User Management ({users.length} Users)</h3>
                            <Table striped bordered hover responsive className="mb-5">
                                <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Registered On</th>
                                    <th>Is Admin</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.firstName || '-'}</td>
                                            <td>{user.lastName || '-'}</td>
                                            <td>{user.email || '-'}</td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Form.Check
                                                    type="switch"
                                                    id={`admin-switch-${user.id}`}
                                                    label={user.isAdmin ? 'Yes' : 'No'}
                                                    checked={user.isAdmin}
                                                    onChange={() => handleSetAdminStatus(user.id, user.isAdmin)}
                                                    disabled={user.id === token.id}
                                                />
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleShowUserEditModal(user)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    disabled={user.id === token.id}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </Table>

                            {/* Event Management Section */}
                            <h3 className="mt-4 mb-3">Event Management ({events.length} Events)</h3>
                            <Table striped bordered hover responsive className="mb-5">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Host</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No events found.</td>
                                    </tr>
                                ) : (
                                    events.map(event => (
                                        <tr key={event.id}>
                                            <td>{event.title}</td>
                                            <td>{event.host_username}</td>
                                            <td>{new Date(event.event_date).toLocaleDateString()}</td>
                                            <td>{event.location}</td>
                                            <td>{event.status}</td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteEvent(event.id, event.title)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </Table>

                            {/* Friendship Management Section */}
                            <h3 className="mt-4 mb-3">Friendship Management ({friendships.length} Friendships)</h3>
                            <Table striped bordered hover responsive className="mb-5">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User 1</th>
                                    <th>User 2</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {friendships.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No friendships found.</td>
                                    </tr>
                                ) : (
                                    friendships.map(f => (
                                        <tr key={f.friendship_id}>
                                            <td>{f.friendship_id.substring(0, 8)}...</td>
                                            <td>{f.user1_username}</td>
                                            <td>{f.user2_username}</td>
                                            <td>{f.status}</td>
                                            <td>{new Date(f.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteFriendship(f.friendship_id, f.user1_username, f.user2_username)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </Table>

                            {/* Master Game Management Section */}
                            <h3 className="mt-4 mb-3">Master Game Management ({masterGames.length} Games)</h3>
                            <Button variant="primary" className="mb-3" onClick={() => handleShowMasterGameModal()}>
                                Add New Master Game
                            </Button>
                            <Table striped bordered hover responsive className="mb-5">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Thumbnail</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {masterGames.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">No master games found.</td>
                                    </tr>
                                ) : (
                                    masterGames.map(game => (
                                        <tr key={game.id}>
                                            <td>{game.title}</td>
                                            <td>
                                                {game.thumbnailUrl ? (
                                                    <img src={game.thumbnailUrl} alt={game.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                ) : '-'}
                                            </td>
                                            <td>{game.description || '-'}</td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleShowMasterGameModal(game)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteMasterGame(game.id, game.title)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* User Edit Modal */}
            <Modal show={showUserEditModal} onHide={handleCloseUserEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User: {editingUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateUser}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="username" value={editedUserFormData.username} onChange={handleUserFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" name="firstName" value={editedUserFormData.firstName} onChange={handleUserFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" name="lastName" value={editedUserFormData.lastName} onChange={handleUserFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={editedUserFormData.email} onChange={handleUserFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Profile Picture URL</Form.Label>
                            <Form.Control type="text" name="profilePictureUrl" value={editedUserFormData.profilePictureUrl} onChange={handleUserFormChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Update User
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Master Game Add/Edit Modal */}
            <Modal show={showMasterGameModal} onHide={handleCloseMasterGameModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingMasterGame ? 'Edit Master Game' : 'Add New Master Game'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddOrUpdateMasterGame}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" name="title" value={masterGameFormData.title} onChange={handleMasterGameFormChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Thumbnail URL</Form.Label>
                            <Form.Control type="text" name="thumbnailUrl" value={masterGameFormData.thumbnailUrl} onChange={handleMasterGameFormChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={masterGameFormData.description} onChange={handleMasterGameFormChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            {editingMasterGame ? 'Update Game' : 'Add Game'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdminPanel;