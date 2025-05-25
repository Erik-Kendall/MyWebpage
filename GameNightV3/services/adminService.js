// server/services/adminService.js

const adminService = (db) => {

    // --- User Management ---
    const getAllUsers = async () => {
        const users = await db.all('SELECT id, username, firstName, lastName, created_at, isAdmin FROM users ORDER BY username ASC');
        // Map isAdmin to boolean for consistency
        return users.map(user => ({
            ...user,
            isAdmin: user.isAdmin === 1
        }));
    };

    const getUserById = async (userId) => {
        const user = await db.get('SELECT id, username, firstName, lastName, email, profilePictureUrl, created_at, isAdmin FROM users WHERE id = ?', userId);
        if (user) {
            user.isAdmin = user.isAdmin === 1; // Convert to boolean
        }
        return user;
    };

    const updateUser = async (userId, updateFields) => {
        let updateQuery = 'UPDATE users SET ';
        const params = [];
        const setParts = [];

        for (const key in updateFields) {
            // Prevent changing ID or isAdmin via general update endpoint
            if (key === 'id' || key === 'isAdmin' || key === 'password' || updateFields[key] === undefined) {
                continue;
            }
            setParts.push(`${key} = ?`);
            params.push(updateFields[key]);
        }

        if (setParts.length === 0) {
            return false; // No fields to update
        }

        updateQuery += setParts.join(', ') + ' WHERE id = ?';
        params.push(userId);

        const result = await db.run(updateQuery, params);
        return result.changes > 0;
    };


    const deleteUser = async (userId) => {
        // Start a transaction to ensure all related data is deleted or rolled back on failure
        await db.run('BEGIN TRANSACTION;');
        try {
            // 1. Delete user's games from user_games table
            await db.run('DELETE FROM user_games WHERE user_id = ?', userId);

            // 2. Delete user's event attendance records
            await db.run('DELETE FROM user_event_attendees WHERE user_id = ?', userId);

            // 3. Delete friend relationships where user is user_id1 or user_id2
            await db.run('DELETE FROM friendships WHERE user_id1 = ? OR user_id2 = ?', userId, userId);

            // 4. Delete events hosted by this user and their attendees
            // First get all event IDs hosted by this user
            const hostedEvents = await db.all('SELECT id FROM events WHERE host_id = ?', userId);
            for (const event of hostedEvents) {
                await db.run('DELETE FROM user_event_attendees WHERE event_id = ?', event.id); // Delete attendees for hosted events
                await db.run('DELETE FROM events WHERE id = ?', event.id); // Delete the hosted event itself
            }

            // 5. Finally, delete the user from the users table
            const result = await db.run('DELETE FROM users WHERE id = ?', userId);

            await db.run('COMMIT;');
            return result.changes > 0;
        } catch (error) {
            await db.run('ROLLBACK;');
            console.error('Transaction failed for deleteUser:', error);
            throw error;
        }
    };

    const setUserAdminStatus = async (userId, isAdmin) => {
        const adminValue = isAdmin ? 1 : 0;
        const result = await db.run('UPDATE users SET isAdmin = ? WHERE id = ?', adminValue, userId);
        return result.changes > 0;
    };

    // --- Event Management ---
    const deleteEventAdmin = async (eventId) => {
        await db.run('BEGIN TRANSACTION;');
        try {
            // Delete associated attendees first
            await db.run('DELETE FROM user_event_attendees WHERE event_id = ?', eventId);
            // Then delete the event itself
            const result = await db.run('DELETE FROM events WHERE id = ?', eventId);
            await db.run('COMMIT;');
            return result.changes > 0;
        } catch (error) {
            await db.run('ROLLBACK;');
            console.error('Transaction failed for deleteEventAdmin:', error);
            throw error;
        }
    };

    // --- Friendship Management ---
    const getAllFriendships = async () => {
        const friendships = await db.all(`
            SELECT
                f.id AS friendship_id,
                f.status,
                u1.id AS user1_id,
                u1.username AS user1_username,
                u2.id AS user2_id,
                u2.username AS user2_username,
                f.created_at
            FROM friendships f
            JOIN users u1 ON f.user_id1 = u1.id
            JOIN users u2 ON f.user_id2 = u2.id
            ORDER BY f.created_at DESC
        `);
        return friendships;
    };

    const deleteFriendship = async (friendshipId) => {
        const result = await db.run('DELETE FROM friendships WHERE id = ?', friendshipId);
        return result.changes > 0;
    };

    // --- Master Game List Management ---
    const addMasterGame = async (gameId, title, thumbnailUrl, description) => {
        const existingGame = await db.get('SELECT id FROM games WHERE title = ?', [title]);
        if (existingGame) {
            const error = new Error('A game with this title already exists in the master list.');
            error.statusCode = 409;
            throw error;
        }
        await db.run(
            `INSERT INTO games (id, title, thumbnailUrl, description) VALUES (?, ?, ?, ?)`,
            [gameId, title, thumbnailUrl, description]
        );
        return true;
    };

    const updateMasterGame = async (gameId, title, thumbnailUrl, description) => {
        const result = await db.run(
            `UPDATE games SET title = ?, thumbnailUrl = ?, description = ? WHERE id = ?`,
            [title, thumbnailUrl, description, gameId]
        );
        return result.changes > 0;
    };

    const deleteMasterGame = async (gameId) => {
        const result = await db.run('DELETE FROM games WHERE id = ?', [gameId]);
        return result.changes > 0;
    };


    return {
        getAllUsers,
        getUserById,
        updateUser,
        deleteUser,
        setUserAdminStatus,
        deleteEventAdmin,
        getAllFriendships,
        deleteFriendship,
        addMasterGame,
        updateMasterGame,
        deleteMasterGame
    };
};

export default adminService;