import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
// REMOVE: import { JWT_SECRET } from '../config/config.js'; // This line is no longer needed

// Export a function that accepts 'authService' and 'jwtSecret'
export default (authService, jwtSecret) => { // jwtSecret is passed in

    const register = async (req, res, next) => {
        const { username, password, isAdmin } = req.body;

        try {
            const userId = uuidv4();
            const newUser = await authService.registerUser(userId, username, password, isAdmin);

            // Use the passed jwtSecret
            const token = jwt.sign(
                { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin === 1 },
                jwtSecret, // Use the passed jwtSecret
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            res.status(201).json({
                message: 'Registration successful!',
                token: token,
                userId: newUser.id,
                username: newUser.username,
                isAdmin: newUser.isAdmin === 1
            });
        } catch (error) {
            console.error('Error during user registration:', error);
            // CustomError will have a statusCode, use it directly
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error); // Pass other errors (like unexpected 500s) to global error handler
        }
    };

    const login = async (req, res, next) => {
        const { username, password } = req.body;

        try {
            // --- ADDED DEBUG LINES HERE ---
            console.log('--- DEBUG (authController.login): Type of authService:', typeof authService);
            console.log('--- DEBUG (authController.login): Does authService.findUserByUsername exist?', typeof authService.findUserByUsername);
            console.log('--- DEBUG (authController.login): authService object:', authService); // Inspect its contents
            // --- END DEBUG LINES ---

            const user = await authService.findUserByUsername(username);

            if (!user) {
                // For security, use a generic message for both invalid username/password
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const passwordMatch = await authService.comparePassword(password, user.password);
            if (!passwordMatch) {
                // For security, use a generic message for both invalid username/password
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            // Use the passed jwtSecret
            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: user.isAdmin === 1 },
                jwtSecret, // Use the passed jwtSecret
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            res.status(200).json({
                message: 'Logged in successfully!',
                token: token,
                userId: user.id,
                username: user.username,
                isAdmin: user.isAdmin === 1
            });
        } catch (error) {
            console.error('Error during user login:', error);
            // If findUserByUsername or comparePassword throw CustomError with statusCode, handle it
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error); // Pass to global error handler
        }
    };

    const logout = async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                // Decode token to get expiry time
                const decoded = jwt.decode(token);
                // Check if decoded token exists and has an 'exp' claim
                const expiresIn = (decoded && decoded.exp) ? (decoded.exp - Math.floor(Date.now() / 1000)) : 0;

                if (expiresIn > 0) {
                    await authService.blacklistToken(token, expiresIn); // Blacklist the token
                    res.status(200).json({ message: 'Logged out successfully.' });
                } else {
                    // Token is already expired or has no exp. No need to blacklist.
                    res.status(200).json({ message: 'Token already expired or invalid, no action needed for blacklisting.' });
                }
            } catch (error) {
                console.error('Error during logout/token blacklisting:', error);
                // If it's a specific error from service, might have statusCode
                if (error.statusCode) {
                    return res.status(error.statusCode).json({ message: error.message });
                }
                res.status(500).json({ message: 'Failed to log out due to server error.' });
            }
        } else {
            res.status(400).json({ message: 'No token provided for logout.' });
        }
    };

    return {
        register,
        login,
        logout,
    };
};