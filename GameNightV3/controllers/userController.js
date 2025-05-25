// server/controllers/userController.js
import { saltRounds } from '../config/config.js'; // Import saltRounds

// Export a function that accepts 'userService' and 'sanitizer'
export default (userService, sanitizer) => {

    const getCurrentUserProfile = async (req, res, next) => {
        try {
            const userId = req.user.id; // From authenticateToken middleware
            const userProfile = await userService.getUserProfile(userId);
            if (!userProfile) {
                return res.status(404).json({ message: 'User profile not found.' });
            }
            res.status(200).json(userProfile);
        } catch (error) {
            console.error('Error in getCurrentUserProfile:', error);
            next(error); // Pass error to global error handler
        }
    };

    const updateBio = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { bio } = req.body;

            // Validation (moved from service to controller, or could be separate middleware)
            const bioToValidate = (bio === undefined || bio === null || (typeof bio === 'string' && bio.trim() === ''))
                ? null
                : bio.trim();

            if (bioToValidate !== null && bioToValidate.length > 500) {
                return res.status(400).json({ message: 'Bio cannot exceed 500 characters.' });
            }

            const updatedBio = await userService.updateBio(userId, bioToValidate);
            if (updatedBio === null) {
                return res.status(404).json({ message: 'User not found or no changes made.' });
            }
            res.status(200).json({ message: 'Profile updated successfully!', bio: updatedBio });
        } catch (error) {
            console.error('Error in updateBio:', error);
            next(error);
        }
    };

    const updateMadLibStory = async (req, res, next) => {
        try {
            const { madLibStory } = req.body;
            const userId = req.user.id;

            if (madLibStory === undefined || typeof madLibStory !== 'string') {
                return res.status(400).json({ message: 'Mad Lib story content is required and must be a string.' });
            }
            // Basic sanitization/trimming can happen here before passing to service
            const storyToSave = madLibStory.trim() === '' ? null : madLibStory;

            await userService.updateMadLibStory(userId, storyToSave);
            res.status(200).json({ message: 'Mad Lib story posted to profile successfully!' });
        } catch (error) {
            console.error('Error in updateMadLibStory:', error);
            next(error);
        }
    };

    const updateSocialMediaLinks = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { socialMediaLinks } = req.body;

            if (!Array.isArray(socialMediaLinks)) {
                return res.status(400).json({ message: "socialMediaLinks must be an array." });
            }

            const allowedPlatforms = ['twitch', 'youtube', 'twitter', 'instagram', 'discord', 'website', 'other'];
            for (const link of socialMediaLinks) {
                if (!link.platform || typeof link.platform !== 'string' || !link.url || typeof link.url !== 'string') {
                    return res.status(400).json({ message: 'Each social media link must have a valid platform and url.' });
                }
                if (!/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})?$/.test(link.url)) {
                    return res.status(400).json({ message: `Invalid URL for platform "${link.platform}": "${link.url}"` });
                }
                if (!allowedPlatforms.includes(link.platform.toLowerCase())) {
                    return res.status(400).json({ message: `Platform "${link.platform}" is not recognized.` });
                }
            }

            const updated = await userService.updateSocialMediaLinks(userId, socialMediaLinks);
            if (updated === null) {
                return res.status(404).json({ message: 'User not found or no changes were made.' });
            }
            res.status(200).json({ message: 'Social media links updated successfully!' });
        } catch (error) {
            console.error('Error in updateSocialMediaLinks:', error);
            next(error);
        }
    };

    const uploadProfilePicture = async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            const userId = req.user.id;
            const profilePictureUrl = `/uploads/${req.file.filename}`;

            await userService.updateProfilePicture(userId, profilePictureUrl);
            res.status(200).json({ message: 'Profile picture updated successfully!', profilePictureUrl: profilePictureUrl });
        } catch (error) {
            console.error('Error in uploadProfilePicture:', error);
            next(error);
        }
    };

    const changeUsername = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { newUsername, currentPassword } = req.body;

            // Validation
            if (!newUsername || typeof newUsername !== 'string' || newUsername.trim() === '') {
                return res.status(400).json({ message: 'New username cannot be empty.' });
            }
            if (newUsername.toLowerCase() === req.user.username.toLowerCase()) {
                return res.status(400).json({ message: 'New username is the same as your current username.' });
            }
            if (!currentPassword || typeof currentPassword !== 'string') {
                return res.status(400).json({ message: 'Current password is required for verification.' });
            }
            const trimmedNewUsername = newUsername.trim();
            if (trimmedNewUsername.length < 3 || trimmedNewUsername.length > 20) {
                return res.status(400).json({ message: 'Username must be between 3 and 20 characters.' });
            }
            if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedNewUsername)) {
                return res.status(400).json({ message: 'Username can only contain letters, numbers, underscores, hyphens, and periods.' });
            }

            await userService.changeUsername(userId, trimmedNewUsername, currentPassword);
            res.status(200).json({ message: 'Username updated successfully! You might need to re-login for changes to fully apply.' });
        } catch (error) {
            console.error('Error in changeUsername:', error);
            // Specific error messages from service can be caught and mapped here if needed
            if (error.message === 'User not found.' || error.message === 'Invalid current password. Please try again.' || error.message === 'This username is already taken. Please choose another.') {
                return res.status(400).json({ message: error.message }); // Send specific message
            }
            next(error);
        }
    };

    const changePassword = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
                return res.status(400).json({ message: 'Current password and new password are required.' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
            }
            if (currentPassword === newPassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
            }

            await userService.changePassword(userId, currentPassword, newPassword, saltRounds); // Pass saltRounds
            res.status(200).json({ message: 'Password updated successfully!' });
        } catch (error) {
            console.error('Error in changePassword:', error);
            if (error.message === 'User not found.' || error.message === 'Invalid current password. Please try again.') {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    };

    const searchUsers = async (req, res, next) => {
        try {
            const searchTerm = req.query.term;
            if (!searchTerm) {
                return res.status(400).json({ message: 'Search term is required.' });
            }
            const users = await userService.searchUsers(searchTerm, req.user.id);
            res.status(200).json(users);
        } catch (error) {
            console.error('Error in searchUsers:', error);
            next(error);
        }
    };

    const getPublicProfileByUsername = async (req, res, next) => {
        try {
            const { username } = req.params;
            const publicProfile = await userService.getPublicProfileByUsername(username);

            if (!publicProfile) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json(publicProfile);
        } catch (error) {
            console.error(`Error in getPublicProfileByUsername for ${req.params.username}:`, error);
            next(error);
        }
    };

    const postProfileComment = async (req, res, next) => {
        try {
            const profileOwnerId = req.params.profileOwnerId;
            const commenterId = req.user.id;
            const { content } = req.body;

            if (!content || typeof content !== 'string' || content.trim() === '') {
                return res.status(400).json({ message: 'Comment content cannot be empty.' });
            }
            if (content.length > 500) {
                return res.status(400).json({ message: 'Comment content exceeds maximum length of 500 characters.' });
            }
            if (profileOwnerId === commenterId) {
                return res.status(400).json({ message: 'You cannot comment on your own profile.' });
            }

            // Sanitize content using the passed sanitizer
            const sanitizedContent = sanitizer.sanitize(content.trim(), { USE_PROFILES: { html: false } });
            if (sanitizedContent.trim() === '') {
                return res.status(400).json({ message: 'Comment content was invalid or contained only disallowed characters.' });
            }

            const newComment = await userService.postProfileComment(profileOwnerId, commenterId, sanitizedContent);
            res.status(201).json({ message: 'Comment posted successfully!', comment: newComment });
        } catch (error) {
            console.error('Error in postProfileComment:', error);
            next(error);
        }
    };

    const getProfileComments = async (req, res, next) => {
        try {
            const profileOwnerId = req.params.profileOwnerId;
            const comments = await userService.getProfileComments(profileOwnerId);
            res.status(200).json(comments);
        } catch (error) {
            console.error('Error in getProfileComments:', error);
            next(error);
        }
    };

    const deleteProfileComment = async (req, res, next) => {
        try {
            const commentId = req.params.commentId;
            const requestingUserId = req.user.id;

            const commentToDelete = await userService.getProfileComment(commentId); // Need a get single comment service method first, or pass necessary data
            if (!commentToDelete) {
                return res.status(404).json({ message: 'Comment not found.' });
            }

            // Authorization check
            if (requestingUserId !== commentToDelete.commenter_id && requestingUserId !== commentToDelete.profile_owner_id) {
                return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
            }

            await userService.deleteProfileComment(commentId, requestingUserId); // Pass requestingUserId for potential extra check in service
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } catch (error) {
            console.error('Error in deleteProfileComment:', error);
            next(error);
        }
    };

    // NOTE: For deleteProfileComment to work correctly, you'll need a new
    //       service method in userService.js like `getProfileComment(commentId)`
    //       that fetches the comment details (commenter_id, profile_owner_id).
    //       Or, the service method `deleteProfileComment` needs to do the check itself.
    //       For now, I've left the check in the controller, assuming you'll add the service method.
    //       Alternatively, you could pass enough info to the service from the controller.

    const getUserAvailability = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const availableDates = await userService.getUserAvailability(userId);
            res.json({ availableDates });
        } catch (error) {
            console.error('Error in getUserAvailability:', error);
            next(error);
        }
    };

    const updateAvailability = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { availableDates } = req.body;

            if (!Array.isArray(availableDates)) {
                return res.status(400).json({ message: 'Invalid data format. Expected an array of dates.' });
            }

            // Pass uuidv4 from main server.js as it's a utility for generating IDs
            await userService.updateAvailability(userId, availableDates, req.uuidv4); // Assuming you'll attach uuidv4 to req in server.js
            res.status(200).json({ message: 'Availability updated successfully.' });
        } catch (error) {
            console.error('Error in updateAvailability:', error);
            next(error);
        }
    };

    return {
        getCurrentUserProfile,
        updateBio,
        updateMadLibStory,
        updateSocialMediaLinks,
        uploadProfilePicture,
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