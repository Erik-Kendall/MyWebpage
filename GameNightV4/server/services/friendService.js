import CustomError from '../utils/CustomError.js';

export default (db) => { // Accept db
    const findUserByUsername = async (username) => {
        try {
            return await db.get('SELECT id, username FROM users WHERE username = ?', username);
        } catch (error) {
            console.error('Error in FriendService.findUserByUsername:', error);
            throw new CustomError('Failed to find user by username.', 500);
        }
    };

    const getExistingFriendship = async (userId1, userId2) => {
        try {
            // Check for friendship in both directions (user1 -> user2 or user2 -> user1)
            return await db.get(
                `SELECT id, status, user_id1, user_id2
                 FROM friendships
                 WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
                userId1, userId2, userId2, userId1
            );
        } catch (error) {
            console.error('Error in FriendService.getExistingFriendship:', error);
            throw new CustomError('Failed to check existing friendship.', 500);
        }
    };

    const sendFriendRequest = async (requesterId, recipientId, friendshipId) => {
        try {
            await db.run(
                'INSERT INTO friendships (id, user_id1, user_id2, status, action_user_id) VALUES (?, ?, ?, ?, ?)',
                friendshipId, requesterId, recipientId, 'pending', requesterId
            );
            return true;
        } catch (error) {
            console.error('Error in FriendService.sendFriendRequest:', error);
            // Check if the error is due to the UNIQUE constraint (user_id1, user_id2)
            if (error.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
                throw new CustomError('A friendship or pending request already exists between these users.', 409);
            }
            throw new CustomError('Failed to send friend request.', 500);
        }
    };

    const getOutgoingRequests = async (userId) => {
        try {
            // Select requests where the current user is user_id1 and status is pending
            return await db.all(`
                SELECT f.id, u.username AS recipient_username, u.profile_picture_url
                FROM friendships f
                JOIN users u ON f.user_id2 = u.id
                WHERE f.user_id1 = ? AND f.status = 'pending'
            `, userId);
        } catch (error) {
            console.error('Error in FriendService.getOutgoingRequests:', error);
            throw new CustomError('Failed to retrieve outgoing requests.', 500);
        }
    };

    const getIncomingRequests = async (userId) => {
        try {
            // Select requests where the current user is user_id2 and status is pending
            return await db.all(`
                SELECT f.id, u.username AS requester_username, u.profile_picture_url
                FROM friendships f
                JOIN users u ON f.user_id1 = u.id
                WHERE f.user_id2 = ? AND f.status = 'pending'
            `, userId);
        } catch (error) {
            console.error('Error in FriendService.getIncomingRequests:', error);
            throw new CustomError('Failed to retrieve incoming requests.', 500);
        }
    };

    const getPendingFriendship = async (requesterId, recipientId) => {
        try {
            // Find a pending request where requesterId is user_id1 and recipientId is user_id2
            return await db.get(
                `SELECT id, user_id1, user_id2, status
                 FROM friendships
                 WHERE user_id1 = ? AND user_id2 = ? AND status = 'pending'`,
                requesterId, recipientId
            );
        } catch (error) {
            console.error('Error in FriendService.getPendingFriendship:', error);
            throw new CustomError('Failed to retrieve pending friendship.', 500);
        }
    };

    const updateFriendRequestStatus = async (friendshipId, status) => {
        try {
            const result = await db.run(
                'UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
                status, friendshipId
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in FriendService.updateFriendRequestStatus:', error);
            throw new CustomError('Failed to update friend request status.', 500);
        }
    };

    const getAcceptedFriends = async (userId) => {
        try {
            return await db.all(`
                SELECT u.id, u.username, u.profile_picture_url
                FROM friendships f
                JOIN users u ON u.id = CASE
                    WHEN f.user_id1 = ? THEN f.user_id2
                    ELSE f.user_id1
                END
                WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'accepted'
            `, userId, userId, userId);
        } catch (error) {
            console.error('Error in FriendService.getAcceptedFriends:', error);
            throw new CustomError('Failed to retrieve friends list.', 500);
        }
    };

    const getFriendshipById = async (friendshipId) => {
        try {
            return await db.get('SELECT id, user_id1, user_id2, status FROM friendships WHERE id = ?', friendshipId);
        } catch (error) {
            console.error('Error in FriendService.getFriendshipById:', error);
            throw new CustomError('Failed to retrieve friendship by ID.', 500);
        }
    };

    const deleteFriendship = async (friendshipId, userId) => {
        try {
            // Ensure only one of the involved users can delete the friendship
            const result = await db.run(
                'DELETE FROM friendships WHERE id = ? AND (user_id1 = ? OR user_id2 = ?)',
                friendshipId, userId, userId
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in FriendService.deleteFriendship:', error);
            throw new CustomError('Failed to delete friendship.', 500);
        }
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