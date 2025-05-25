// server/services/friendService.js

const friendService = (db) => {

    // Helper to find a user by username
    const findUserByUsername = async (username) => {
        return await db.get('SELECT id FROM users WHERE username = ?', [username]);
    };

    // Helper to check for existing friendship/request between two users
    const getExistingFriendship = async (userId1, userId2) => {
        return await db.get(
            `SELECT id, status, user_id1, user_id2 FROM friendships
             WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
            [userId1, userId2, userId2, userId1]
        );
    };

    const sendFriendRequest = async (requesterId, recipientId, friendshipId) => {
        // This service method assumes pre-checks (user existence, self-request, existing friendship status)
        // are handled by the controller to throw specific errors,
        // or that `getExistingFriendship` is called *before* this.

        await db.run(
            `INSERT INTO friendships (id, user_id1, user_id2, status)
             VALUES (?, ?, ?, 'pending')`,
            [friendshipId, requesterId, recipientId]
        );
        return true; // Indicate success
    };

    const getOutgoingRequests = async (userId) => {
        return await db.all(
            `SELECT f.id AS friendship_id, u.id AS recipient_id, u.username AS recipient_username, u.profilePictureUrl
             FROM friendships f
                      JOIN users u ON f.user_id2 = u.id
             WHERE f.user_id1 = ? AND f.status = 'pending'`,
            [userId]
        );
    };

    const getIncomingRequests = async (userId) => {
        return await db.all(
            `SELECT f.id AS friendship_id, u.id AS requester_id, u.username AS requester_username, u.profilePictureUrl
             FROM friendships f
                      JOIN users u ON f.user_id1 = u.id
             WHERE f.user_id2 = ? AND f.status = 'pending'`,
            [userId]
        );
    };

    const getPendingFriendship = async (requesterId, recipientId) => {
        return await db.get(
            `SELECT id, status FROM friendships
             WHERE user_id1 = ? AND user_id2 = ? AND status = 'pending'`,
            [requesterId, recipientId]
        );
    };

    const updateFriendRequestStatus = async (friendshipId, status) => {
        const result = await db.run(
            `UPDATE friendships SET status = ? WHERE id = ?`,
            [status, friendshipId]
        );
        return result.changes > 0; // Return true if a row was updated
    };

    const getAcceptedFriends = async (userId) => {
        return await db.all(
            `SELECT f.id AS friendship_id,
                    CASE
                        WHEN f.user_id1 = ? THEN u2.id
                        ELSE u1.id
                        END AS id, -- CHANGED THIS ALIAS FROM friend_user_id TO id
                    CASE
                        WHEN f.user_id1 = ? THEN u2.username
                        ELSE u1.username
                        END AS username,
                    f.status,
                    CASE
                        WHEN f.user_id1 = ? THEN u2.profilePictureUrl
                        ELSE u1.profilePictureUrl
                        END AS profilePictureUrl
             FROM friendships f
                      JOIN users u1 ON f.user_id1 = u1.id
                      JOIN users u2 ON f.user_id2 = u2.id
             WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'accepted'`,
            [userId, userId, userId, userId, userId]
        );
    };

    const getFriendshipById = async (friendshipId) => {
        return await db.get(
            `SELECT id, user_id1, user_id2 FROM friendships WHERE id = ?`,
            [friendshipId]
        );
    };

    const deleteFriendship = async (friendshipId, userId) => {
        const result = await db.run(
            `DELETE FROM friendships WHERE id = ? AND (user_id1 = ? OR user_id2 = ?)`,
            [friendshipId, userId, userId]
        );
        return result.changes > 0; // Return true if a row was deleted
    };


    return {
        findUserByUsername,
        getExistingFriendship,
        sendFriendRequest,
        getOutgoingRequests,
        getIncomingRequests,
        getPendingFriendship,
        updateFriendRequestStatus,
        getAcceptedFriends,
        getFriendshipById,
        deleteFriendship
    };
};

export default friendService;