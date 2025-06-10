import { v4 as uuidv4 } from 'uuid'; // Imported here for potential use within controller, but also passed through
import jwt from 'jsonwebtoken'; // Not explicitly used here, but good to have if needed for decode or verify

// Export a function that accepts 'userService' and 'upload'
console.log('>>> USERCONTROLLER.JS: FILE LOADED');
export default (userService, upload) => { // Correctly accepts 'upload'
    console.log('[DEBUG-USER-CONTROLLER] userControllerFactory received:');
    console.log('[DEBUG-USER-CONTROLLER]   userService:', !!userService);
    console.log('[DEBUG-USER-CONTROLLER]   upload:', !!upload); // Check if upload is received here

    const getCurrentUserProfile = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userProfile = await userService.getUserProfile(userId);
            if (!userProfile) {
                return res.status(404).json({ message: 'User profile not found.' });
            }
            res.status(200).json(userProfile);
        } catch (error) {
            console.error('Error in getCurrentUserProfile:', error);
            next(error);
        }
    };

    const updateUserProfile = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { firstName, lastName, favoriteGames, bio } = req.body;

            const updates = {};
            if (firstName !== undefined) updates.firstName = firstName;
            if (lastName !== undefined) updates.lastName = lastName;
            if (favoriteGames !== undefined) updates.favoriteGames = favoriteGames;
            if (bio !== undefined) updates.bio = bio;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ message: 'No profile data provided for update.' });
            }

            const updated = await userService.updateUserProfile(userId, updates);

            if (updated) {
                res.status(200).json({ message: 'Profile updated successfully!', ...updates });
            } else {
                const userExists = await userService.getUserProfile(userId);
                if (!userExists) {
                    return res.status(404).json({ message: 'User not found.' });
                }
                res.status(200).json({ message: 'No changes detected or applied to profile.' });
            }
        } catch (error) {
            console.error('Error in updateUserProfile:', error);
            next(error);
        }
    };

    const updateMadLibStory = async (req, res, next) => {
        try {
            const { madLibStory } = req.body;
            const userId = req.user.id;

            await userService.updateMadLibStory(userId, madLibStory);
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

            const updated = await userService.updateSocialMediaLinks(userId, socialMediaLinks);
            if (updated === null) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json({ message: 'Social media links updated successfully!' });
        } catch (error) {
            console.error('Error in updateSocialMediaLinks:', error);
            next(error);
        }
    };

    const uploadProfilePicture = async (req, res, next) => {
        console.log('[DEBUG-USER-CONTROLLER] inside uploadProfilePicture');
        console.log('[DEBUG-USER-CONTROLLER] req.file:', req.file);
        try {
            // `req.file` is made available by multer middleware (upload.single('profilePicture'))
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

            await userService.changeUsername(userId, newUsername, currentPassword);
            res.status(200).json({ message: 'Username updated successfully! You might need to re-login for changes to fully apply.' });
        } catch (error) {
            console.error('Error in changeUsername:', error);
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error);
        }
    };

    const changePassword = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // saltRounds should be handled by the service, not passed from controller
            await userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ message: 'Password updated successfully!' });
        } catch (error) {
            console.error('Error in changePassword:', error);
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
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

            const newComment = await userService.postProfileComment(profileOwnerId, commenterId, content);
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

            const commentToDelete = await userService.getProfileComment(commentId);
            if (!commentToDelete) {
                return res.status(404).json({ message: 'Comment not found.' });
            }

            if (requestingUserId !== commentToDelete.commenter_id && requestingUserId !== commentToDelete.profile_owner_id) {
                return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
            }

            await userService.deleteProfileComment(commentId, requestingUserId);
            res.status(200).json({ message: 'Comment deleted successfully.' });
        } catch (error) {
            console.error('Error in deleteProfileComment:', error);
            next(error);
        }
    };

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

            // uuidv4 should be generated within the service if new availability records are created
            await userService.updateAvailability(userId, availableDates);
            res.status(200).json({ message: 'Availability updated successfully.' });
        } catch (error) {
            console.error('Error in updateAvailability:', error);
            next(error);
        }
    };

    return {
        getCurrentUserProfile,
        updateUserProfile,
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