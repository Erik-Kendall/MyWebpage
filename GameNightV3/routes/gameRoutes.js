// server/routes/gameRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
// No longer need uuidv4 directly here
// import { v4 as uuidv4 } from 'uuid';

// Import the gameController and gameService factories
import gameControllerFactory from '../controllers/gameController.js';
import gameServiceFactory from '../services/gameService.js';

// Export a function that accepts 'db' and 'popularGames'
export default (db, popularGames) => { // Still accepts db and popularGames
    const router = express.Router();

    // Instantiate the gameService and gameController
    const gameService = gameServiceFactory(db, popularGames); // Pass db and popularGames to service
    const gameController = gameControllerFactory(gameService); // Pass gameService to controller

    // GET /games/search - Game Search Endpoint (hardcoded games)
    router.get('/search', gameController.searchGames);

    // GET /games - Get all games available in the system
    router.get('/', authenticateToken, gameController.getAllAvailableGames);

    // GET /games/my-games - Fetch all games for the logged-in user
    router.get('/my-games', authenticateToken, gameController.getMyGames);

    // POST /games/my-games - Add a game to user's collection
    router.post('/my-games', authenticateToken, gameController.addGameToMyCollection);

    // PUT /games/my-games/:gameId - Update a specific game in user's collection
    router.put('/my-games/:gameId', authenticateToken, gameController.updateGameInMyCollection);

    // DELETE /games/my-games/:gameId - Remove a game from user's collection
    router.delete('/my-games/:gameId', authenticateToken, gameController.removeGameFromMyCollection);

    return router;
};