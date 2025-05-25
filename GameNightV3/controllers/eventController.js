// server/controllers/eventController.js
import { v4 as uuidv4 } from 'uuid'; // For generating event IDs and attendee entry IDs

// Export a function that accepts 'eventService'
export default (eventService) => {

    const createEvent = async (req, res, next) => {
        const { title, description, event_date, event_time, location, max_players, game_id, game_title } = req.body;
        const hostId = req.user.id;
        const hostUsername = req.user.username;

        if (!title || !event_date || !event_time || !location) {
            return res.status(400).json({ message: 'Title, date, time, and location are required for an event.' });
        }

        // --- UPDATED VALIDATION FOR max_players in createEvent ---
        let validatedMaxPlayers = null; // Default to null if not provided or invalid
        if (max_players !== undefined && max_players !== null && max_players !== '') {
            const parsedMaxPlayers = parseInt(max_players, 10);
            if (isNaN(parsedMaxPlayers) || parsedMaxPlayers < 1) {
                return res.status(400).json({ message: 'Max players must be a positive number if provided.' });
            }
            validatedMaxPlayers = parsedMaxPlayers;
        }
        // --- END UPDATED VALIDATION ---

        try {
            const eventId = uuidv4();
            await eventService.createEvent(eventId, title, description, event_date, event_time, location, hostId, hostUsername, validatedMaxPlayers, game_id, game_title);
            res.status(201).json({ message: 'Event created successfully!', eventId });
        } catch (error) {
            console.error('Error in createEvent:', error);
            next(error);
        }
    };

    const getMyEvents = async (req, res, next) => {
        const userId = req.user.id;
        try {
            const myEvents = await eventService.getMyEvents(userId);

            // Fetch all attendees for each event (similar to your original logic)
            const eventsWithFullAttendees = await Promise.all(myEvents.map(async (event) => {
                const attendees = await eventService.getAttendeesForEvent(event.event_id);
                return { ...event, attendees };
            }));

            res.status(200).json(eventsWithFullAttendees);
        } catch (error) {
            console.error('Error in getMyEvents:', error);
            next(error);
        }
    };

    const getAllEvents = async (req, res, next) => {
        const { userId, status } = req.query; // These are filter parameters, not related to the current user
        try {
            const events = await eventService.getAllEvents(userId, status);

            const eventsWithAttendees = await Promise.all(events.map(async (event) => {
                try {
                    const allAttendees = await eventService.getAttendeesForEvent(event.event_id);
                    const acceptedAttendeesCount = allAttendees.filter(att => att.status === 'accepted').length;
                    return { ...event, current_attendees: acceptedAttendeesCount, attendees: allAttendees };
                } catch (innerError) {
                    console.error(`ERROR: Failed to fetch attendees for event_id ${event.event_id}:`, innerError);
                    return { ...event, current_attendees: 0, attendees: [] };
                }
            }));

            res.status(200).json(eventsWithAttendees);
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            next(error);
        }
    };

    const getEventById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const event = await eventService.findEventById(id);

            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }

            const attendees = await eventService.getAttendeesForEvent(event.event_id);

            const acceptedAttendees = attendees.filter(att => att.status === 'accepted');
            const pendingInvitees = attendees.filter(att => att.status === 'invited'); // Assuming 'invited' is a possible status

            const current_attendees = acceptedAttendees.length;

            res.status(200).json({ ...event, current_attendees, attendees, acceptedAttendees, pendingInvitees });
        } catch (error) {
            console.error('Error in getEventById:', error);
            next(error);
        }
    };

    const updateEvent = async (req, res, next) => {
        const { id } = req.params;
        const { title, description, event_date, event_time, location, max_players, game_id, game_title, status } = req.body;
        const userId = req.user.id;

        if (!title || !event_date || !event_time || !location) {
            return res.status(400).json({ message: 'Title, date, time, and location are required for an event update.' });
        }
        // Basic validation for status if you have allowed event statuses
        const allowedEventStatuses = ['scheduled', 'cancelled', 'completed']; // Corrected example statuses based on schema
        if (status && !allowedEventStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid event status provided.' });
        }

        // --- UPDATED VALIDATION FOR max_players IN UPDATE ---
        let validatedMaxPlayers = null; // Default to null if provided as empty string/null
        if (max_players !== undefined) { // Check if the field was sent at all
            if (max_players === null || max_players === '') {
                validatedMaxPlayers = null; // Explicitly set to null if received as null or empty string
            } else {
                const parsedMaxPlayers = parseInt(max_players, 10);
                if (isNaN(parsedMaxPlayers) || parsedMaxPlayers < 1) {
                    return res.status(400).json({ message: 'Max players must be a positive number if provided.' });
                }
                validatedMaxPlayers = parsedMaxPlayers;
            }
        } else {
            // If max_players is completely undefined, it means the field wasn't sent in the request,
            // so we indicate "no change" to the service.
            validatedMaxPlayers = undefined;
        }
        // --- END UPDATED VALIDATION IN UPDATE ---

        try {
            const event = await eventService.findEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            if (event.host_id !== userId) {
                return res.status(403).json({ message: 'You are not authorized to update this event.' });
            }

            // Ensure eventService.updateEvent handles `undefined` for `max_players`
            const updated = await eventService.updateEvent(id, userId, title, description, event_date, event_time, location, validatedMaxPlayers, game_id, game_title, status);
            if (!updated) {
                return res.status(200).json({ message: 'Event found, but no changes were applied (data was identical).' });
            }
            res.status(200).json({ message: 'Event updated successfully!' });
        } catch (error) {
            console.error('Error in updateEvent:', error);
            next(error);
        }
    };

    const deleteEvent = async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const event = await eventService.findEventById(id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            if (event.host_id !== userId) {
                return res.status(403).json({ message: 'You are not authorized to delete this event.' });
            }

            const deleted = await eventService.deleteEvent(id, userId);
            if (!deleted) {
                // This case should ideally not happen if checks passed
                return res.status(500).json({ message: 'Failed to delete event.' });
            }
            res.status(200).json({ message: 'Event deleted successfully.' });
        } catch (error) {
            console.error('Error in deleteEvent:', error);
            next(error);
        }
    };

    const addOrUpdateAttendee = async (req, res, next) => {
        const eventId = req.params.id;
        const attendeeId = req.user.id;
        const { status } = req.body;

        const allowedAttendeeStatuses = ['accepted', 'declined', 'invited', 'pending'];
        if (!status || !allowedAttendeeStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedAttendeeStatuses.join(', ')}.` });
        }

        console.log(`[DEBUG - eventController.addOrUpdateAttendee] Event ID: ${eventId}, Attendee ID: ${attendeeId}, Status: ${status}`);

        try {
            const event = await eventService.findEventById(eventId);
            if (!event) {
                console.log(`[DEBUG - eventController.addOrUpdateAttendee] Event ${eventId} not found.`);
                return res.status(404).json({ message: 'Event not found.' });
            }

            const existingAttendee = await eventService.findAttendeeStatus(eventId, attendeeId);

            if (existingAttendee) {
                console.log(`[DEBUG - eventController.addOrUpdateAttendee] Existing attendee status for ${attendeeId}: ${existingAttendee.status}`);
                if (existingAttendee.status === status) {
                    return res.status(409).json({ message: `You are already ${status} for this event.` });
                } else {
                    const updated = await eventService.updateAttendeeStatus(existingAttendee.id, status);
                    if (!updated) {
                        console.log(`[DEBUG - eventController.addOrUpdateAttendee] Failed to update status for existing attendee.`);
                        return res.status(500).json({ message: 'Failed to update attendee status.' });
                    }
                    return res.status(200).json({ message: `Your status for this event has been updated to ${status}.` });
                }
            } else {
                const attendeeEntryId = uuidv4();
                console.log(`[DEBUG - eventController.addOrUpdateAttendee] Adding new attendee: Entry ID=${attendeeEntryId}, User ID=${attendeeId}, Status=${status}`);
                await eventService.addAttendee(attendeeEntryId, eventId, attendeeId, status);
                res.status(201).json({ message: `Successfully set status to ${status} for event.` });
            }
        } catch (error) {
            console.error('[ERROR - eventController.addOrUpdateAttendee]:', error);
            next(error);
        }
    };

    // --- NEW: Handle RSVP status updates (Accept/Decline) ---
    const updateRsvpStatus = async (req, res, next) => {
        // This function will essentially act as an alias for addOrUpdateAttendee
        // since the logic is identical: update an attendee's status for an event.
        return addOrUpdateAttendee(req, res, next);
    };
    // --- END NEW RSVP FUNCTION ---

    const removeAttendee = async (req, res, next) => {
        const eventId = req.params.id;
        const userIdToDelete = req.params.userId;
        const currentUserId = req.user.id; // User making the request

        console.log(`[DEBUG - eventController.removeAttendee] Attempting to remove attendee ${userIdToDelete} from event ${eventId} by user ${currentUserId}`);

        try {
            const event = await eventService.findEventById(eventId);
            if (!event) {
                console.log(`[DEBUG - eventController.removeAttendee] Event ${eventId} not found.`);
                return res.status(404).json({ message: 'Event not found.' });
            }

            // Authorization: Only the event host OR the attendee themselves can remove attendance
            if (event.host_id !== currentUserId && userIdToDelete !== currentUserId) {
                console.log(`[DEBUG - eventController.removeAttendee] User ${currentUserId} not authorized. Host: ${event.host_id}`);
                return res.status(403).json({ message: 'You are not authorized to remove this attendee.' });
            }

            // Optional: Check if attendee exists before trying to delete for better error messages
            const existingAttendee = await eventService.findAttendeeStatus(eventId, userIdToDelete);
            if (!existingAttendee) {
                console.log(`[DEBUG - eventController.removeAttendee] Attendee ${userIdToDelete} not found for event ${eventId}.`);
                return res.status(404).json({ message: 'Attendee not found for this event.' });
            }

            const deleted = await eventService.removeAttendee(eventId, userIdToDelete, currentUserId, event.host_id);
            if (!deleted) {
                // This case should ideally not happen if existingAttendee was found
                console.log(`[DEBUG - eventController.removeAttendee] Failed to delete attendee ${userIdToDelete} even after checks.`);
                return res.status(500).json({ message: 'Failed to remove attendee.' });
            }
            res.status(200).json({ message: 'Attendee removed successfully.' });
        } catch (error) {
            console.error('[ERROR - eventController.removeAttendee]:', error);
            next(error);
        }
    };

    // --- Invite Users to Event Function ---
    const inviteUsersToEvent = async (req, res, next) => {
        const eventId = req.params.id; // Event ID from URL
        const invitedUserIds = req.body.invitedUserIds; // Array of user IDs from frontend
        const currentUserId = req.user.id; // The user making the invitation (should be host)

        console.log(`[DEBUG - eventController.inviteUsersToEvent] Received request for eventId: ${eventId}`);
        console.log(`[DEBUG - eventController.inviteUsersToEvent] Invited User IDs: ${JSON.stringify(invitedUserIds)}`);
        console.log(`[DEBUG - eventController.inviteUsersToEvent] Current User ID (Host): ${currentUserId}`);

        if (!Array.isArray(invitedUserIds) || invitedUserIds.length === 0) {
            console.log(`[DEBUG - eventController.inviteUsersToEvent] No user IDs provided.`);
            return res.status(400).json({ message: 'No user IDs provided for invitation.' });
        }

        try {
            const event = await eventService.findEventById(eventId);
            if (!event) {
                console.log(`[DEBUG - eventController.inviteUsersToEvent] Event ${eventId} not found.`);
                return res.status(404).json({ message: 'Event not found.' });
            }

            // Authorization: Only the event host can send invitations
            if (event.host_id !== currentUserId) {
                console.log(`[DEBUG - eventController.inviteUsersToEvent] User ${currentUserId} not authorized. Host is ${event.host_id}.`);
                return res.status(403).json({ message: 'You are not authorized to invite users to this event.' });
            }

            const results = [];
            for (const userId of invitedUserIds) {
                // Ensure the host doesn't invite themselves (they are already an attendee as host)
                if (userId === currentUserId) {
                    results.push({ userId, status: 'skipped', message: 'User is the host.' });
                    console.log(`[DEBUG - eventController.inviteUsersToEvent] Skipping invitation for host user ${userId}.`);
                    continue;
                }

                const existingAttendee = await eventService.findAttendeeStatus(eventId, userId);

                if (existingAttendee) {
                    // User is already an attendee (could be accepted, invited, declined, etc.)
                    results.push({ userId, status: 'skipped', message: `User already has status: ${existingAttendee.status}.` });
                    console.log(`[DEBUG - eventController.inviteUsersToEvent] User ${userId} already has status: ${existingAttendee.status} for event ${eventId}.`);
                } else {
                    // Add as new invited attendee
                    const attendeeEntryId = uuidv4(); // Generate a new UUID for each attendee entry
                    console.log(`[DEBUG - eventController.inviteUsersToEvent] Adding new invited attendee: ID=${attendeeEntryId}, Event=${eventId}, User=${userId}, Status=invited.`);
                    await eventService.addAttendee(attendeeEntryId, eventId, userId, 'invited'); // Set status to 'invited'
                    results.push({ userId, status: 'invited', message: 'Invitation sent.' });
                }
            }

            res.status(200).json({
                message: 'Invitation process completed.',
                invitationResults: results // Provide details for each invitation attempt
            });

        } catch (error) {
            console.error('[ERROR - eventController.inviteUsersToEvent]:', error);
            next(error); // Pass error to global error handler
        }
    };


    return {
        createEvent,
        getMyEvents,
        getAllEvents,
        getEventById,
        updateEvent,
        deleteEvent,
        addOrUpdateAttendee,
        removeAttendee,
        inviteUsersToEvent,
        updateRsvpStatus, // Make sure this is exported!
    };
};