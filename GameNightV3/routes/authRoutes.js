// server/routes/authRoutes.js (REVISED to accept JWT_SECRET)
import express from 'express';

import authControllerFactory from '../controllers/authController.js'; // Import the controller factory
import authServiceFactory from '../services/authService.js';     // Import the service factory


// Export a function that accepts 'db', 'uuidv4', and now 'jwtSecret' from server.js
export default (db, uuidv4, jwtSecret) => { // uuidv4 is needed by authController for registration
    const router = express.Router();

    // Instantiate the authService, passing the db instance
    const authService = authServiceFactory(db);

    // Instantiate the authController, passing the authService and jwtSecret (from server.js)
    const authController = authControllerFactory(authService, jwtSecret);


    // User Registration
    router.post('/register', authController.register);

    // User Login
    router.post('/login', authController.login);

    return router;
};