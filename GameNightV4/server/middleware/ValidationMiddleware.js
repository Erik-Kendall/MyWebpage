import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    // Log validation errors (will integrate with Winston later)
    console.warn('Validation Errors:', JSON.stringify(extractedErrors));

    return res.status(422).json({
        message: 'Validation failed. Please check your input.',
        errors: extractedErrors,
    });
};

// --- Reusable Validation Chains ---

// Auth Validations
export const registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required.')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only contain letters, numbers, underscores, hyphens, and periods.'),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    body('isAdmin').optional().isBoolean().withMessage('isAdmin must be a boolean.').toBoolean(),
];

export const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

// User Profile Validations
export const updateUserProfileValidation = [
    body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters.'),
    body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters.'),
    // favoriteGames can be an array of strings, ensure it's a valid JSON string if stored as such, or an array if DB allows ARRAY type
    // For now, assuming it's a stringified JSON array or directly handled by the service, so just check type/length
    body('favoriteGames').optional().isArray().withMessage('Favorite games must be an array.').customSanitizer(value => {
        // Simple sanitization: trim each string in the array
        if (Array.isArray(value)) {
            return value.map(item => typeof item === 'string' ? item.trim() : item);
        }
        return value;
    }),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters.')
        .customSanitizer(value => value === '' ? null : value), // Convert empty string to null
];

export const updateMadLibStoryValidation = [
    body('madLibStory').notEmpty().withMessage('Mad Lib story content is required.')
        .isString().withMessage('Mad Lib story must be a string.')
        .isLength({ max: 1000 }).withMessage('Mad Lib story cannot exceed 1000 characters.')
        .trim().customSanitizer(value => value === '' ? null : value),
];

export const updateSocialMediaLinksValidation = [
    body('socialMediaLinks').isArray().withMessage('Social media links must be an array.')
        .custom((links) => {
            const allowedPlatforms = ['twitch', 'youtube', 'twitter', 'instagram', 'discord', 'website', 'other'];
            for (const link of links) {
                if (typeof link !== 'object' || !link.platform || !link.url) {
                    throw new Error('Each social media link must have a platform and url.');
                }
                if (!allowedPlatforms.includes(link.platform.toLowerCase())) {
                    throw new Error(`Platform "${link.platform}" is not recognized.`);
                }
                if (!/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})?$/.test(link.url)) {
                    throw new Error(`Invalid URL for platform "${link.platform}": "${link.url}"`);
                }
            }
            return true;
        }),
    // Sanitize URLs to prevent XSS if they were ever directly rendered without proper React escaping
    // This is a basic example; for full URL sanitization, consider a dedicated URL sanitizer.
    body('socialMediaLinks.*.url').trim().escape(),
    body('socialMediaLinks.*.platform').trim().toLowerCase(),
];

export const changeUsernameValidation = [
    body('newUsername')
        .trim()
        .notEmpty().withMessage('New username cannot be empty.')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only contain letters, numbers, underscores, hyphens, and periods.'),
    body('currentPassword').notEmpty().withMessage('Current password is required for verification.'),
];

export const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
        .notEmpty().withMessage('New password is required.')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password cannot be the same as the old password.');
            }
            return true;
        }),
];

export const postProfileCommentValidation = [
    param('profileOwnerId').isUUID().withMessage('Invalid profile owner ID format.'),
    body('content')
        .trim()
        .notEmpty().withMessage('Comment content cannot be empty.')
        .isLength({ max: 500 }).withMessage('Comment content exceeds maximum length of 500 characters.')
        .escape(), // Escape HTML entities to prevent XSS on display
];

export const deleteProfileCommentValidation = [
    param('commentId').isUUID().withMessage('Invalid comment ID format.'),
];

export const updateAvailabilityValidation = [
    body('availableDates').isArray().withMessage('Availability must be an array of dates.')
        .custom((dates) => {
            for (const date of dates) {
                // Example: 'YYYY-MM-DD' format and is a valid date
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date))) {
                    throw new Error('Each date must be in YYYY-MM-DD format and a valid date.');
                }
            }
            return true;
        }),
];

// Game Validations
export const addOrUpdateGameValidation = [
    body('game_title')
        .trim()
        .notEmpty().withMessage('Game title is required.')
        .isLength({ min: 1, max: 100 }).withMessage('Game title must be between 1 and 100 characters.'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required.')
        .isIn(['Playing', 'Completed', 'Dropped', 'Backlog', 'Wishlist']).withMessage('Invalid game status.'),
];

// Event Validations
export const createEventValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required.')
        .isLength({ min: 1, max: 100 }).withMessage('Event title must be between 1 and 100 characters.'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('event_date')
        .notEmpty().withMessage('Event date is required.')
        .isISO8601().withMessage('Event date must be a valid date in YYYY-MM-DD format.')
        .toDate(), // Convert to Date object
    body('event_time')
        .notEmpty().withMessage('Event time is required.')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Event time must be in HH:MM 24-hour format.'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required.')
        .isLength({ min: 1, max: 200 }).withMessage('Location cannot exceed 200 characters.'),
    body('max_players').optional().isInt({ min: 1 }).withMessage('Max players must be a positive number.').toInt(),
    body('game_id').optional().isUUID().withMessage('Invalid game ID format.'),
    body('game_title').optional().trim().isLength({ max: 100 }).withMessage('Game title cannot exceed 100 characters.'),
];

export const updateEventValidation = [
    param('id').isUUID().withMessage('Invalid event ID format.'),
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Event title must be between 1 and 100 characters.'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
    body('event_date').optional().isISO8601().withMessage('Event date must be a valid date in YYYY-MM-DD format.').toDate(),
    body('event_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Event time must be in HH:MM 24-hour format.'),
    body('location').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Location cannot exceed 200 characters.'),
    body('max_players').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Max players must be a positive number.').toInt(),
    body('game_id').optional({ nullable: true }).isUUID().withMessage('Invalid game ID format.'),
    body('game_title').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Game title cannot exceed 100 characters.'),
    body('status').optional().isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid event status.'),
];

export const inviteUsersToEventValidation = [
    param('id').isUUID().withMessage('Invalid event ID format.'),
    body('invitedUserIds').isArray().withMessage('Invited user IDs must be an array.')
        .custom((ids) => {
            if (ids.length === 0) {
                throw new Error('At least one user ID is required.');
            }
            for (const id of ids) {
                if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
                    throw new Error('Each invited user ID must be a valid UUID.');
                }
            }
            return true;
        }),
];

export const rsvpStatusValidation = [
    param('id').isUUID().withMessage('Invalid event ID format.'),
    body('status').notEmpty().withMessage('RSVP status is required.')
        .isIn(['accepted', 'declined', 'invited', 'pending']).withMessage('Invalid RSVP status.'),
];

export const removeAttendeeValidation = [
    param('id').isUUID().withMessage('Invalid event ID format.'),
    param('userId').isUUID().withMessage('Invalid user ID format.'),
];

// Friend Validations
export const sendFriendRequestValidation = [
    body('recipientUsername')
        .trim()
        .notEmpty().withMessage('Recipient username is required.')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only contain letters, numbers, underscores, hyphens, and periods.'),
];

export const respondToFriendRequestValidation = [
    body('requesterId').isUUID().withMessage('Requester ID is required and must be a UUID.'),
    body('status')
        .notEmpty().withMessage('Status is required.')
        .isIn(['accepted', 'rejected']).withMessage('Status must be "accepted" or "rejected".'),
];

export const deleteFriendshipValidation = [
    param('id').isUUID().withMessage('Invalid friendship ID format.'),
];

// Admin Validations
export const adminUpdateUserValidation = [
    param('userId').isUUID().withMessage('Invalid user ID format.'),
    body('firstName').optional().trim().isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters.'),
    body('lastName').optional().trim().isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters.'),
    body('email').optional().isEmail().withMessage('Invalid email format.'),
    body('isAdmin').optional().isBoolean().withMessage('isAdmin must be a boolean.').toBoolean(),
    body('username')
        .optional().trim()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only contain letters, numbers, underscores, hyphens, and periods.'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters.')
        .customSanitizer(value => value === '' ? null : value),
    body('favoriteGames').optional().isArray().withMessage('Favorite games must be an array.'),
];

export const setUserAdminStatusValidation = [
    param('userId').isUUID().withMessage('Invalid user ID format.'),
    body('isAdmin').isBoolean().withMessage('isAdmin must be true or false.').toBoolean(),
];

export const adminAddMasterGameValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Game title is required.')
        .isLength({ min: 1, max: 100 }).withMessage('Game title must be between 1 and 100 characters.'),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL.').trim(),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
];

export const adminUpdateMasterGameValidation = [
    param('gameId').isUUID().withMessage('Invalid game ID format.'),
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Game title must be between 1 and 100 characters.'),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL.').trim(),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
];