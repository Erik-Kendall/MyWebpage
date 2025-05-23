// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const { token, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]); // State for events to manage/delete
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // --- Data Fetching Functions ---

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        setError('');
        setMessage('');
        setLoading(true);
        if (!token) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users.');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users for admin panel:', err);
            setError(err.message || 'An error occurred while fetching users.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch all events (for admin to manage/delete)
    const fetchEvents = useCallback(async () => {
        setError('');
        setMessage('');
        setLoading(true);
        if (!token) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3001/events', { // Reusing your /events endpoint
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch events.');
            }

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events for admin panel:', err);
            setError(err.message || 'An error occurred while fetching events.');
        } finally {
            setLoading(false);
        }
    }, [token]);


    // --- Lifecycle and Authorization Check ---

    useEffect(() => {
        // If authLoading is true, wait for it to complete.
        // If not authenticated or not an admin, redirect.
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login', { replace: true });
                return;
            }
            if (!isAdmin) {
                // If not an admin, redirect to home or a suitable unauthorized page
                navigate('/', { replace: true });
                alert('Access Denied: You do not have administrator privileges.');
                return;
            }
            // If authenticated and is admin, fetch data
            fetchUsers();
            fetchEvents(); // Fetch events for admin management
        }
    }, [authLoading, isAuthenticated, isAdmin, navigate, fetchUsers, fetchEvents]); // Depend on auth states and fetch functions

    // --- Admin Actions ---

    const handleSetAdminStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to set this user's admin status to ${newStatus}?`)) {
            return;
        }
        setMessage('');
        setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/admin/users/${userId}/set-admin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isAdmin: newStatus }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                fetchUsers(); // Refresh user list
            } else {
                throw new Error(data.message || 'Failed to update admin status.');
            }
        } catch (err) {
            console.error('Error setting admin status:', err);
            setMessage(err.message || 'An error occurred.');
            setMessageType('danger');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete user "${username}" and all their associated data (events, friends, games, etc.)? This action cannot be undone.`)) {
            return;
        }
        setMessage('');
        setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                fetchUsers(); // Refresh user list
                fetchEvents(); // Refresh events as well, in case a host was deleted
            } else {
                throw new Error(data.message || 'Failed to delete user.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setMessage(err.message || 'An error occurred.');
            setMessageType('danger');
        }
    };

    const handleDeleteEvent = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete the event "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }
        setMessage('');
        setMessageType('success');
        try {
            const response = await fetch(`http://localhost:3001/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                fetchEvents(); // Refresh event list
            } else {
                throw new Error(data.message || 'Failed to delete event.');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            setMessage(err.message || 'An error occurred.');
            setMessageType('danger');
        }
    };


    // --- Render Logic ---

    // Show loading spinner if auth context is still loading
    if (authLoading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading authentication status...</span>
                </Spinner>
            </Container>
        );
    }

    // This case should be handled by the useEffect redirect, but as a fallback
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
                            {/* User Management Section */}
                            <h3 className="mt-4 mb-3">User Management ({users.length} Users)</h3>
                            <Table striped bordered hover responsive className="mb-5">
                                <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Registered On</th>
                                    <th>Is Admin</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.firstName || '-'}</td>
                                            <td>{user.lastName || '-'}</td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Form.Check
                                                    type="switch"
                                                    id={`admin-switch-${user.id}`}
                                                    label={user.isAdmin ? 'Yes' : 'No'}
                                                    checked={user.isAdmin}
                                                    onChange={() => handleSetAdminStatus(user.id, user.isAdmin)}
                                                    disabled={user.id === token.id} // Prevent admin from changing their own status via this UI
                                                />
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    disabled={user.id === token.id} // Prevent admin from deleting themselves
                                                >
                                                    Delete User
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </Table>

                            {/* Event Management Section */}
                            <h3 className="mt-4 mb-3">Event Management ({events.length} Events)</h3>
                            <Table striped bordered hover responsive>
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
                                                    Delete Event
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
        </Container>
    );
};

export default AdminPanel;