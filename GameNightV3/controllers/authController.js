// server/controllers/authController.js
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export default (authService, jwtSecret) => {

    const register = async (req, res, next) => {
        // MODIFIED: Destructure confirmPassword from req.body
        const { username, password, confirmPassword, isAdmin } = req.body;

        if (!username || !password || !confirmPassword) { // MODIFIED: Added confirmPassword to required fields
            return res.status(400).json({ message: 'Username, password, and confirm password are required.' });
        }

        // NEW: Server-side password confirmation check
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const minPasswordLength = 8;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/;

        if (password.length < minPasswordLength) {
            return res.status(400).json({ message: `Password must be at least ${minPasswordLength} characters long.` });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        try {
            const userId = uuidv4();
            // Pass the userId and password to the service. confirmPassword is NOT passed to the service.
            const newUser = await authService.registerUser(userId, username, password, isAdmin);

            const token = jwt.sign(
                { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin === 1 },
                jwtSecret,
                { expiresIn: '1h' }
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
            if (error.statusCode === 409) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            if (error.statusCode === 400) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            next(error);
        }
    };

    const login = async (req, res, next) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        try {
            const user = await authService.findUserByUsername(username);

            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const passwordMatch = await authService.comparePassword(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, isAdmin: user.isAdmin === 1 },
                jwtSecret,
                { expiresIn: '1h' }
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
            next(error);
        }
    };

    return {
        register,
        login,
    };
};