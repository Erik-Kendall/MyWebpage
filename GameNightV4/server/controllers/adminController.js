// E:\Game Night\website\server\controllers\adminController.js

export default (adminService) => {
    // Initial check to see if adminService is correctly passed
    console.log('[DEBUG-ADMIN-CONTROLLER] adminControllerFactory received adminService:', !!adminService);

    return {
        getAllUsers: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering getAllUsers'); // <--- ADDED LOG
            try {
                const users = await adminService.getAllUsers();
                res.status(200).json(users);
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in getAllUsers:', error); // <--- ADDED ERROR LOG
                next(error); // Pass error to Express error handling middleware
            }
        },

        getUserById: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering getUserById'); // <--- ADDED LOG
            try {
                const { userId } = req.params;
                const user = await adminService.getUserById(userId);
                if (user) {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in getUserById:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        updateUser: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering updateUser'); // <--- ADDED LOG
            try {
                const { userId } = req.params;
                const userData = req.body;
                const success = await adminService.updateUser(userId, userData);
                if (success) {
                    res.status(200).json({ message: 'User updated successfully' });
                } else {
                    res.status(404).json({ message: 'User not found or no changes made' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in updateUser:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        deleteUser: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering deleteUser'); // <--- ADDED LOG
            try {
                const { userId } = req.params;
                const success = await adminService.deleteUser(userId);
                if (success) {
                    res.status(200).json({ message: 'User deleted successfully' });
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in deleteUser:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        setUserAdminStatus: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering setUserAdminStatus'); // <--- ADDED LOG
            try {
                const { userId } = req.params;
                const { isAdmin } = req.body; // Expecting boolean true/false
                const success = await adminService.setUserAdminStatus(userId, isAdmin);
                if (success) {
                    res.status(200).json({ message: `User admin status set to ${isAdmin}` });
                } else {
                    res.status(404).json({ message: 'User not found or status already set' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in setUserAdminStatus:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        deleteEvent: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering deleteEvent'); // <--- ADDED LOG
            try {
                const { eventId } = req.params;
                const success = await adminService.deleteEvent(eventId);
                if (success) {
                    res.status(200).json({ message: 'Event deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Event not found' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in deleteEvent:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        getAllFriendships: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering getAllFriendships'); // <--- ADDED LOG
            try {
                const friendships = await adminService.getAllFriendships();
                res.status(200).json(friendships);
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in getAllFriendships:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        deleteFriendship: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering deleteFriendship'); // <--- ADDED LOG
            try {
                const { friendshipId } = req.params;
                const success = await adminService.deleteFriendship(friendshipId);
                if (success) {
                    res.status(200).json({ message: 'Friendship deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Friendship not found' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in deleteFriendship:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        addMasterGame: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering addMasterGame'); // <--- ADDED LOG
            try {
                const gameData = req.body;
                const game = await adminService.addMasterGame(gameData);
                res.status(201).json(game);
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in addMasterGame:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        updateMasterGame: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering updateMasterGame'); // <--- ADDED LOG
            try {
                const { gameId } = req.params;
                const gameData = req.body;
                const success = await adminService.updateMasterGame(gameId, gameData);
                if (success) {
                    res.status(200).json({ message: 'Master game updated successfully' });
                } else {
                    res.status(404).json({ message: 'Master game not found or no changes made' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in updateMasterGame:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        },

        deleteMasterGame: async (req, res, next) => {
            console.log('[ADMIN_CONTROLLER] Entering deleteMasterGame'); // <--- ADDED LOG
            try {
                const { gameId } = req.params;
                const success = await adminService.deleteMasterGame(gameId);
                if (success) {
                    res.status(200).json({ message: 'Master game deleted successfully' });
                } else {
                    res.status(404).json({ message: 'Master game not found' });
                }
            } catch (error) {
                console.error('[ADMIN_CONTROLLER_ERROR] Error in deleteMasterGame:', error); // <--- ADDED ERROR LOG
                next(error);
            }
        }
    };
};