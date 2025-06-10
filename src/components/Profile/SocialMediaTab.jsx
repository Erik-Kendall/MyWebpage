// src/components/Profile/SocialMediaTab.jsx
import React from 'react';
import { Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { FaTwitch, FaYoutube, FaTwitter, FaInstagram, FaDiscord, FaGlobe, FaLink, FaEdit, FaTrashAlt } from 'react-icons/fa';

const SocialMediaTab = ({
                            profileData,
                            token,
                            fetchProfileData, // Needed to re-fetch after update
                            linkMessage,
                            linkMessageType,
                            editingLinkIndex,
                            newLinkPlatform,
                            newLinkUrl,
                            setLinkMessage,
                            setLinkMessageType,
                            setEditingLinkIndex,
                            setNewLinkPlatform,
                            setNewLinkUrl,
                            setProfileData // Needed to update local state immediately
                        }) => {

    const getSocialIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'twitch': return <FaTwitch size="1.5em" />;
            case 'youtube': return <FaYoutube size="1.5em" />;
            case 'twitter': return <FaTwitter size="1.5em" />;
            case 'instagram': return <FaInstagram size="1.5em" />;
            case 'discord': return <FaDiscord size="1.5em" />;
            case 'website': return <FaGlobe size="1.5em" />;
            case 'other': return <FaLink size="1.5em" />; // Generic link icon
            default: return <FaLink size="1.5em" />;
        }
    };

    const handleAddOrUpdateLink = async (e) => {
        e.preventDefault();
        setLinkMessage('');
        setLinkMessageType('success');

        if (!newLinkUrl.trim() || !newLinkPlatform.trim()) {
            setLinkMessage('Platform and URL cannot be empty.');
            setLinkMessageType('danger');
            return;
        }

        if (!/^(https?:\/\/)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!$&'()*+,;=.]*)$/.test(newLinkUrl)) {
            setLinkMessage('Invalid URL format. Please include http:// or https:// if necessary, or ensure a valid domain.');
            setLinkMessageType('danger');
            return;
        }

        const updatedLinks = [...profileData.socialMediaLinks];

        if (editingLinkIndex !== null) {
            updatedLinks[editingLinkIndex] = { platform: newLinkPlatform, url: newLinkUrl.trim() };
        } else {
            updatedLinks.push({ platform: newLinkPlatform, url: newLinkUrl.trim() });
        }

        try {
            const response = await fetch('http://localhost:3001/api/users/social-media', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ socialMediaLinks: updatedLinks }),
            });

            const data = await response.json();
            if (response.ok) {
                setLinkMessage(data.message);
                setProfileData(prev => ({ ...prev, socialMediaLinks: updatedLinks })); // Update local state immediately
                setNewLinkPlatform('website'); // Reset form
                setNewLinkUrl('');
                setEditingLinkIndex(null); // Exit edit mode
                await fetchProfileData(); // Re-fetch to ensure consistency with backend (optional, but good for robustness)
            } else {
                setLinkMessage(data.message || 'Failed to save social media links.');
                setLinkMessageType('danger');
            }
        } catch (error) {
            console.error('Error saving social media links:', error);
            setLinkMessage('Network error saving social media links.');
            setLinkMessageType('danger');
        }
    };

    const handleEditLink = (link, index) => {
        setNewLinkPlatform(link.platform);
        setNewLinkUrl(link.url);
        setEditingLinkIndex(index);
    };

    const handleDeleteLink = async (indexToDelete) => {
        setLinkMessage('');
        setLinkMessageType('success');

        if (window.confirm('Are you sure you want to delete this social media link?')) {
            const updatedLinks = profileData.socialMediaLinks.filter((_, index) => index !== indexToDelete);

            try {
                const response = await fetch('http://localhost:3001/api/users/social-media', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ socialMediaLinks: updatedLinks }),
                });

                const data = await response.json();
                if (response.ok) {
                    setLinkMessage(data.message);
                    setProfileData(prev => ({ ...prev, socialMediaLinks: updatedLinks })); // Update local state immediately
                    setEditingLinkIndex(null); // Clear edit mode in case deleted item was being edited
                    setNewLinkPlatform('website');
                    setNewLinkUrl('');
                    await fetchProfileData(); // Re-fetch to ensure consistency with backend
                } else {
                    setLinkMessage(data.message || 'Failed to delete social media link.');
                    setLinkMessageType('danger');
                }
            } catch (error) {
                console.error('Error deleting social media link:', error);
                setLinkMessage('Network error deleting social media link.');
                setLinkMessageType('danger');
            }
        }
    };

    const handleCancelLinkEdit = () => {
        setEditingLinkIndex(null);
        setNewLinkPlatform('website');
        setNewLinkUrl('');
    };

    return (
        // Removed <Tab> wrapper here. The content will be rendered directly inside the React-Bootstrap Tab in ProfilePage.jsx
        <div className="mt-3">
            <h4 className="mb-3">Manage Your Links</h4>
            {linkMessage && <Alert variant={linkMessageType}>{linkMessage}</Alert>}

            <Form onSubmit={handleAddOrUpdateLink} className="mb-4 p-3 border rounded bg-light">
                <Form.Group controlId="linkPlatform" className="mb-3">
                    <Form.Label>Platform Type</Form.Label>
                    <Form.Control
                        as="select"
                        value={newLinkPlatform}
                        onChange={(e) => setNewLinkPlatform(e.target.value)}
                        required
                    >
                        <option value="website">Website</option>
                        <option value="twitch">Twitch</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="discord">Discord</option>
                        <option value="other">Other</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="linkUrl" className="mb-3">
                    <Form.Label>URL</Form.Label>
                    <Form.Control
                        type="url"
                        placeholder="e.g., https://www.example.com/my-page"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="success" type="submit" className="me-2">
                    {editingLinkIndex !== null ? 'Update Link' : 'Add Link'}
                </Button>
                {editingLinkIndex !== null && (
                    <Button variant="secondary" onClick={handleCancelLinkEdit}>
                        Cancel Edit
                    </Button>
                )}
            </Form>

            <h5>Your Current Links</h5>
            {profileData.socialMediaLinks.length === 0 ? (
                <p className="text-muted">No links added yet. Use the form above to add your first link!</p>
            ) : (
                <ListGroup>
                    {profileData.socialMediaLinks.map((link, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <span className="me-2">{getSocialIcon(link.platform)}</span>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-break">
                                    <strong>{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}:</strong> {link.url}
                                </a>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditLink(link, index)}>
                                    <FaEdit /> Edit
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteLink(index)}>
                                    <FaTrashAlt /> Delete
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default SocialMediaTab;