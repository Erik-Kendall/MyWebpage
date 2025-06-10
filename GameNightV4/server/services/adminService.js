// E:\Game Night\website\server\services\adminService.js

export default (db) => {
    // Initial check to see if db is correctly passed
    console.log('[DEBUG-ADMIN-SERVICE] adminServiceFactory received db:', !!db);

    return {
        // --- User Management ---
        getAllUsers: async () => {
            console.log('[ADMIN_SERVICE] Entering getAllUsers'); // <--- ADDED LOG
            try {
                // Ensure the 'users' table exists and has these columns if not done by schema setup
                const users = await db.all('SELECT id, username, email, isAdmin, profilePicture, createdAt FROM users');
                console.log('[ADMIN_SERVICE] Fetched users count:', users.length); // <--- ADDED LOG
                return users;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in getAllUsers:', error); // <--- ADDED ERROR LOG
                throw error; // Re-throw to be caught by controller
            }
        },

        getUserById: async (userId) => {
            console.log('[ADMIN_SERVICE] Entering getUserById'); // <--- ADDED LOG
            try {
                const user = await db.get('SELECT id, username, email, isAdmin, profilePicture, createdAt FROM users WHERE id = ?', userId);
                console.log('[ADMIN_SERVICE] Fetched user:', user ? user.username : 'Not found'); // <--- ADDED LOG
                return user;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in getUserById:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        updateUser: async (userId, userData) => {
            console.log('[ADMIN_SERVICE] Entering updateUser'); // <--- ADDED LOG
            try {
                const { username, email, profilePicture } = userData;
                const result = await db.run(
                    'UPDATE users SET username = ?, email = ?, profilePicture = ? WHERE id = ?',
                    username, email, profilePicture, userId
                );
                console.log('[ADMIN_SERVICE] Update user result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in updateUser:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        deleteUser: async (userId) => {
            console.log('[ADMIN_SERVICE] Entering deleteUser'); // <--- ADDED LOG
            try {
                const result = await db.run('DELETE FROM users WHERE id = ?', userId);
                console.log('[ADMIN_SERVICE] Delete user result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in deleteUser:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        setUserAdminStatus: async (userId, isAdmin) => {
            console.log('[ADMIN_SERVICE] Entering setUserAdminStatus'); // <--- ADDED LOG
            try {
                const result = await db.run('UPDATE users SET isAdmin = ? WHERE id = ?', isAdmin ? 1 : 0, userId);
                console.log('[ADMIN_SERVICE] Set admin status result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in setUserAdminStatus:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        // --- Event Management ---
        deleteEvent: async (eventId) => {
            console.log('[ADMIN_SERVICE] Entering deleteEvent'); // <--- ADDED LOG
            try {
                // Delete from user_event_attendees first to avoid foreign key constraints
                await db.run('DELETE FROM user_event_attendees WHERE event_id = ?', eventId);
                const result = await db.run('DELETE FROM events WHERE id = ?', eventId);
                console.log('[ADMIN_SERVICE] Delete event result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in deleteEvent:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        // --- Friendship Management ---
        getAllFriendships: async () => {
            console.log('[ADMIN_SERVICE] Entering getAllFriendships'); // <--- ADDED LOG
            try {
                // Fetch friendships with usernames
                const friendships = await db.all(`
                    SELECT
                        f.id,
                        f.user1_id,
                        u1.username AS user1_username,
                        f.user2_id,
                        u2.username AS user2_username,
                        f.status,
                        f.initiated_at,
                        f.responded_at
                    FROM
                        friendships f
                    JOIN
                        users u1 ON f.user1_id = u1.id
                    JOIN
                        users u2 ON f.user2_id = u2.id
                `);
                console.log('[ADMIN_SERVICE] Fetched friendships count:', friendships.length); // <--- ADDED LOG
                return friendships;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in getAllFriendships:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        deleteFriendship: async (friendshipId) => {
            console.log('[ADMIN_SERVICE] Entering deleteFriendship'); // <--- ADDED LOG
            try {
                const result = await db.run('DELETE FROM friendships WHERE id = ?', friendshipId);
                console.log('[ADMIN_SERVICE] Delete friendship result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in deleteFriendship:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        // --- Master Game List Management ---
        addMasterGame: async (gameData) => {
            console.log('[ADMIN_SERVICE] Entering addMasterGame'); // <--- ADDED LOG
            try {
                const { name, minPlayers, maxPlayers, description, imageUrl, bggId } = gameData;
                const result = await db.run(
                    'INSERT INTO games (name, minPlayers, maxPlayers, description, imageUrl, bggId) VALUES (?, ?, ?, ?, ?, ?)',
                    name, minPlayers, maxPlayers, description, imageUrl, bggId
                );
                const newGameId = result.lastID;
                const newGame = await db.get('SELECT * FROM games WHERE id = ?', newGameId);
                console.log('[ADMIN_SERVICE] Added master game:', newGame ? newGame.name : 'Failed'); // <--- ADDED LOG
                return newGame;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in addMasterGame:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        updateMasterGame: async (gameId, gameData) => {
            console.log('[ADMIN_SERVICE] Entering updateMasterGame'); // <--- ADDED LOG
            try {
                const { name, minPlayers, maxPlayers, description, imageUrl, bggId } = gameData;
                const result = await db.run(
                    'UPDATE games SET name = ?, minPlayers = ?, maxPlayers = ?, description = ?, imageUrl = ?, bggId = ? WHERE id = ?',
                    name, minPlayers, maxPlayers, description, imageUrl, bggId, gameId
                );
                console.log('[ADMIN_SERVICE] Update master game result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in updateMasterGame:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        },

        deleteMasterGame: async (gameId) => {
            console.log('[ADMIN_SERVICE] Entering deleteMasterGame'); // <--- ADDED LOG
            try {
                const result = await db.run('DELETE FROM games WHERE id = ?', gameId);
                console.log('[ADMIN_SERVICE] Delete master game result (changes):', result.changes); // <--- ADDED LOG
                return result.changes > 0;
            } catch (error) {
                console.error('[ADMIN_SERVICE_ERROR] Error in deleteMasterGame:', error); // <--- ADDED ERROR LOG
                throw error;
            }
        }
    };
};