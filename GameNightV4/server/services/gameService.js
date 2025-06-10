import CustomError from '../utils/CustomError.js';

export default (db, popularGames) => { // Accept db and popularGames
    // Private helper to filter popular games
    const searchPopularGames = (query) => {
        if (!query) {
            return popularGames; // Return all if no query
        }
        const lowerCaseQuery = query.toLowerCase();
        return popularGames.filter(game =>
            game.title.toLowerCase().includes(lowerCaseQuery)
        );
    };

    const getAllAvailableGames = async () => {
        try {
            // MODIFIED: Changed 'master_games' to 'games'
            return await db.all('SELECT * FROM games ORDER BY title ASC');
        } catch (error) {
            console.error('Error in GameService.getAllAvailableGames:', error);
            throw new CustomError('Failed to retrieve available games.', 500);
        }
    };

    const getUserGames = async (userId) => {
        try {
            return await db.all('SELECT * FROM user_games WHERE user_id = ? ORDER BY game_title ASC', userId);
        } catch (error) {
            console.error('Error in GameService.getUserGames:', error);
            throw new CustomError('Failed to retrieve user games.', 500);
        }
    };

    const addGameToUserCollection = async (gameId, userId, gameTitle, notes, status) => {
        try {
            // Check for existing entry for this user and game title
            const existingEntry = await db.get('SELECT id FROM user_games WHERE user_id = ? AND game_title = ?', userId, gameTitle);
            if (existingEntry) {
                throw new CustomError('This game is already in your collection.', 409); // Conflict
            }

            await db.run(
                'INSERT INTO user_games (id, user_id, game_title, notes, status) VALUES (?, ?, ?, ?, ?)',
                gameId, userId, gameTitle, notes, status
            );
            return true;
        } catch (error) {
            console.error('Error in GameService.addGameToUserCollection:', error);
            if (error instanceof CustomError) throw error; // Re-throw CustomError
            throw new CustomError('Failed to add game to collection.', 500);
        }
    };

    const updateUserGame = async (gameId, userId, gameTitle, notes, status) => {
        try {
            const result = await db.run(
                `UPDATE user_games SET
                                       game_title = COALESCE(?, game_title),
                                       notes = COALESCE(?, notes),
                                       status = COALESCE(?, status),
                                       updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND user_id = ?`,
                gameTitle, notes, status, gameId, userId
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in GameService.updateUserGame:', error);
            throw new CustomError('Failed to update game in collection.', 500);
        }
    };

    const deleteUserGame = async (gameId, userId) => {
        try {
            const result = await db.run('DELETE FROM user_games WHERE id = ? AND user_id = ?', gameId, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in GameService.deleteUserGame:', error);
            throw new CustomError('Failed to remove game from collection.', 500);
        }
    };

    return {
        searchPopularGames, // Now exposed via the factory
        getAllAvailableGames,
        getUserGames,
        addGameToUserCollection,
        updateUserGame,
        deleteUserGame
    };
};