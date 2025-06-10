console.log('>>> USERROUTES.JS: FILE LOADED');
import express from 'express';
// REMOVE THIS LINE: import userServiceFactory from '../services/userService.js'; // UserService is now passed as a parameter

import userControllerFactory from '../controllers/userController.js';
import {
    validate,
    updateUserProfileValidation,
    updateMadLibStoryValidation,
    updateSocialMediaLinksValidation,
    changeUsernameValidation,
    changePasswordValidation,
    postProfileCommentValidation,
    deleteProfileCommentValidation,
    updateAvailabilityValidation
} from '../middleware/validationMiddleware.js';

// userRoutesFactory now accepts all parameters from server.js
// We explicitly remove the local instantiation of userService here to avoid potential confusion.
export default (db, upload, uuidv4, jwtSecret, authenticateToken, userService) => {
    // --- START DEBUGGING IN userRoutes.js ---
    console.log('>>> USERROUTES.JS DEBUG: Entering userRoutesFactory');
    console.log(`>>> USERROUTES.JS DEBUG: db is ${db ? 'defined' : 'undefined'}`);
    console.log(`>>> USERROUTES.JS DEBUG: upload is ${upload ? 'defined' : 'undefined'}`);
    console.log(`>>> USERROUTES.JS DEBUG: uuidv4 is ${uuidv4 ? 'defined' : 'undefined'}`);
    console.log(`>>> USERROUTES.JS DEBUG: jwtSecret is ${jwtSecret ? 'defined' : 'undefined'}`);
    console.log(`>>> USERROUTES.JS DEBUG: authenticateToken is ${authenticateToken ? 'defined' : 'undefined'}`);
    console.log(`>>> USERROUTES.JS DEBUG: userService is ${userService ? 'defined' : 'undefined'}`);
    // --- END DEBUGGING IN userRoutes.js ---

    const router = express.Router();

    // userService is now passed in, no need to instantiate it here or import its factory
    // const userService = userServiceFactory(db); // THIS LINE IS NOW REMOVED OR COMMENTED OUT

    // userControllerFactory now explicitly receives userService AND upload
    // --- START DEBUGGING userControllerFactory call ---
    console.log(`>>> USERROUTES.JS DEBUG: Calling userControllerFactory with userService: ${userService ? 'defined' : 'undefined'} and upload: ${upload ? 'defined' : 'undefined'}`);
    // --- END DEBUGGING userControllerFactory call ---
    const userController = userControllerFactory(userService, upload);
    console.log('>>> USERROUTES.JS DEBUG: userController defined. Has uploadProfilePicture method?', !!userController.uploadProfilePicture);
    // GET / - Fetch Current User Profile
    router.get('/', authenticateToken, userController.getCurrentUserProfile);

    // PUT / - Update User Profile
    router.put('/',
        authenticateToken,
        updateUserProfileValidation,
        validate,
        userController.updateUserProfile
    );

    // PUT /madlib - Update Mad Lib Story
    router.put('/madlib',
        authenticateToken,
        updateMadLibStoryValidation,
        validate,
        userController.updateMadLibStory
    );

    // PUT /social-media - Update social media links for current user
    router.put('/social-media',
        authenticateToken,
        updateSocialMediaLinksValidation,
        validate,
        userController.updateSocialMediaLinks
    );

    // POST /upload - Upload Profile Picture (Multer's fileFilter handles basic validation)
    // The `upload.single('profilePicture')` is a multer middleware that processes the file.
    router.post('/upload', authenticateToken, upload.single('profilePicture'), userController.uploadProfilePicture);

    // PUT /change-username
    router.put('/change-username',
        authenticateToken,
        changeUsernameValidation,
        validate,
        userController.changeUsername
    );

    // PUT /change-password
    router.put('/change-password',
        authenticateToken,
        changePasswordValidation,
        validate,
        userController.changePassword
    );

    // GET /search - Search Users (add query param validation if needed - not done here for simplicity)
    router.get('/search', authenticateToken, userController.searchUsers);

    // --- Public Profile Routes (Unauthenticated where appropriate, e.g., GET) ---
    router.get('/public-profile/:username', userController.getPublicProfileByUsername);

    // POST /public-profile/:profileOwnerId/comments
    router.post('/public-profile/:profileOwnerId/comments',
        authenticateToken,
        postProfileCommentValidation,
        validate,
        userController.postProfileComment
    );

    // GET /public-profile/:profileOwnerId/comments (add param validation if needed)
    router.get('/public-profile/:profileOwnerId/comments', userController.getProfileComments);

    // DELETE /public-profile/comments/:commentId
    router.delete('/public-profile/comments/:commentId',
        authenticateToken,
        deleteProfileCommentValidation,
        validate,
        userController.deleteProfileComment
    );

    // --- User Availability Routes ---
    router.get('/availability/:userId', authenticateToken, userController.getUserAvailability);

    // POST /availability
    router.post('/availability',
        authenticateToken,
        updateAvailabilityValidation,
        validate,
        userController.updateAvailability
    );

    return router;
};