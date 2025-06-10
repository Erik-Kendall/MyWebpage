import express from 'express';
import authControllerFactory from '../controllers/authController.js';
// REMOVED: import authServiceFactory from '../services/authService.js'; // No longer need to import factory here

// Import the new validation middleware
import { registerValidation, loginValidation, validate } from '../middleware/validationMiddleware.js';

// authRoutesFactory should receive authService and jwtSecret directly from server.js
// It does NOT need 'db' or 'uuidv4' here.
export default (authService, jwtSecret) => { // Removed 'db', 'uuidv4' from parameters
    const router = express.Router();

    // REMOVED: const authService = authServiceFactory(db); // THIS LINE IS THE PROBLEM AND MUST BE REMOVED!
    // authService is now passed directly as a parameter to this factory.

    const authController = authControllerFactory(authService, jwtSecret); // This is correct

    router.post('/register',
        registerValidation,
        validate,
        authController.register
    );

    router.post('/login',
        loginValidation,
        validate,
        authController.login
    );

    router.post('/logout', authController.logout);

    return router;
};