// src/server/routes/eventRoutes.js

import express from 'express';
// We no longer need authMiddlewareFactory or authServiceFactory directly here
// as `authenticateToken` will be passed in from server.js
// import { authMiddlewareFactory } from '../middleware/authMiddleware.js'; // REMOVE THIS LINE
// import authServiceFactory from '../services/authService.js';           // REMOVE THIS LINE
import eventControllerFactory from '../controllers/eventController.js';
import eventServiceFactory from '../services/eventService.js';
import {
    validate,
    createEventValidation,
    updateEventValidation,
    inviteUsersToEventValidation,
    rsvpStatusValidation,
    removeAttendeeValidation
} from '../middleware/validationMiddleware.js';

// The factory now needs to accept 'authenticateToken' as a parameter
export default (db, authenticateToken) => { // <-- CHANGED PARAMETERS: Now accepts authenticateToken
    const router = express.Router();
    const eventService = eventServiceFactory(db);
    const eventController = eventControllerFactory(eventService);

    // REMOVE THE FOLLOWING BLOCK:
    // const authService = authServiceFactory(db);
    // const { authenticateToken } = authMiddlewareFactory(jwtSecret, authService);

    console.log('[EVENT_ROUTES_DEBUG] Registering /my-events route with passed authenticateToken');

    // All routes will now use the 'authenticateToken' passed into the factory
    router.post('/', authenticateToken, createEventValidation, validate, eventController.createEvent);
    router.get('/my-events', authenticateToken, eventController.getMyEvents);
    router.get('/', eventController.getAllEvents); // This one might not need auth, or you can add it if needed.
    // For 'my-events', it's mandatory.
    router.get('/:id', eventController.getEventById);
    router.put('/:id', authenticateToken, updateEventValidation, validate, eventController.updateEvent);
    router.delete('/:id', authenticateToken, eventController.deleteEvent);
    router.post('/:id/invite', authenticateToken, inviteUsersToEventValidation, validate, eventController.inviteUsersToEvent);
    router.put('/:id/rsvp', authenticateToken, rsvpStatusValidation, validate, eventController.updateRsvpStatus);
    router.post('/:id/attendees', authenticateToken, eventController.addOrUpdateAttendee);
    router.delete('/events/:id/attendees/:userId', authenticateToken, removeAttendeeValidation, validate, eventController.removeAttendee);

    return router;
};