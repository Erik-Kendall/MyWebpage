// server/routes/friendRoutes.js
import express from 'express';
// No longer need uuidv4 here
// import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Import the friendController and friendService factories
import friendControllerFactory from '../controllers/friendController.js';
import friendServiceFactory from '../services/friendService.js';

export default (db) => { // Still only accepts 'db'
    const router = express.Router();

    // Instantiate the friendService and friendController
    const friendService = friendServiceFactory(db);
    const friendController = friendControllerFactory(friendService);

    // POST /friends/request - Send a friend request
    router.post('/request', authenticateToken, friendController.sendFriendRequest);

    // GET /friends/outgoing - Fetch outgoing friend requests
    router.get('/outgoing', authenticateToken, friendController.getOutgoingRequests);

    // GET /friends/pending - Fetch incoming pending friend requests
    router.get('/pending', authenticateToken, friendController.getIncomingRequests);

    // PUT /friends/respond - Accept or reject a friend request
    router.put('/respond', authenticateToken, friendController.respondToFriendRequest);

    // GET /friends - Fetch accepted friends
    router.get('/', authenticateToken, friendController.getFriendsList);

    // DELETE /friends/:id - Unfriend / Delete a friendship or pending request
    router.delete('/:id', authenticateToken, friendController.deleteFriendship);

    return router;
};