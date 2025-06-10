import bcrypt from 'bcrypt';
import CustomError from '../utils/CustomError.js';
import { v4 as uuidv4 } from 'uuid'; // ADD THIS LINE - uuidv4 was missing here for comment and availability functions

export default (db) => { // Accept db
    const getUserProfile = async (userId) => {
        try {
            const user = await db.get(
                `SELECT id, username, email, firstName, lastName, bio, profile_picture_url, mad_lib_story, social_media_links, isAdmin
                 FROM users WHERE id = ?`,
                userId
            );
            if (user && user.social_media_links) {
                user.social_media_links = JSON.parse(user.social_media_links);
            }
            return user;
        } catch (error) {
            console.error('Error in UserService.getUserProfile:', error);
            throw new CustomError('Failed to retrieve user profile.', 500);
        }
    };

    const updateUserProfile = async (userId, updates) => {
        try {
            const { firstName, lastName, favoriteGames, bio } = updates;

            const fields = [];
            const params = [];

            if (firstName !== undefined) {
                fields.push('firstName = ?');
                params.push(firstName);
            }
            if (lastName !== undefined) {
                fields.push('lastName = ?');
                params.push(lastName);
            }
            if (bio !== undefined) {
                fields.push('bio = ?');
                params.push(bio);
            }

            if (fields.length === 0) {
                return false; // No fields to update
            }

            params.push(userId);

            const result = await db.run(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                ...params
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in UserService.updateUserProfile:', error);
            throw new CustomError('Failed to update user profile.', 500);
        }
    };

    const updateMadLibStory = async (userId, madLibStory) => {
        try {
            const result = await db.run('UPDATE users SET mad_lib_story = ? WHERE id = ?', madLibStory, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in UserService.updateMadLibStory:', error);
            throw new CustomError('Failed to update Mad Lib story.', 500);
        }
    };

    const updateSocialMediaLinks = async (userId, socialMediaLinks) => {
        try {
            // Convert the object to a JSON string
            const linksJson = JSON.stringify(socialMediaLinks);
            const result = await db.run('UPDATE users SET social_media_links = ? WHERE id = ?', linksJson, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in UserService.updateSocialMediaLinks:', error);
            throw new CustomError('Failed to update social media links.', 500);
        }
    };

    const updateProfilePicture = async (userId, profilePictureUrl) => {
        try {
            const result = await db.run('UPDATE users SET profile_picture_url = ? WHERE id = ?', profilePictureUrl, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in UserService.updateProfilePicture:', error);
            throw new CustomError('Failed to update profile picture.', 500);
        }
    };

    const changeUsername = async (userId, newUsername, currentPassword) => {
        try {
            const user = await db.get('SELECT password FROM users WHERE id = ?', userId);
            if (!user) {
                throw new CustomError('User not found.', 400);
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                throw new CustomError('Invalid current password. Please try again.', 400);
            }

            const existingUser = await db.get('SELECT id FROM users WHERE username = ? AND id != ?', newUsername, userId);
            if (existingUser) {
                throw new CustomError('This username is already taken. Please choose another.', 400);
            }

            await db.run('UPDATE users SET username = ? WHERE id = ?', newUsername, userId);
            return true;
        } catch (error) {
            console.error('Error in UserService.changeUsername:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to change username.', 500);
        }
    };

    const changePassword = async (userId, currentPassword, newPassword) => { // Removed saltRounds here, should be generated within bcrypt.hash
        try {
            const user = await db.get('SELECT password FROM users WHERE id = ?', userId);
            if (!user) {
                throw new CustomError('User not found.', 400);
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                throw new CustomError('Invalid current password. Please try again.', 400);
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Use a standard saltRounds value like 10
            await db.run('UPDATE users SET password = ? WHERE id = ?', hashedNewPassword, userId);
            return true;
        } catch (error) {
            console.error('Error in UserService.changePassword:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to change password.', 500);
        }
    };

    const searchUsers = async (searchTerm, currentUserId) => {
        try {
            // Search by username or parts of first/last name
            const users = await db.all(
                `SELECT id, username, firstName, lastName, profile_picture_url
                 FROM users
                 WHERE (username LIKE ? OR firstName LIKE ? OR lastName LIKE ?) AND id != ?
                 LIMIT 20`,
                `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, currentUserId
            );
            return users;
        } catch (error) {
            console.error('Error in UserService.searchUsers:', error);
            throw new CustomError('Failed to search users.', 500);
        }
    };

    const getPublicProfileByUsername = async (username) => {
        try {
            const user = await db.get(
                `SELECT id, username, firstName, lastName, bio, profile_picture_url, mad_lib_story, social_media_links
                 FROM users WHERE username = ?`,
                username
            );
            if (user && user.social_media_links) {
                user.social_media_links = JSON.parse(user.social_media_links);
            }
            return user;
        } catch (error) {
            console.error('Error in UserService.getPublicProfileByUsername:', error);
            throw new CustomError('Failed to retrieve public profile.', 500);
        }
    };

    const postProfileComment = async (profileOwnerId, commenterId, content) => {
        try {
            const commentId = uuidv4();
            await db.run(
                'INSERT INTO profile_comments (id, profile_owner_id, commenter_id, content) VALUES (?, ?, ?, ?)',
                commentId, profileOwnerId, commenterId, content
            );
            return { id: commentId, profile_owner_id: profileOwnerId, commenter_id: commenterId, content, created_at: new Date().toISOString() };
        } catch (error) {
            console.error('Error in UserService.postProfileComment:', error);
            throw new CustomError('Failed to post comment.', 500);
        }
    };

    const getProfileComments = async (profileOwnerId) => {
        try {
            const comments = await db.all(
                `SELECT pc.id, pc.profile_owner_id, pc.commenter_id, u.username AS commenter_username, u.profile_picture_url, pc.content, pc.created_at
                 FROM profile_comments pc
                          JOIN users u ON pc.commenter_id = u.id
                 WHERE pc.profile_owner_id = ?
                 ORDER BY pc.created_at DESC`,
                profileOwnerId
            );
            return comments;
        } catch (error) {
            console.error('Error in UserService.getProfileComments:', error);
            throw new CustomError('Failed to retrieve profile comments.', 500);
        }
    };

    const getProfileComment = async (commentId) => { // This is the function for a single comment
        try {
            return await db.get(
                `SELECT id, profile_owner_id, commenter_id, content FROM profile_comments WHERE id = ?`,
                commentId
            );
        } catch (error) {
            console.error('Error in UserService.getProfileComment:', error);
            throw new CustomError('Failed to retrieve comment.', 500);
        }
    };

    const deleteProfileComment = async (commentId, requestingUserId) => {
        try {
            const result = await db.run(
                `DELETE FROM profile_comments WHERE id = ? AND (profile_owner_id = ? OR commenter_id = ?)`,
                commentId, requestingUserId, requestingUserId
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in UserService.deleteProfileComment:', error);
            throw new CustomError('Failed to delete comment.', 500);
        }
    };

    const getUserAvailability = async (userId) => {
        try {
            const availability = await db.all(
                'SELECT available_date, start_time, end_time, notes FROM user_availability WHERE user_id = ? ORDER BY available_date ASC',
                userId
            );
            return availability;
        }
        catch (error) {
            console.error('Error in UserService.getUserAvailability:', error);
            throw new CustomError('Failed to retrieve user availability.', 500);
        }
    };

    const updateAvailability = async (userId, availableDates) => {
        try {
            await db.run('BEGIN TRANSACTION');
            await db.run('DELETE FROM user_availability WHERE user_id = ?', userId);

            for (const entry of availableDates) {
                const { date, startTime, endTime, notes } = entry;
                const availabilityId = uuidv4();

                await db.run(
                    'INSERT INTO user_availability (id, user_id, available_date, start_time, end_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
                    availabilityId, userId, date, startTime, endTime, notes
                );
            }
            await db.run('COMMIT');
            return true;
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error in UserService.updateAvailability:', error);
            throw new CustomError('Failed to update availability.', 500);
        }
    };

    return {
        getUserProfile,
        updateUserProfile,
        updateMadLibStory,
        updateSocialMediaLinks,
        updateProfilePicture, // <-- CHANGED FROM uploadProfilePicture
        changeUsername,
        changePassword,
        searchUsers,
        getPublicProfileByUsername,
        postProfileComment,
        getProfileComments,
        getProfileComment, // <-- KEEP THIS ONE FOR SINGLE COMMENT RETRIEVAL
        deleteProfileComment,
        getUserAvailability,
        updateAvailability
    };
};