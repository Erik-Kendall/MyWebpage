// server/services/gameService.js

const gameService = (db, popularGames) => { // Accepts db and popularGames as dependencies

    const searchPopularGames = (query) => {
        if (!query) {
            return [];
        }
        const filteredGames = popularGames.filter(game =>
            game.title.toLowerCase().includes(query.toLowerCase())
        );
        return filteredGames;
    };

    const getAllAvailableGames = async () => {
        return await db.all(`
            SELECT id, title, thumbnailUrl, description
            FROM games
            ORDER BY title ASC;
        `);
    };

    const getUserGames = async (userId) => {
        return await db.all('SELECT id, game_title, notes, status FROM user_games WHERE user_id = ? ORDER BY game_title ASC', [userId]);
    };

    const addGameToUserCollection = async (gameId, userId, game_title, notes, status) => {
        try {
            await db.run(
                `INSERT INTO user_games (id, user_id, game_title, notes, status)
                 VALUES (?, ?, ?, ?, ?)`,
                [gameId, userId, game_title, notes, status]
            );
            return true; // Indicate success
        } catch (error) {
            // Check for SQLite unique constraint error
            if (error.message.includes('UNIQUE constraint failed: user_games.user_id, user_games.game_title')) {
                const customError = new Error('You have already added this game.');
                customError.statusCode = 409; // Conflict
                throw customError;
            }
            throw error; // Re-throw other errors
        }
    };

    const updateUserGame = async (gameId, userId, game_title, notes, status) => {
        const result = await db.run(
            `UPDATE user_games SET game_title = ?, notes = ?, status = ? WHERE id = ? AND user_id = ?`,
            [game_title, notes, status, gameId, userId]
        );
        return result.changes > 0; // Return true if a row was updated
    };

    const deleteUserGame = async (gameId, userId) => {
        const result = await db.run(`DELETE FROM user_games WHERE id = ? AND user_id = ?`, [gameId, userId]);
        return result.changes > 0; // Return true if a row was deleted
    };

    return {
        searchPopularGames,
        getAllAvailableGames,
        getUserGames,
        addGameToUserCollection,
        updateUserGame,
        deleteUserGame
    };
};

export default gameService;