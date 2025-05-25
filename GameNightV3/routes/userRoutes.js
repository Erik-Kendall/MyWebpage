// server/routes/userRoutes.js
import express from 'express';
// We no longer need bcrypt, uuidv4, saltRounds here, as they are now in the service/controller
// import { v4 as uuidv4 } from 'uuid'; // Not needed here anymore
// import { saltRounds } from '../config/config.js'; // Not needed here anymore

import { authenticateToken } from '../middleware/authMiddleware.js'; // Still needed for route protection
// No longer import direct DB interaction here:
// import { db } from '../db/database.js'; // Assuming you have a db import here previously

// Import the userController (which itself takes userService and sanitizer)
import userControllerFactory from '../controllers/userController.js'; // Note the 'Factory' suffix for clarity
import userServiceFactory from '../services/userService.js'; // Note the 'Factory' suffix for clarity


// Export a function that accepts 'db', 'upload', and 'sanitizer'
// These are dependencies that need to be passed down to the service and controller
export default (db, upload, sanitizer, uuidv4) => { // uuidv4 is now passed here for updateAvailability
    const router = express.Router();

    // Instantiate the userService and userController
    // Pass db to userService
    const userService = userServiceFactory(db);
    // Pass userService and sanitizer to userController
    // Also pass uuidv4 to the controller if it needs to attach it to req for service (as noted before)
    const userController = userControllerFactory(userService, sanitizer);

    // --- Current User Profile Routes (Authenticated) ---

    // GET / - Fetch Current User Profile
    router.get('/', authenticateToken, userController.getCurrentUserProfile);

    // PUT / - Update User Profile (for bio)
    router.put('/', authenticateToken, userController.updateBio);

    // PUT /madlib - Update Mad Lib Story
    router.put('/madlib', authenticateToken, userController.updateMadLibStory);

    // PUT /social-media - Update social media links for current user
    router.put('/social-media', authenticateToken, userController.updateSocialMediaLinks);

    // POST /upload - Upload Profile Picture
    router.post('/upload', authenticateToken, upload.single('profilePicture'), userController.uploadProfilePicture);

    // PUT /change-username
    router.put('/change-username', authenticateToken, userController.changeUsername);

    // PUT /change-password
    router.put('/change-password', authenticateToken, userController.changePassword);

    // GET /search - Search Users
    router.get('/search', authenticateToken, userController.searchUsers);


    // --- Public Profile Routes (Unauthenticated where appropriate, e.g., GET) ---

    // GET /public-profile/:username - Get Public Profile by Username
    router.get('/public-profile/:username', userController.getPublicProfileByUsername); // No auth needed for public view

    // POST /public-profile/:profileOwnerId/comments
    router.post('/public-profile/:profileOwnerId/comments', authenticateToken, userController.postProfileComment);

    // GET /public-profile/:profileOwnerId/comments
    router.get('/public-profile/:profileOwnerId/comments', userController.getProfileComments); // No auth needed to view comments

    // DELETE /public-profile/comments/:commentId
    router.delete('/public-profile/comments/:commentId', authenticateToken, userController.deleteProfileComment);


    // --- User Availability Routes ---

    // GET /availability/:userId
    router.get('/availability/:userId', authenticateToken, userController.getUserAvailability);

    // POST /availability
    router.post('/availability', authenticateToken, userController.updateAvailability);

    return router;
};