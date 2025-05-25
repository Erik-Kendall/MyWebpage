// server/controllers/gameController.js
import { v4 as uuidv4 } from 'uuid'; // For generating game IDs

// Export a function that accepts 'gameService'
export default (gameService) => {

    const searchGames = async (req, res, next) => {
        try {
            const query = req.query.q;
            const filteredGames = gameService.searchPopularGames(query);
            res.json(filteredGames);
        } catch (error) {
            console.error('Error in searchGames:', error);
            next(error);
        }
    };

    const getAllAvailableGames = async (req, res, next) => {
        try {
            const games = await gameService.getAllAvailableGames();
            res.status(200).json(games);
        } catch (error) {
            console.error('Error in getAllAvailableGames:', error);
            next(error);
        }
    };

    const getMyGames = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const userGames = await gameService.getUserGames(userId);
            res.status(200).json(userGames);
        } catch (error) {
            console.error('Error in getMyGames:', error);
            next(error);
        }
    };

    const addGameToMyCollection = async (req, res, next) => {
        const { game_title, notes, status } = req.body;
        const userId = req.user.id;

        if (!game_title || !status) {
            return res.status(400).json({ message: 'Game title and status are required.' });
        }
        // Basic validation for status if you have a predefined list
        const allowedStatuses = ['Playing', 'Completed', 'Dropped', 'Backlog', 'Wishlist']; // Example
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid game status provided.' });
        }


        try {
            const gameId = uuidv4(); // Generate UUID in the controller
            await gameService.addGameToUserCollection(gameId, userId, game_title, notes, status);
            res.status(201).json({ message: 'Game added successfully!', id: gameId });
        } catch (error) {
            console.error('Error in addGameToMyCollection:', error);
            // Catch specific error thrown by service for unique constraint
            if (error.statusCode === 409) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error); // Pass other errors to global error handler
        }
    };

    const updateGameInMyCollection = async (req, res, next) => {
        const { gameId } = req.params;
        const { game_title, notes, status } = req.body;
        const userId = req.user.id;

        if (!game_title || !status) {
            return res.status(400).json({ message: 'Game title and status are required for update.' });
        }
        const allowedStatuses = ['Playing', 'Completed', 'Dropped', 'Backlog', 'Wishlist']; // Example
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid game status provided.' });
        }

        try {
            const updated = await gameService.updateUserGame(gameId, userId, game_title, notes, status);
            if (!updated) {
                return res.status(404).json({ message: 'Game not found or you do not have permission to update it.' });
            }
            res.status(200).json({ message: 'Game updated successfully!' });
        } catch (error) {
            console.error('Error in updateGameInMyCollection:', error);
            next(error);
        }
    };

    const removeGameFromMyCollection = async (req, res, next) => {
        const { gameId } = req.params;
        const userId = req.user.id;
        try {
            const deleted = await gameService.deleteUserGame(gameId, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Game not found or you do not have permission to remove it.' });
            }
            res.status(200).json({ message: 'Game removed successfully.' });
        } catch (error) {
            console.error('Error in removeGameFromMyCollection:', error);
            next(error);
        }
    };

    return {
        searchGames,
        getAllAvailableGames,
        getMyGames,
        addGameToMyCollection,
        updateGameInMyCollection,
        removeGameFromMyCollection
    };
};