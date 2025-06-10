import { v4 as uuidv4 } from 'uuid'; // For generating event IDs

export default (eventService) => {

    const createEvent = async (req, res, next) => {
        const { title, description, event_date, event_time, location, max_players, game_id, game_title } = req.body;
        const host_id = req.user.id;

        try {
            const eventId = uuidv4();
            const newEvent = await eventService.createEvent(
                eventId,
                host_id,
                title,
                description,
                event_date,
                event_time,
                location,
                max_players,
                game_id,
                game_title
            );
            res.status(201).json({ message: 'Event created successfully!', event: newEvent });
        } catch (error) {
            console.error('Error in createEvent:', error);
            next(error); // Pass to global error handler
        }
    };

    const getMyEvents = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const myEvents = await eventService.getEventsForUser(userId);
            res.status(200).json(myEvents);
        } catch (error) {
            console.error('Error in getMyEvents:', error);
            next(error);
        }
    };

    const getAllEvents = async (req, res, next) => {
        try {
            const events = await eventService.getAllEvents();
            res.status(200).json(events);
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            next(error);
        }
    };

    const getEventById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const event = await eventService.getEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            res.status(200).json(event);
        } catch (error) {
            console.error('Error in getEventById:', error);
            next(error);
        }
    };

    const updateEvent = async (req, res, next) => {
        const { id } = req.params;
        const { title, description, event_date, event_time, location, max_players, game_id, game_title, status } = req.body;
        const userId = req.user.id; // User performing the update

        try {
            const updated = await eventService.updateEvent(
                id,
                userId, // Pass userId for authorization check in service
                title,
                description,
                event_date,
                event_time,
                location,
                max_players,
                game_id,
                game_title,
                status
            );

            if (!updated) {
                // This could mean event not found, or user is not authorized
                return res.status(404).json({ message: 'Event not found or you are not authorized to update it.' });
            }

            res.status(200).json({ message: 'Event updated successfully.' });
        } catch (error) {
            console.error('Error in updateEvent:', error);
            next(error);
        }
    };

    const deleteEvent = async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.id; // User performing the delete

        try {
            const deleted = await eventService.deleteEvent(id, userId); // Pass userId for authorization check
            if (!deleted) {
                return res.status(404).json({ message: 'Event not found or you are not authorized to delete it.' });
            }
            res.status(200).json({ message: 'Event deleted successfully.' });
        } catch (error) {
            console.error('Error in deleteEvent:', error);
            next(error);
        }
    };

    const inviteUsersToEvent = async (req, res, next) => {
        const { id } = req.params; // Event ID
        const { invitedUserIds } = req.body;
        const hostId = req.user.id; // User sending invites (must be event host)

        try {
            const eventExists = await eventService.getEventById(id);
            if (!eventExists) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            if (eventExists.host_id !== hostId) {
                return res.status(403).json({ message: 'You are not authorized to invite users to this event.' });
            }

            const results = await eventService.inviteUsersToEvent(id, hostId, invitedUserIds);
            res.status(200).json({ message: 'Users invited successfully.', results });
        } catch (error) {
            console.error('Error in inviteUsersToEvent:', error);
            next(error);
        }
    };

    const updateRsvpStatus = async (req, res, next) => {
        const { id } = req.params; // Event ID
        const { status } = req.body;
        const userId = req.user.id; // User updating RSVP

        try {
            const updated = await eventService.updateRsvpStatus(id, userId, status);
            if (!updated) {
                // This could mean event/user not found, or RSVP entry doesn't exist
                return res.status(404).json({ message: 'Event or RSVP not found, or update failed.' });
            }
            res.status(200).json({ message: 'RSVP status updated successfully.' });
        } catch (error) {
            console.error('Error in updateRsvpStatus:', error);
            next(error);
        }
    };

    const addOrUpdateAttendee = async (req, res, next) => {
        const { id } = req.params; // Event ID
        const { userId: targetUserId, status } = req.body; // User to add/update, and their status
        const currentUserId = req.user.id; // The user making the request (must be host)

        try {
            const event = await eventService.getEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            if (event.host_id !== currentUserId) {
                return res.status(403).json({ message: 'You are not authorized to manage attendees for this event.' });
            }

            const updated = await eventService.addOrUpdateAttendee(id, targetUserId, status);
            if (!updated) {
                return res.status(500).json({ message: 'Failed to add/update attendee.' });
            }
            res.status(200).json({ message: 'Attendee status updated successfully.' });
        } catch (error) {
            console.error('Error in addOrUpdateAttendee:', error);
            next(error);
        }
    };

    const removeAttendee = async (req, res, next) => {
        const { id, userId } = req.params; // Event ID, Attendee User ID
        const currentUserId = req.user.id; // The user making the request (must be host)

        try {
            const event = await eventService.getEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            if (event.host_id !== currentUserId) {
                return res.status(403).json({ message: 'You are not authorized to remove attendees from this event.' });
            }

            const removed = await eventService.removeAttendee(id, userId);
            if (!removed) {
                return res.status(404).json({ message: 'Attendee not found for this event.' });
            }
            res.status(200).json({ message: 'Attendee removed successfully.' });
        } catch (error) {
            console.error('Error in removeAttendee:', error);
            next(error);
        }
    };


    return {
        createEvent,
        getMyEvents,
        getAllEvents,
        getEventById,
        updateEvent,
        deleteEvent,
        inviteUsersToEvent,
        updateRsvpStatus,
        addOrUpdateAttendee,
        removeAttendee,
    };
};