// server/controllers/adminController.js
import { v4 as uuidv4 } from 'uuid'; // For master game ID

export default (adminService) => {

    // --- User Management ---
    const getAllUsers = async (req, res, next) => {
        try {
            const users = await adminService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            console.error('Admin: Error in getAllUsers:', error);
            next(error);
        }
    };

    const getUserById = async (req, res, next) => {
        const { userId } = req.params;
        try {
            const user = await adminService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Admin: Error in getUserById:', error);
            next(error);
        }
    };

    const updateUser = async (req, res, next) => {
        const { userId } = req.params;
        const updateFields = req.body; // Expects an object with fields to update

        // Basic validation: ensure at least one field is provided for update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        try {
            const updated = await adminService.updateUser(userId, updateFields);
            if (!updated) {
                // Could be 404 (user not found) or 200 (no changes applied)
                const user = await adminService.getUserById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found.' });
                }
                return res.status(200).json({ message: 'User found, but no changes were applied (data was identical or disallowed fields).' });
            }
            res.status(200).json({ message: 'User updated successfully!' });
        } catch (error) {
            console.error('Admin: Error in updateUser:', error);
            next(error);
        }
    };

    const deleteUser = async (req, res, next) => {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        try {
            if (currentUserId === userId) {
                return res.status(403).json({ message: 'Admins cannot delete their own account via this interface.' });
            }

            const deleted = await adminService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json({ message: 'User not found or no changes made.' });
            }
            res.status(200).json({ message: 'User and associated data deleted successfully!' });
        } catch (error) {
            console.error('Admin: Error in deleteUser:', error);
            next(error);
        }
    };

    const setUserAdminStatus = async (req, res, next) => {
        const { userId } = req.params;
        const { isAdmin } = req.body; // Expects a boolean
        const currentUserId = req.user.id;

        if (isAdmin === undefined || typeof isAdmin !== 'boolean') {
            return res.status(400).json({ message: 'Invalid isAdmin value. Must be true or false.' });
        }

        try {
            if (currentUserId === userId && isAdmin === false) {
                return res.status(403).json({ message: 'Admins cannot revoke their own admin status via this interface.' });
            }

            const updated = await adminService.setUserAdminStatus(userId, isAdmin);
            if (!updated) {
                return res.status(404).json({ message: 'User not found or status already set to this value.' });
            }
            res.status(200).json({ message: `User admin status set to ${isAdmin}.` });
        } catch (error) {
            console.error('Admin: Error in setUserAdminStatus:', error);
            next(error);
        }
    };

    // --- Event Management ---
    const deleteEvent = async (req, res, next) => {
        const { eventId } = req.params;
        try {
            const deleted = await adminService.deleteEventAdmin(eventId);
            if (!deleted) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            res.status(200).json({ message: 'Event and associated attendees deleted successfully!' });
        } catch (error) {
            console.error('Admin: Error in deleteEvent:', error);
            next(error);
        }
    };

    // --- Friendship Management ---
    const getAllFriendships = async (req, res, next) => {
        try {
            const friendships = await adminService.getAllFriendships();
            res.status(200).json(friendships);
        } catch (error) {
            console.error('Admin: Error in getAllFriendships:', error);
            next(error);
        }
    };

    const deleteFriendship = async (req, res, next) => {
        const { friendshipId } = req.params;
        try {
            const deleted = await adminService.deleteFriendship(friendshipId);
            if (!deleted) {
                return res.status(404).json({ message: 'Friendship not found.' });
            }
            res.status(200).json({ message: 'Friendship deleted successfully!' });
        } catch (error) {
            console.error('Admin: Error in deleteFriendship:', error);
            next(error);
        }
    };

    // --- Master Game List Management ---
    const addMasterGame = async (req, res, next) => {
        const { title, thumbnailUrl, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Game title is required.' });
        }
        try {
            const gameId = uuidv4(); // Generate UUID for master game
            await adminService.addMasterGame(gameId, title, thumbnailUrl, description);
            res.status(201).json({ message: 'Master game added successfully!', gameId });
        } catch (error) {
            console.error('Admin: Error in addMasterGame:', error);
            if (error.statusCode === 409) { // Conflict (game already exists)
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error);
        }
    };

    const updateMasterGame = async (req, res, next) => {
        const { gameId } = req.params;
        const { title, thumbnailUrl, description } = req.body;
        if (!title) { // Require title for update as well
            return res.status(400).json({ message: 'Game title is required for update.' });
        }
        try {
            const updated = await adminService.updateMasterGame(gameId, title, thumbnailUrl, description);
            if (!updated) {
                return res.status(404).json({ message: 'Master game not found or no changes applied.' });
            }
            res.status(200).json({ message: 'Master game updated successfully!' });
        } catch (error) {
            console.error('Admin: Error in updateMasterGame:', error);
            next(error);
        }
    };

    const deleteMasterGame = async (req, res, next) => {
        const { gameId } = req.params;
        try {
            const deleted = await adminService.deleteMasterGame(gameId);
            if (!deleted) {
                return res.status(404).json({ message: 'Master game not found.' });
            }
            res.status(200).json({ message: 'Master game deleted successfully!' });
        } catch (error) {
            console.error('Admin: Error in deleteMasterGame:', error);
            next(error);
        }
    };

    return {
        getAllUsers,
        getUserById,
        updateUser,
        deleteUser,
        setUserAdminStatus,
        deleteEvent,
        getAllFriendships,
        deleteFriendship,
        addMasterGame,
        updateMasterGame,
        deleteMasterGame
    };
};