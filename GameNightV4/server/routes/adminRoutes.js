import express from 'express';
import { authMiddlewareFactory } from '../middleware/authMiddleware.js';
import adminControllerFactory from '../controllers/adminController.js';
import adminServiceFactory from '../services/adminService.js';
import {
    validate,
    adminUpdateUserValidation,
    setUserAdminStatusValidation,
    adminAddMasterGameValidation,
    adminUpdateMasterGameValidation
} from '../middleware/validationMiddleware.js';

export default (db, jwtSecret, authService) => {
    const router = express.Router();
    const adminService = adminServiceFactory(db);
    const adminController = adminControllerFactory(adminService);

    const { authenticateToken, authorizeAdmin } = authMiddlewareFactory(jwtSecret, authService);

    // >>>>>>>>>>> CRITICAL CHANGE: REMOVE router.use() AND APPLY MIDDLEWARE PER ROUTE <<<<<<<<<<<
    // router.use(authenticateToken, authorizeAdmin); // <--- REMOVE THIS LINE

    // --- User Management ---
    // GET /admin/users - Get all users
    router.get('/users', authenticateToken, authorizeAdmin, adminController.getAllUsers); // <--- ADD MIDDLEWARE HERE

    // GET /admin/users/:userId - Get a single user by ID (add param validation if needed)
    router.get('/users/:userId', authenticateToken, authorizeAdmin, adminController.getUserById); // <--- ADD MIDDLEWARE HERE

    // PUT /admin/users/:userId - Update user details (Admin only)
    router.put('/users/:userId',
        authenticateToken, authorizeAdmin, // <--- ADD MIDDLEWARE HERE
        adminUpdateUserValidation,
        validate,
        adminController.updateUser
    );

    // DELETE /admin/users/:userId - Delete a user (Admin only) (add param validation if needed)
    router.delete('/users/:userId', authenticateToken, authorizeAdmin, adminController.deleteUser); // <--- ADD MIDDLEWARE HERE

    // PUT /admin/users/:userId/set-admin - Set/Unset admin status (Admin only)
    router.put('/users/:userId/set-admin',
        authenticateToken, authorizeAdmin, // <--- ADD MIDDLEWARE HERE
        setUserAdminStatusValidation,
        validate,
        adminController.setUserAdminStatus
    );

    // --- Event Management ---
    // DELETE /admin/events/:eventId - Delete an event (Admin only) (add param validation if needed)
    router.delete('/events/:eventId', authenticateToken, authorizeAdmin, adminController.deleteEvent); // <--- ADD MIDDLEWARE HERE

    // --- Friendship Management ---
    // GET /admin/friendships - Get all friendships (Admin only)
    router.get('/friendships', authenticateToken, authorizeAdmin, adminController.getAllFriendships); // <--- ADD MIDDLEWARE HERE

    // DELETE /admin/friendships/:friendshipId - Delete a friendship (Admin only) (add param validation if needed)
    router.delete('/friendships/:friendshipId', authenticateToken, authorizeAdmin, adminController.deleteFriendship); // <--- ADD MIDDLEWARE HERE

    // --- Master Game List Management ---
    // POST /admin/games/master - Add a new game to the master list (Admin only)
    router.post('/games/master',
        authenticateToken, authorizeAdmin, // <--- ADD MIDDLEWARE HERE
        adminAddMasterGameValidation,
        validate,
        adminController.addMasterGame
    );

    // PUT /admin/games/master/:gameId - Update a game in the master list (Admin only)
    router.put('/games/master/:gameId',
        authenticateToken, authorizeAdmin, // <--- ADD MIDDLEWARE HERE
        adminUpdateMasterGameValidation,
        validate,
        adminController.updateMasterGame
    );

    // DELETE /admin/games/master/:gameId - Delete a game from the master list (Admin only) (add param validation if needed)
    router.delete('/games/master/:gameId', authenticateToken, authorizeAdmin, adminController.deleteMasterGame); // <--- ADD MIDDLEWARE HERE

    return router;
};