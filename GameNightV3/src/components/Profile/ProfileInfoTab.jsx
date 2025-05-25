// src/components/Profile/ProfileInfoTab.jsx
import React from 'react';
import { Form, Button, Alert, Image } from 'react-bootstrap';
import defaultProfilePic from '../../assets/default_profile_pic.png';

const ProfileInfoTab = ({
                            profileData,
                            originalProfileData,
                            token,
                            updateUserData,
                            message,
                            messageType,
                            error,
                            handleChange,
                            profilePicFile,
                            profilePicPreview,
                            handleProfilePicChange,
                            setMessage,
                            setMessageType,
                            setError,
                            setProfileData,
                            setOriginalProfileData,
                            setProfilePicFile,
                            setProfilePicPreview // Passed down for cleanup
                        }) => {

    const getProfilePicUrl = (relativePath) => {
        if (profilePicPreview) {
            return profilePicPreview;
        }
        return relativePath ? `http://localhost:3001${relativePath}` : defaultProfilePic;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('success');
        setError('');

        const changes = {};
        // Only include changes if they are different from original or explicitly null
        if (profileData.firstName !== originalProfileData.firstName) {
            changes.firstName = profileData.firstName;
        }
        if (profileData.lastName !== originalProfileData.lastName) {
            changes.lastName = profileData.lastName;
        }
        if (profileData.favoriteGames !== originalProfileData.favoriteGames) {
            changes.favoriteGames = profileData.favoriteGames;
        }
        // Handle bio specifically: if it's empty string, send null to backend
        const bioToSave = profileData.bio && profileData.bio.trim() !== '' ? profileData.bio.trim() : null;
        if (bioToSave !== originalProfileData.bio) {
            changes.bio = bioToSave;
        }


        if (Object.keys(changes).length === 0 && !profilePicFile) {
            setMessage('No changes to save.');
            setMessageType('info');
            return;
        }

        try {
            if (Object.keys(changes).length > 0) {
                const response = await fetch('http://localhost:3001/api/users', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(changes),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile.');
                }
                setMessage(data.message);
                setOriginalProfileData(prev => ({ ...prev, ...changes })); // Update original data with just the changes applied
                updateUserData(changes); // Update AuthContext with immediate profile changes
            }

            if (profilePicFile) {
                const formData = new FormData();
                formData.append('profilePicture', profilePicFile);

                const uploadResponse = await fetch('http://localhost:3001/api/users/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const uploadData = await uploadResponse.json();
                if (!uploadResponse.ok) {
                    throw new Error(uploadData.message || 'Failed to upload profile picture.');
                }
                setMessage(prev => prev + (prev ? ' & ' : '') + uploadData.message);
                setProfileData(prev => ({ ...prev, profilePictureUrl: uploadData.profilePictureUrl }));
                updateUserData({ profilePictureUrl: uploadData.profilePictureUrl });
                setProfilePicFile(null);
                if (profilePicPreview) {
                    URL.revokeObjectURL(profilePicPreview); // Clean up preview URL
                }
                setProfilePicPreview(null);
            }
        } catch (err) {
            console.error('Error during profile update:', err);
            setError(err.message || 'An error occurred during profile update.');
            setMessageType('danger'); // Assuming messageType for error is 'danger'
        }
    };

    return (
        // Removed <Tab> wrapper here. The content will be rendered directly inside the React-Bootstrap Tab in ProfilePage.jsx
        <div className="mt-3">
            {message && <Alert variant={messageType}>{message}</Alert>}
            <Form onSubmit={handleProfileSubmit} className="mt-3">
                <div className="text-center mb-4">
                    <Image
                        src={getProfilePicUrl(profileData.profilePictureUrl)}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <Form.Group controlId="profilePic" className="mt-3">
                        <Form.Label>Change Profile Picture</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                        />
                    </Form.Group>
                </div>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={profileData.username} disabled />
                </Form.Group>

                <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={profileData.firstName || ''}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastName"
                        value={profileData.lastName || ''}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="favoriteGames">
                    <Form.Label>Favorite Games</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="favoriteGames"
                        value={profileData.favoriteGames || ''}
                        onChange={handleChange}
                        rows={3}
                    />
                </Form.Group>
                <Form.Group controlId="formBio" className="mb-3">
                    <Form.Label>About Me (Bio)</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="bio"
                        rows={4}
                        value={profileData.bio || ''}
                        onChange={handleChange}
                        placeholder="Tell us something about yourself..."
                        maxLength={500}
                    />
                    <Form.Text className="text-muted">
                        Max 500 characters.
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Save Profile
                </Button>
            </Form>
        </div>
    );
};

export default ProfileInfoTab;