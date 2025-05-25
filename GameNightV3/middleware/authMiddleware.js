// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js'; // Import JWT_SECRET from your config

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[Auth Middleware] Received request for authenticated route.');
    console.log('[Auth Middleware] Token:', token ? 'exists' : 'does not exist');

    if (token == null) {
        console.warn('[Auth Middleware] No token provided. Sending 401.');
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('[Auth Middleware] Token verification failed:', err.message);
            console.error(`[Auth Middleware] JWT_SECRET used for verification: ${JWT_SECRET ? '***** (present)' : 'NOT FOUND'}`);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        console.log('[Auth Middleware] Token verified successfully for user:', user.username);
        next();
    });
};

export const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.isAdmin !== true) {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};