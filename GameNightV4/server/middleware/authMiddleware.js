// src/server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';

export const authMiddlewareFactory = (jwtSecret, authService) => {

    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        console.log(`[AUTH_MIDDLEWARE] Received request for: ${req.method} ${req.originalUrl}`);
        console.log(`[AUTH_MIDDLEWARE] Token presence: ${token ? 'present' : 'absent'}`);
        // console.log(`[AUTH_MIDDLEWARE] Raw Token: ${token}`); // Only uncomment for deep debug, token is sensitive!

        if (token == null) {
            console.warn('[AUTH_MIDDLEWARE] Token is null, returning 401.');
            return res.status(401).json({ message: 'Authentication token required.' });
        }

        // Log the secret being used for verification
        // console.log(`[AUTH_MIDDLEWARE] JWT Secret for verification: ${jwtSecret ? 'present' : 'absent'}`); // Only uncomment for debug, secret is sensitive!

        jwt.verify(token, jwtSecret, async (err, user) => { // Made callback async
            if (err) {
                console.error(`[AUTH_MIDDLEWARE] JWT verification error: ${err.name} - ${err.message}`);
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Authentication token expired.' });
                }
                if (err.name === 'JsonWebTokenError') {
                    // This is the error we are currently seeing
                    return res.status(403).json({ message: 'Invalid authentication token.' });
                }
                // Generic forbidden for other JWT errors
                return res.status(403).json({ message: 'Forbidden.' });
            }

            // If we reach here, JWT verification succeeded. Log the user payload.
            console.log(`[AUTH_MIDDLEWARE] JWT Verified. User payload: ${JSON.stringify(user)}`);

            // --- Check if the token is blacklisted ---
            if (!authService || typeof authService.isTokenBlacklisted !== 'function') {
                console.error('[AUTH_MIDDLEWARE_ERROR] authService or isTokenBlacklisted is not available. This is a setup error.');
                // Proceeding without blacklist check as a fallback, but this indicates a config problem.
                // Or you could return an error here if blacklist check is mandatory for all tokens.
                return res.status(500).json({ message: 'Server configuration error: Authentication service not initialized.' });
            }

            try {
                const isBlacklisted = await authService.isTokenBlacklisted(token);
                if (isBlacklisted) {
                    console.warn('[AUTH_MIDDLEWARE] Token is blacklisted, returning 401.');
                    return res.status(401).json({ message: 'Authentication token has been invalidated (logged out).' });
                }
                console.log('[AUTH_MIDDLEWARE] Token not blacklisted.');
            } catch (blacklistError) {
                console.error('[AUTH_MIDDLEWARE_ERROR] Error checking token blacklist:', blacklistError);
                // Return 500 because this is an internal server error related to the blacklist check
                return res.status(500).json({ message: 'Authentication failed due to server error (blacklist check).' });
            }

            req.user = user; // Attach user payload to the request
            console.log(`[AUTH_MIDDLEWARE] Token valid and not blacklisted. Proceeding to next middleware/route.`);
            next();
        });
    };

    const authorizeAdmin = (req, res, next) => {
        // ... (your existing authorizeAdmin logic)
    };

    return {
        authenticateToken,
        authorizeAdmin
    };
};