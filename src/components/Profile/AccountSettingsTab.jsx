// src/components/Profile/AccountSettingsTab.jsx
import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const AccountSettingsTab = ({
                                token,
                                updateUserData,
                                fetchProfileData, // Needed to re-fetch profile after username change
                                accountMessage,
                                accountMessageType,
                                newUsername,
                                currentPassword,
                                newPassword,
                                confirmNewPassword,
                                setAccountMessage,
                                setAccountMessageType,
                                setNewUsername,
                                setCurrentPassword,
                                setNewPassword,
                                setConfirmNewPassword,
                                setLoading // Passed down to control overall page loading state during username change
                            }) => {

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        setAccountMessage('');
        setAccountMessageType('success');

        setLoading(true); // Start overall page loading

        if (!newUsername.trim()) {
            setAccountMessage('New username cannot be empty.');
            setAccountMessageType('danger');
            setLoading(false);
            return;
        }

        if (!currentPassword.trim()) {
            setAccountMessage('Current password is required to change username.');
            setAccountMessageType('danger');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/users/change-username', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    newUsername: newUsername.trim(),
                    currentPassword: currentPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAccountMessage(data.message || 'Username updated successfully! You may need to log in again with your new username.');
                setAccountMessageType('success');
                setNewUsername('');
                setCurrentPassword('');

                if (updateUserData) {
                    updateUserData({ username: newUsername.trim() });
                }

                if (fetchProfileData) {
                    await fetchProfileData(); // This will trigger the overall data re-fetch
                }

            } else {
                setAccountMessage(data.message || 'Failed to change username. Please try again.');
                setAccountMessageType('danger');
            }
        } catch (error) {
            console.error('Error changing username:', error);
            let errorMessage = 'Network error changing username.';
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                errorMessage = 'Received an invalid response from the server. Try logging out and back in.';
            }
            setAccountMessage(errorMessage);
            setAccountMessageType('danger');
        } finally {
            setLoading(false); // Stop overall page loading
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setAccountMessage('');
        setAccountMessageType('success');

        if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            setAccountMessage('All password fields are required.');
            setAccountMessageType('danger');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setAccountMessage('New password and confirmation do not match.');
            setAccountMessageType('danger');
            return;
        }

        if (newPassword.length < 6) { // Changed to 6 as per your typical backend setup
            setAccountMessage('New password must be at least 6 characters long.');
            setAccountMessageType('danger');
            return;
        }
        // Added check for new password not being same as old password
        if (currentPassword === newPassword) {
            setAccountMessage('New password cannot be the same as the old password.');
            setAccountMessageType('danger');
            return;
        }


        try {
            const response = await fetch('http://localhost:3001/api/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAccountMessage(data.message);
                setAccountMessageType('success');
                setCurrentPassword(''); // Clear current password after success
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setAccountMessage(data.message || 'Failed to change password.');
                setAccountMessageType('danger');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setAccountMessage('Network error changing password.');
            setAccountMessageType('danger');
        }
    };

    return (
        // Removed <Tab> wrapper here. The content will be rendered directly inside the React-Bootstrap Tab in ProfilePage.jsx
        <div className="mt-3">
            {accountMessage && <Alert variant={accountMessageType}>{accountMessage}</Alert>}

            {/* Change Username Form */}
            <h4 className="mb-3">Change Username</h4>
            <Form onSubmit={handleChangeUsername} className="mb-5 p-3 border rounded bg-light">
                <Form.Group className="mb-3" controlId="newUsername">
                    <Form.Label>New Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter new username"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="currentPasswordUsername">
                    <Form.Label>Current Password (for verification)</Form.Label>
                    <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Change Username</Button>
            </Form>

            <hr className="my-4" />

            {/* Change Password Form */}
            <h4 className="mb-3">Change Password</h4>
            <Form onSubmit={handleChangePassword} className="p-3 border rounded bg-light">
                <Form.Group className="mb-3" controlId="currentPasswordPassword">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmNewPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Change Password</Button>
            </Form>
        </div>
    );
};

export default AccountSettingsTab;