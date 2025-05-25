// server/services/userService.js
import bcrypt from 'bcrypt';

const userService = (db) => {

    // Helper to normalize social media links
    const parseSocialMediaLinks = (linksJson) => {
        try {
            return linksJson ? JSON.parse(linksJson) : [];
        } catch (error) {
            console.error('Error parsing social media links:', error);
            return [];
        }
    };

    const getUserProfile = async (userId) => {
        const user = await db.get(
            `SELECT id, username, firstName, lastName, favoriteGames, profilePictureUrl, bio, isAdmin, madLibStory, socialMediaLinks FROM users WHERE id = ?`,
            userId
        );
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            favoriteGames: user.favoriteGames,
            profilePictureUrl: user.profilePictureUrl,
            bio: user.bio,
            isAdmin: user.isAdmin === 1,
            madLibStory: user.madLibStory,
            socialMediaLinks: parseSocialMediaLinks(user.socialMediaLinks)
        };
    };

    const updateBio = async (userId, bio) => {
        // Normalize bio to null if it's an empty string or explicitly null/undefined
        const bioToSave = (bio === undefined || bio === null || (typeof bio === 'string' && bio.trim() === ''))
            ? null
            : bio.trim();

        // Now validate the length only if it's a string (i.e., not null)
        if (bioToSave !== null && bioToSave.length > 500) {
            throw new Error('Bio cannot exceed 500 characters.'); // This should ideally be caught by validation middleware
        }

        const result = await db.run(
            `UPDATE users SET bio = ? WHERE id = ?`,
            [bioToSave, userId]
        );
        if (result.changes === 0) {
            return null; // User not found or no changes made
        }
        return bioToSave;
    };

    const updateMadLibStory = async (userId, madLibStory) => {
        if (madLibStory === undefined || typeof madLibStory !== 'string') {
            throw new Error('Mad Lib story content is required and must be a string.');
        }
        const storyToSave = madLibStory.trim() === '' ? null : madLibStory;
        await db.run(
            `UPDATE users SET madLibStory = ? WHERE id = ?`,
            [storyToSave, userId]
        );
        return true;
    };

    const updateSocialMediaLinks = async (userId, socialMediaLinks) => {
        // Validation of links will happen in the controller or a dedicated validator
        const socialMediaLinksJson = JSON.stringify(socialMediaLinks);
        const result = await db.run(
            'UPDATE users SET socialMediaLinks = ? WHERE id = ?',
            [socialMediaLinksJson, userId]
        );
        if (result.changes === 0) {
            return null; // User not found or no changes made
        }
        return true;
    };

    const updateProfilePicture = async (userId, profilePictureUrl) => {
        await db.run('UPDATE users SET profilePictureUrl = ? WHERE id = ?', [profilePictureUrl, userId]);
        return true;
    };

    const changeUsername = async (userId, newUsername, currentPassword) => {
        const trimmedNewUsername = newUsername.trim();

        const user = await db.get('SELECT username, password FROM users WHERE id = ?', [userId]);
        if (!user) {
            throw new Error('User not found.');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid current password. Please try again.');
        }

        const existingUsername = await db.get('SELECT id FROM users WHERE username = ?', [trimmedNewUsername]);
        if (existingUsername && existingUsername.id !== userId) {
            throw new Error('This username is already taken. Please choose another.');
        }

        await db.run('UPDATE users SET username = ? WHERE id = ?', [trimmedNewUsername, userId]);
        return true;
    };

    const changePassword = async (userId, currentPassword, newPassword, saltRounds) => {
        const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
        if (!user) {
            throw new Error('User not found.');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Invalid current password. Please try again.');
        }

        if (currentPassword === newPassword) {
            throw new Error('New password cannot be the same as the old password.');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);
        return true;
    };

    const searchUsers = async (searchTerm, currentUserId) => {
        const users = await db.all(
            `SELECT id, username, firstName, lastName, profilePictureUrl FROM users WHERE username LIKE ? AND id != ?`,
            [`%${searchTerm}%`, currentUserId]
        );
        return users;
    };

    const getPublicProfileByUsername = async (username) => {
        const user = await db.get(`
            SELECT
                id,
                username,
                firstName,
                lastName,
                favoriteGames,
                profilePictureUrl,
                bio,
                isAdmin,
                madLibStory,
                socialMediaLinks
            FROM
                users
            WHERE
                username = ?
        `, [username]);

        if (!user) {
            return null;
        }

        const parsedSocialMediaLinks = parseSocialMediaLinks(user.socialMediaLinks);
        const games = await db.all(`
            SELECT game_title, notes, status
            FROM user_games
            WHERE user_id = ?
        `, [user.id]);
        const hostedEvents = await db.all(`
            SELECT id AS event_id, title AS event_name
            FROM events
            WHERE host_id = ?
        `, [user.id]);

        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            favoriteGames: user.favoriteGames,
            profilePictureUrl: user.profilePictureUrl,
            bio: user.bio,
            isAdmin: user.isAdmin === 1,
            madLibStory: user.madLibStory,
            socialMediaLinks: parsedSocialMediaLinks,
            games: games,
            hostedEvents: hostedEvents
        };
    };

    const postProfileComment = async (profileOwnerId, commenterId, content) => {
        // Validation of content and ownership will happen in the controller
        const result = await db.run(
            'INSERT INTO profile_comments (profile_owner_id, commenter_id, content) VALUES (?, ?, ?)',
            [profileOwnerId, commenterId, content]
        );
        const newComment = await db.get('SELECT * FROM profile_comments WHERE id = ?', [result.lastID]);
        return newComment;
    };

    const getProfileComments = async (profileOwnerId) => {
        const comments = await db.all(
            `SELECT
                 pc.id,
                 pc.content,
                 pc.created_at,
                 u.id AS commenter_id,
                 u.username AS commenter_username,
                 u.profilePictureUrl AS commenter_profile_pic
             FROM profile_comments pc
                      JOIN users u ON pc.commenter_id = u.id
             WHERE pc.profile_owner_id = ?
             ORDER BY pc.created_at DESC`,
            [profileOwnerId]
        );
        return comments;
    };

    const deleteProfileComment = async (commentId, requestingUserId) => {
        const comment = await db.get(
            'SELECT commenter_id, profile_owner_id FROM profile_comments WHERE id = ?',
            [commentId]
        );
        if (!comment) {
            return null; // Comment not found
        }
        // Authorization check will happen in the controller
        await db.run('DELETE FROM profile_comments WHERE id = ?', [commentId]);
        return true;
    };

    const getUserAvailability = async (userId) => {
        const result = await db.all(
            'SELECT available_date FROM user_availability WHERE user_id = ? ORDER BY available_date ASC',
            [userId]
        );
        return result.map(row => row.available_date);
    };

    const updateAvailability = async (userId, availableDates, uuidv4) => {
        await db.run('DELETE FROM user_availability WHERE user_id = ?', [userId]);
        if (availableDates.length > 0) {
            const insertPromises = availableDates.map(dateString =>
                db.run(
                    'INSERT INTO user_availability (id, user_id, available_date) VALUES (?, ?, ?)',
                    [uuidv4(), userId, dateString]
                )
            );
            await Promise.all(insertPromises);
        }
        return true;
    };


    return {
        getUserProfile,
        updateBio,
        updateMadLibStory,
        updateSocialMediaLinks,
        updateProfilePicture,
        changeUsername,
        changePassword,
        searchUsers,
        getPublicProfileByUsername,
        postProfileComment,
        getProfileComments,
        deleteProfileComment,
        getUserAvailability,
        updateAvailability
    };
};

export default userService;