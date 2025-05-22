// D:\Game Night\website\src\pages\UserSearchPage.jsx

import React, { useState } from 'react';
import { Container, Form, Button, ListGroup, Card, Alert } from 'react-bootstrap'; // Added Alert for error messages
import { Link } from 'react-router-dom';
import defaultProfilePic from '../assets/default_profile_pic.png';
import { useAuth } from '../contexts/AuthContext'; // <--- ADD THIS IMPORT

const UserSearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { token, user } = useAuth(); // <--- ADD THIS LINE TO GET TOKEN AND USER

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearchResults([]); // Clear previous results

        if (!token) { // <--- ADD THIS CHECK
            setError('You must be logged in to search for users.');
            setLoading(false);
            return;
        }

        if (!searchTerm.trim()) {
            setError('Please enter a search term.');
            setLoading(false);
            return;
        }

        // Prevent searching for yourself (optional, but good practice)
        if (user && searchTerm.toLowerCase() === user.username.toLowerCase()) {
            setError("You cannot search for your own username.");
            setLoading(false);
            return;
        }


        try {
            console.log(`[UserSearchPage] Searching for: ${searchTerm.trim()}`);
            // ****** THIS IS THE CORRECTED FETCH CALL ******
            const response = await fetch(`http://localhost:3001/users/search?term=${encodeURIComponent(searchTerm.trim())}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // <--- CRUCIAL ADDITION: Sending the token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch search results.');
            }

            const data = await response.json();
            // Filter out the current user from search results if they somehow appear
            const filteredData = data.filter(foundUser => user && foundUser.id !== user.id);
            setSearchResults(filteredData);
            console.log("[UserSearchPage] Search results:", filteredData);

            if (filteredData.length === 0) {
                setError('No users found matching your search.'); // Use error state for 'not found' message
            }

        } catch (err) {
            console.error('Error during user search:', err);
            setError(err.message || 'An error occurred during search.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get the full profile picture URL
    const getProfilePicUrl = (relativePath) => {
        // Ensure relativePath exists and is not null/undefined to avoid errors
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };


    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center">Find Other Users</h2>

            <Form onSubmit={handleSearch} className="mb-4">
                <Form.Group controlId="searchForm" className="d-flex">
                    <Form.Control
                        type="text"
                        placeholder="Search by username, first name, or last name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="me-2"
                    />
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </Form.Group>
                {/* Display errors and success messages */}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Form>

            <ListGroup>
                {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                        <ListGroup.Item key={user.username} className="mb-2">
                            <Card>
                                <Card.Body className="d-flex align-items-center">
                                    <img
                                        src={getProfilePicUrl(user.profilePictureUrl)}
                                        alt="Profile"
                                        className="rounded-circle me-3"
                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <Card.Title className="mb-0">{user.username}</Card.Title>
                                        {user.firstName && user.lastName && (
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {user.firstName} {user.lastName}
                                            </Card.Subtitle>
                                        )}
                                        <Link to={`/public-profile/${user.username}`} className="btn btn-sm btn-outline-info">
                                            View Profile
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))
                ) : (
                    // Display messages when no results, not loading, no error, and search term exists
                    !loading && !error && searchTerm.trim() && <p className="text-center">No users found matching "{searchTerm}".</p>
                )}
                {/* Initial message when no search term is entered yet */}
                {!searchTerm.trim() && !loading && <p className="text-center">Enter a term to search for users.</p>}
            </ListGroup>
        </Container>
    );
};

export default UserSearchPage;