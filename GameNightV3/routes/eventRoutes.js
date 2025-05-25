// server/routes/eventRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Import the eventController and eventService factories
import eventControllerFactory from '../controllers/eventController.js';
import eventServiceFactory from '../services/eventService.js';

export default (db) => {
    const router = express.Router();

    // Instantiate the eventService and eventController
    const eventService = eventServiceFactory(db);
    const eventController = eventControllerFactory(eventService);

    // POST /events - Create a new event
    router.post('/', authenticateToken, eventController.createEvent);

    // GET /events/my-events - Fetch all events for the logged-in user (host or invited)
    router.get('/my-events', authenticateToken, eventController.getMyEvents);

    // GET /events - Get all events (or filtered by user ID/status)
    router.get('/', eventController.getAllEvents);

    // GET /events/:id - Get a single event by ID
    router.get('/:id', eventController.getEventById);

    // PUT /events/:id - Update an event
    router.put('/:id', authenticateToken, eventController.updateEvent);

    // DELETE /events/:id - Delete an event
    router.delete('/:id', authenticateToken, eventController.deleteEvent);

    // --- NEW ROUTE FOR INVITING MULTIPLE USERS ---
    // POST /events/:id/invite - Invite multiple users to an event
    router.post('/:id/invite', authenticateToken, eventController.inviteUsersToEvent);
    // --- END NEW ROUTE ---

    // --- NEW ROUTE FOR RSVPING TO AN EVENT ---
    // PUT /events/:id/rsvp - Update a user's RSVP status for an event
    router.put('/:id/rsvp', authenticateToken, eventController.updateRsvpStatus); // <--- ADD THIS LINE
    // --- END NEW RSVP ROUTE ---

    // POST /events/:id/attendees - Add an attendee to an event / Update attendee status
    // (This is primarily for a single user RSVPing or host manually adding one with a status)
    router.post('/:id/attendees', authenticateToken, eventController.addOrUpdateAttendee);

    // DELETE /events/:id/attendees/:userId - Remove an attendee from an event
    router.delete('/:id/attendees/:userId', authenticateToken, eventController.removeAttendee);

    return router;
};