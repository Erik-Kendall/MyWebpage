import express from 'express';
import { authMiddlewareFactory } from '../middleware/authMiddleware.js';
import friendControllerFactory from '../controllers/friendController.js';
import friendServiceFactory from '../services/friendService.js';
import {
    validate,
    sendFriendRequestValidation,
    respondToFriendRequestValidation,
    deleteFriendshipValidation
} from '../middleware/validationMiddleware.js';

// >>>>>>>>>>> MODIFIED LINE HERE: Accept db, jwtSecret, and authService <<<<<<<<<<<
export default (db, jwtSecret, authService) => {
    const router = express.Router();
    const friendService = friendServiceFactory(db);
    const friendController = friendControllerFactory(friendService);

    // >>>>>>>>>>> MODIFIED LINE HERE: Pass both jwtSecret and authService <<<<<<<<<<<
    // Instantiate the auth middleware using the factory
    const { authenticateToken } = authMiddlewareFactory(jwtSecret, authService);

    // POST /friends/request - Send a friend request
    router.post('/request',
        authenticateToken,
        sendFriendRequestValidation,
        validate,
        friendController.sendFriendRequest
    );

    // GET /friends/outgoing - Fetch outgoing friend requests
    router.get('/outgoing', authenticateToken, friendController.getOutgoingRequests);

    // GET /friends/pending - Fetch incoming pending friend requests
    router.get('/pending', authenticateToken, friendController.getIncomingRequests);

    // PUT /friends/respond - Accept or reject a friend request
    router.put('/respond',
        authenticateToken,
        respondToFriendRequestValidation,
        validate,
        friendController.respondToFriendRequest
    );

    // GET /friends - Fetch accepted friends
    router.get('/', authenticateToken, friendController.getFriendsList);

    // DELETE /friends/:id - Unfriend / Delete a friendship or pending request
    router.delete('/:id',
        authenticateToken,
        deleteFriendshipValidation,
        validate,
        friendController.deleteFriendship
    );

    return router;
};
// console.log('>>> USERROUTES.JS: FILE LOADED'); // This line was misplaced, it belongs in userRoutes.js