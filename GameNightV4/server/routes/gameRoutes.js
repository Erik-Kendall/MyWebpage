// src/server/routes/gameRoutes.js

import express from 'express';
// We no longer need authMiddlewareFactory or authServiceFactory directly here
// import { authMiddlewareFactory } from '../middleware/authMiddleware.js'; // REMOVE THIS LINE
// import authServiceFactory from '../services/authService.js';           // REMOVE THIS LINE
import gameControllerFactory from '../controllers/gameController.js';
import gameServiceFactory from '../services/gameService.js';
import { validate, addOrUpdateGameValidation } from '../middleware/validationMiddleware.js';

// The factory now needs to accept 'authenticateToken' as a parameter
export default (db, popularGames, authenticateToken) => { // <-- CHANGED PARAMETERS: Now accepts authenticateToken
    const router = express.Router();
    const gameService = gameServiceFactory(db, popularGames);
    const gameController = gameControllerFactory(gameService);

    // REMOVE THE FOLLOWING BLOCK:
    // const authService = authServiceFactory(db);
    // const { authenticateToken } = authMiddlewareFactory(jwtSecret, authService);

    // All routes will now use the 'authenticateToken' passed into the factory
    router.get('/search', gameController.searchGames);
    router.get('/', authenticateToken, gameController.getAllAvailableGames);
    router.get('/my-games', authenticateToken, gameController.getMyGames);
    router.post('/my-games', authenticateToken, addOrUpdateGameValidation, validate, gameController.addGameToMyCollection);
    router.put('/my-games/:gameId', authenticateToken, addOrUpdateGameValidation, validate, gameController.updateGameInMyCollection);
    router.delete('/my-games/:gameId', authenticateToken, gameController.removeGameFromMyCollection);

    return router;
};