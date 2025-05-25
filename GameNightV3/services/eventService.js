// server/services/eventService.js

const eventService = (db) => {

    // --- Event CRUD Operations ---

    const createEvent = async (eventId, title, description, event_date, event_time, location, hostId, hostUsername, max_players, game_id, game_title) => {
        await db.run(
            `INSERT INTO events (id, title, description, event_date, event_time, location, host_id, host_username, max_players, game_id, game_title)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [eventId, title, description, event_date, event_time, location, hostId, hostUsername, max_players, game_id, game_title]
        );
        return { eventId };
    };

    const findEventById = async (eventId) => {
        return await db.get(`
            SELECT
                e.id AS event_id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.host_id,
                e.host_username,
                e.max_players,
                e.game_id,
                e.game_title,
                e.status,
                e.created_at
            FROM
                events e
            WHERE
                e.id = ?
        `, [eventId]);
    };

    const getMyEvents = async (userId) => {
        // This query fetches events where the user is either the host or an attendee.
        // It also includes their attendee status if they are an attendee.
        return await db.all(`
            SELECT
                e.id AS event_id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.max_players,
                e.game_id,
                e.game_title,
                e.status,
                u.username AS host_username,
                e.host_id,
                CASE
                    WHEN e.host_id = ? THEN 'host'
                    ELSE 'attendee'
                    END AS user_role,
                COALESCE(ua.status, 'not_attending') AS attendee_status
            FROM
                events e
                    LEFT JOIN
                users u ON e.host_id = u.id
                    LEFT JOIN
                user_event_attendees ua ON e.id = ua.event_id AND ua.user_id = ?
            WHERE
                e.host_id = ? OR ua.user_id = ?
            ORDER BY
                e.event_date ASC, e.event_time ASC;
        `, [userId, userId, userId, userId]);
    };

    const getAllEvents = async (filterUserId, filterStatus) => {
        let query = `
            SELECT
                e.id AS event_id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.host_id,
                e.host_username,
                e.max_players,
                e.game_id,
                e.game_title,
                e.status,
                e.created_at
            FROM
                events e
        `;
        const params = [];
        const conditions = [];

        if (filterUserId) {
            conditions.push(`e.host_id = ?`);
            params.push(filterUserId);
        }
        if (filterStatus) {
            conditions.push(`e.status = ?`);
            params.push(filterStatus);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY e.event_date DESC, e.event_time DESC;`;

        return await db.all(query, params);
    };

    const updateEvent = async (eventId, hostId, title, description, event_date, event_time, location, max_players, game_id, game_title, status) => {
        const result = await db.run(
            `UPDATE events SET
                               title = ?,
                               description = ?,
                               event_date = ?,
                               event_time = ?,
                               location = ?,
                               max_players = ?,
                               game_id = ?,
                               game_title = ?,
                               status = ?
             WHERE id = ? AND host_id = ?`, // Added host_id to WHERE clause for security/ownership
            [title, description, event_date, event_time, location, max_players, game_id, game_title, status, eventId, hostId]
        );
        return result.changes > 0;
    };

    const deleteEvent = async (eventId, hostId) => {
        // First delete associated attendees
        await db.run(`DELETE FROM user_event_attendees WHERE event_id = ?`, [eventId]);
        // Then delete the event itself
        const result = await db.run('DELETE FROM events WHERE id = ? AND host_id = ?', [eventId, hostId]);
        return result.changes > 0;
    };

    // --- Attendee Management ---

    const getAttendeesForEvent = async (eventId) => {
        return await db.all(`
            SELECT u.id AS user_id, u.username, u.profilePictureUrl, ea.status
            FROM user_event_attendees ea
                     JOIN users u ON ea.user_id = u.id
            WHERE ea.event_id = ?
        `, [eventId]);
    };

    const findAttendeeStatus = async (eventId, userId) => {
        return await db.get(
            `SELECT id, status FROM user_event_attendees WHERE event_id = ? AND user_id = ?`,
            [eventId, userId]
        );
    };

    const addAttendee = async (attendeeEntryId, eventId, userId, status) => {
        const sql = `INSERT INTO user_event_attendees (id, event_id, user_id, status, responded_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;
        const params = [attendeeEntryId, eventId, userId, status];

        console.log(`[DEBUG - eventService.addAttendee] SQL: ${sql}`);
        console.log(`[DEBUG - eventService.addAttendee] Params: ${JSON.stringify(params)}`);

        try {
            await db.run(sql, params);
            console.log(`[DEBUG - eventService.addAttendee] Successfully added attendee ${userId} to event ${eventId}.`);
            return true;
        } catch (error) {
            console.error(`[ERROR - eventService.addAttendee] Failed to add attendee ${userId} to event ${eventId}. SQL error:`, error);
            throw error; // Re-throw the error so it propagates
        }
    };

    const updateAttendeeStatus = async (attendeeEntryId, newStatus) => {
        const sql = `UPDATE user_event_attendees SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const params = [newStatus, attendeeEntryId];

        console.log(`[DEBUG - eventService.updateAttendeeStatus] SQL: ${sql}`);
        console.log(`[DEBUG - eventService.updateAttendeeStatus] Params: ${JSON.stringify(params)}`);

        try {
            const result = await db.run(sql, params);
            console.log(`[DEBUG - eventService.updateAttendeeStatus] Changes: ${result.changes}`);
            return result.changes > 0;
        } catch (error) {
            console.error(`[ERROR - eventService.updateAttendeeStatus] Failed to update attendee status for entry ${attendeeEntryId}. SQL error:`, error);
            throw error;
        }
    };

    const removeAttendee = async (eventId, userIdToDelete, currentUserId, eventHostId) => {
        // This check is for authorization, making sure the user has permission to delete.
        // It's already in the controller, but adding it here for robustness if service was called directly.
        // However, it's typically best to keep authorization checks primarily in the controller.
        // For the service, we only care about the action.
        const result = await db.run(
            `DELETE FROM user_event_attendees WHERE event_id = ? AND user_id = ?`,
            [eventId, userIdToDelete]
        );
        return result.changes > 0;
    };


    return {
        createEvent,
        findEventById,
        getMyEvents,
        getAllEvents,
        updateEvent,
        deleteEvent,
        getAttendeesForEvent,
        findAttendeeStatus,
        addAttendee,
        updateAttendeeStatus,
        removeAttendee
    };
};

export default eventService;