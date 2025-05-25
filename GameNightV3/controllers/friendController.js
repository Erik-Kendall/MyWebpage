// server/controllers/friendController.js
import { v4 as uuidv4 } from 'uuid'; // For generating friendship IDs

// Export a function that accepts 'friendService'
export default (friendService) => {

    const sendFriendRequest = async (req, res, next) => {
        const { recipientUsername } = req.body;
        const requesterId = req.user.id;

        if (!recipientUsername) {
            return res.status(400).json({ message: 'Recipient username is required.' });
        }

        try {
            // 1. Find recipient user
            const recipient = await friendService.findUserByUsername(recipientUsername);
            if (!recipient) {
                return res.status(404).json({ message: 'Recipient user not found.' });
            }
            const recipientId = recipient.id;

            // 2. Prevent self-request
            if (requesterId === recipientId) {
                return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
            }

            // 3. Check for existing friendship/request
            const existingFriendship = await friendService.getExistingFriendship(requesterId, recipientId);
            if (existingFriendship) {
                if (existingFriendship.status === 'pending') {
                    return res.status(409).json({ message: 'Friend request already pending.' });
                } else if (existingFriendship.status === 'accepted') {
                    return res.status(409).json({ message: 'You are already friends.' });
                } else if (existingFriendship.status === 'blocked') {
                    // This implies the other user blocked you or you blocked them.
                    // Decide how you want to handle this. For now, disallow request.
                    return res.status(403).json({ message: 'Cannot send request due to existing block.' });
                }
            }

            // 4. Generate ID and send request via service
            const friendshipId = uuidv4();
            await friendService.sendFriendRequest(requesterId, recipientId, friendshipId);

            res.status(201).json({ message: 'Friend request sent successfully.', friendshipId: friendshipId });
        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
            next(error); // Pass to global error handler
        }
    };

    const getOutgoingRequests = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const outgoingRequests = await friendService.getOutgoingRequests(userId);
            res.status(200).json(outgoingRequests);
        } catch (error) {
            console.error('Error in getOutgoingRequests:', error);
            next(error);
        }
    };

    const getIncomingRequests = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const incomingRequests = await friendService.getIncomingRequests(userId);
            res.status(200).json(incomingRequests);
        } catch (error) {
            console.error('Error in getIncomingRequests:', error);
            next(error);
        }
    };

    const respondToFriendRequest = async (req, res, next) => {
        const { requesterId, status } = req.body;
        const recipientId = req.user.id;

        if (!requesterId || !status) {
            return res.status(400).json({ message: 'Requester ID and status are required.' });
        }
        if (status !== 'accepted' && status !== 'rejected') {
            return res.status(400).json({ message: 'Invalid status provided. Must be "accepted" or "rejected".' });
        }

        try {
            // 1. Find the pending friendship
            const friendship = await friendService.getPendingFriendship(requesterId, recipientId);
            if (!friendship) {
                console.warn(`[Friend Respond] Pending friend request not found for requester: ${requesterId}, recipient: ${recipientId}`);
                return res.status(404).json({ message: 'Pending friend request not found.' });
            }

            // 2. Update status via service
            const updated = await friendService.updateFriendRequestStatus(friendship.id, status);
            if (!updated) {
                // This case should ideally not happen if friendship was found and no error
                return res.status(500).json({ message: 'Failed to update friend request status.' });
            }

            const message = status === 'accepted' ? 'Friend request accepted.' : 'Friend request rejected.';
            res.status(200).json({ message });
        } catch (error) {
            console.error('Error in respondToFriendRequest:', error);
            next(error);
        }
    };

    const getFriendsList = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const friends = await friendService.getAcceptedFriends(userId);
            res.status(200).json({ friends: friends });
        } catch (error) {
            console.error('Error in getFriendsList:', error);
            next(error);
        }
    };

    const deleteFriendship = async (req, res, next) => {
        const friendshipId = req.params.id;
        const userId = req.user.id;

        try {
            // 1. Check if the friendship exists and belongs to the user
            const existingFriendship = await friendService.getFriendshipById(friendshipId);
            if (!existingFriendship) {
                return res.status(404).json({ message: 'Friendship or request not found.' });
            }

            // 2. Authorization check: ensure the current user is part of this friendship
            if (userId !== existingFriendship.user_id1 && userId !== existingFriendship.user_id2) {
                return res.status(403).json({ message: 'You are not authorized to delete this friendship.' });
            }

            // 3. Delete via service
            const deleted = await friendService.deleteFriendship(friendshipId, userId);
            if (!deleted) {
                // This should not happen if previous checks passed
                return res.status(500).json({ message: 'Failed to delete friendship.' });
            }

            res.status(200).json({ message: 'Friendship or request deleted successfully.' });
        } catch (error) {
            console.error('Error in deleteFriendship:', error);
            next(error);
        }
    };

    return {
        sendFriendRequest,
        getOutgoingRequests,
        getIncomingRequests,
        respondToFriendRequest,
        getFriendsList,
        deleteFriendship
    };
};