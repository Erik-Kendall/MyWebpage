// src/server/services/eventService.js

import CustomError from '../utils/CustomError.js';

export default (db) => {
    const createEvent = async (eventId, hostId, title, description, eventDate, eventTime, location, maxPlayers, gameId, gameTitle) => {
        try {
            const event = {
                id: eventId,
                host_id: hostId,
                title,
                description,
                event_date: eventDate,
                event_time: eventTime,
                location,
                max_players: maxPlayers,
                game_id: gameId,
                game_title: gameTitle
            };

            await db.run(
                `INSERT INTO events (id, host_id, title, description, event_date, event_time, location, max_players, game_id, game_title)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                event.id, event.host_id, event.title, event.description, event.event_date,
                event.event_time, event.location, event.max_players, event.game_id, event.game_title
            );

            // Add the host as an attendee with 'accepted' status
            await db.run(
                'INSERT INTO user_event_attendees (event_id, user_id, status) VALUES (?, ?, ?)',
                eventId, hostId, 'accepted'
            );

            return event;
        } catch (error) {
            console.error('Error in EventService.createEvent:', error);
            throw new CustomError('Failed to create event.', 500);
        }
    };

    const getEventsForUser = async (userId) => {
        try {
            console.log(`[EVENT_SERVICE] Attempting to fetch events for user ID: ${userId}`);
            const query = `
                SELECT DISTINCT e.*, u.username AS host_username
                FROM events e
                         JOIN users u ON e.host_id = u.id
                         LEFT JOIN user_event_attendees ea ON e.id = ea.event_id
                WHERE e.host_id = ? OR ea.user_id = ?
                ORDER BY e.event_date, e.event_time
            `;
            console.log(`[EVENT_SERVICE] Executing query: ${query.replace(/\s+/g, ' ').trim()}`);
            console.log(`[EVENT_SERVICE] Query parameters: userId=${userId}, userId=${userId}`);

            const events = await db.all(query, userId, userId);
            console.log(`[EVENT_SERVICE] Successfully fetched ${events.length} events for user ID: ${userId}`);
            return events;
        } catch (error) {
            console.error('[EVENT_SERVICE_ERROR] Error in EventService.getEventsForUser - RAW ERROR:', error);
            console.error(`[EVENT_SERVICE_ERROR] Error Message: ${error.message}`);
            console.error(`[EVENT_SERVICE_ERROR] Error Stack: ${error.stack}`);
            throw new CustomError('Failed to retrieve user events.', 500);
        }
    };

    const getAllEvents = async () => {
        try {
            const events = await db.all(`
                SELECT e.*, u.username AS host_username
                FROM events e
                         JOIN users u ON e.host_id = u.id
                ORDER BY e.event_date, e.event_time
            `);
            return events;
        } catch (error) {
            console.error('Error in EventService.getAllEvents:', error);
            throw new CustomError('Failed to retrieve all events.', 500);
        }
    };

    const getEventById = async (eventId) => {
        try {
            const event = await db.get(`
                SELECT e.*, u.username AS host_username
                FROM events e
                         JOIN users u ON e.host_id = u.id
                WHERE e.id = ?
            `, eventId);

            if (event) {
                // Fetch attendees for the event
                const attendees = await db.all(`
                    SELECT ea.user_id, u.username, u.profile_picture_url, ea.status, ea.invited_by,
                           iu.username AS invited_by_username
                    FROM user_event_attendees ea
                             JOIN users u ON ea.user_id = u.id
                             LEFT JOIN users iu ON ea.invited_by = iu.id
                    WHERE ea.event_id = ?
                `, eventId);
                event.attendees = attendees;
            }
            return event;
        } catch (error) {
            console.error('Error in EventService.getEventById:', error);
            throw new CustomError('Failed to retrieve event.', 500);
        }
    };

    const updateEvent = async (eventId, userId, title, description, eventDate, eventTime, location, maxPlayers, gameId, gameTitle, status) => {
        try {
            // Ensure only the host can update the event
            const event = await db.get('SELECT host_id FROM events WHERE id = ?', eventId);
            if (!event || event.host_id !== userId) {
                return false; // Event not found or user not authorized
            }

            const result = await db.run(
                `UPDATE events SET
                                   title = COALESCE(?, title),
                                   description = COALESCE(?, description),
                                   event_date = COALESCE(?, event_date),
                                   event_time = COALESCE(?, event_time),
                                   location = COALESCE(?, location),
                                   max_players = COALESCE(?, max_players),
                                   game_id = COALESCE(?, game_id),
                                   game_title = COALESCE(?, game_title),
                                   status = COALESCE(?, status),
                                   updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                title, description, eventDate, eventTime, location, maxPlayers, gameId, gameTitle, status, eventId
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in EventService.updateEvent:', error);
            throw new CustomError('Failed to update event.', 500);
        }
    };

    const deleteEvent = async (eventId, userId) => {
        try {
            // Ensure only the host can delete the event
            const event = await db.get('SELECT host_id FROM events WHERE id = ?', eventId);
            if (!event || event.host_id !== userId) {
                return false; // Event not found or user not authorized
            }
            const result = await db.run('DELETE FROM events WHERE id = ?', eventId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in EventService.deleteEvent:', error);
            throw new CustomError('Failed to delete event.', 500);
        }
    };

    const inviteUsersToEvent = async (eventId, hostId, invitedUserIds) => {
        try {
            const event = await db.get('SELECT host_id, max_players FROM events WHERE id = ?', eventId);
            if (!event || event.host_id !== hostId) {
                throw new CustomError('Event not found or you are not authorized to invite users.', 403);
            }

            const existingAttendees = await db.all('SELECT user_id FROM user_event_attendees WHERE event_id = ?', eventId);
            const existingAttendeeIds = new Set(existingAttendees.map(att => att.user_id));

            const results = [];
            for (const userId of invitedUserIds) {
                if (existingAttendeeIds.has(userId)) {
                    results.push({ userId, status: 'skipped', message: 'Already an attendee or invited.' });
                    continue;
                }

                try {
                    await db.run(
                        'INSERT INTO user_event_attendees (event_id, user_id, status, invited_by) VALUES (?, ?, ?, ?)',
                        eventId, userId, 'invited', hostId
                    );
                    results.push({ userId, status: 'invited', message: 'Invitation sent.' });
                } catch (error) {
                    console.error(`Error inviting user ${userId} to event ${eventId}:`, error);
                    results.push({ userId, status: 'failed', message: 'Failed to send invitation.' });
                }
            }
            return results;
        } catch (error) {
            console.error('Error in EventService.inviteUsersToEvent:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to invite users to event.', 500);
        }
    };

    const updateRsvpStatus = async (eventId, userId, status) => {
        try {
            // Check if the user is associated with the event as host or attendee
            const existingRsvp = await db.get('SELECT * FROM user_event_attendees WHERE event_id = ? AND user_id = ?', eventId, userId);
            const eventHost = await db.get('SELECT host_id FROM events WHERE id = ?', eventId);

            if (!existingRsvp && (!eventHost || eventHost.host_id !== userId)) {
                // If no existing RSVP and not the host trying to update their own implicit RSVP
                throw new CustomError('User not found in event attendees or is not the host.', 404);
            }

            let result;
            if (existingRsvp) {
                result = await db.run(
                    'UPDATE user_event_attendees SET status = ? WHERE event_id = ? AND user_id = ?',
                    status, eventId, userId
                );
            } else if (eventHost && eventHost.host_id === userId) {
                // If host is implicitly attending but not in user_event_attendees yet, add them
                result = await db.run(
                    'INSERT INTO user_event_attendees (event_id, user_id, status) VALUES (?, ?, ?)',
                    eventId, userId, status
                );
            } else {
                return false; // Should not happen given the checks above
            }
            return result.changes > 0;
        } catch (error) {
            console.error('Error in EventService.updateRsvpStatus:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to update RSVP status.', 500);
        }
    };

    const addOrUpdateAttendee = async (eventId, targetUserId, status) => {
        try {
            const result = await db.run(
                'INSERT INTO user_event_attendees (event_id, user_id, status) VALUES (?, ?, ?) ON CONFLICT(event_id, user_id) DO UPDATE SET status = EXCLUDED.status',
                eventId, targetUserId, status
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in EventService.addOrUpdateAttendee:', error);
            throw new CustomError('Failed to add or update attendee.', 500);
        }
    };

    const removeAttendee = async (eventId, userId) => {
        try {
            const result = await db.run('DELETE FROM user_event_attendees WHERE event_id = ? AND user_id = ?', eventId, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in EventService.removeAttendee:', error);
            throw new CustomError('Failed to remove attendee.', 500);
        }
    };

    return {
        createEvent,
        getEventsForUser,
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