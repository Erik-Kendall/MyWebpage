// server/routes/adminRoutes.js
import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

// Import the adminController and adminService factories
import adminControllerFactory from '../controllers/adminController.js';
import adminServiceFactory from '../services/adminService.js';

export default (db) => {
    const router = express.Router();

    // Instantiate the adminService and adminController
    const adminService = adminServiceFactory(db); // Pass db to service
    const adminController = adminControllerFactory(adminService); // Pass adminService to controller

    // Middleware to apply to all admin routes
    router.use(authenticateToken, authorizeAdmin);

    // --- User Management ---
    // GET /admin/users - Get all users
    router.get('/users', adminController.getAllUsers);

    // GET /admin/users/:userId - Get a single user by ID
    router.get('/users/:userId', adminController.getUserById);

    // PUT /admin/users/:userId - Update user details (Admin only)
    router.put('/users/:userId', adminController.updateUser);

    // DELETE /admin/users/:userId - Delete a user (Admin only)
    router.delete('/users/:userId', adminController.deleteUser);

    // PUT /admin/users/:userId/set-admin - Set/Unset admin status (Admin only)
    router.put('/users/:userId/set-admin', adminController.setUserAdminStatus);

    // --- Event Management ---
    // DELETE /admin/events/:eventId - Delete an event (Admin only)
    router.delete('/events/:eventId', adminController.deleteEvent);

    // --- Friendship Management ---
    // GET /admin/friendships - Get all friendships (Admin only)
    router.get('/friendships', adminController.getAllFriendships);

    // DELETE /admin/friendships/:friendshipId - Delete a friendship (Admin only)
    router.delete('/friendships/:friendshipId', adminController.deleteFriendship);

    // --- Master Game List Management ---
    // POST /admin/games/master - Add a new game to the master list (Admin only)
    router.post('/games/master', adminController.addMasterGame);

    // PUT /admin/games/master/:gameId - Update a game in the master list (Admin only)
    router.put('/games/master/:gameId', adminController.updateMasterGame);

    // DELETE /admin/games/master/:gameId - Delete a game from the master list (Admin only)
    router.delete('/games/master/:gameId', adminController.deleteMasterGame);


    return router;
};