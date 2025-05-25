// server/services/authService.js (REVISED)
import bcrypt from 'bcrypt';
import { saltRounds } from '../config/config.js'; // Import saltRounds from your config

const authServiceFactory = (db) => {

    const findUserByUsername = async (username) => {
        // Ensure all necessary user data for JWT and context is returned
        const user = await db.get('SELECT id, username, password, isAdmin FROM users WHERE username = ?', username);
        return user;
    };

    const registerUser = async (userId, username, password) => { // userId is now passed to this service
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            const error = new Error('Username already taken.');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            // Use the userId generated in the controller and passed here
            // Note: Since email is TEXT UNIQUE NOT NULL in your DB, you MUST provide it.
            // If not collected from frontend, you can set it to a temporary placeholder or NULL if you changed the schema.
            // For now, assuming you either removed the NOT NULL or added a placeholder.
            await db.run('INSERT INTO users (id, username, password, isAdmin, email) VALUES (?, ?, ?, ?, ?)',
                userId, username, hashedPassword, 0, null); // Set email to null, assuming you made it nullable or removed UNIQUE NOT NULL

            // Fetch the newly created user to return its full data including the ID
            const newUser = await findUserByUsername(username); // Re-use this to get the full user object
            if (!newUser) {
                // This should ideally not happen if the insert was successful
                throw new Error("Failed to retrieve newly registered user after insertion.");
            }
            return newUser; // Return the full user object with its actual ID, username, isAdmin
        } catch (error) {
            if (error.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
                const customError = new Error('Username already taken.');
                customError.statusCode = 409;
                throw customError;
            }
            // If it's a NOT NULL constraint for email, it will come here.
            if (error.message.includes('SQLITE_CONSTRAINT_NOTNULL')) {
                const customError = new Error('Email is required for registration. (Backend)'); // Add a clear message
                customError.statusCode = 400;
                throw customError;
            }
            console.error('Error in authService.registerUser:', error);
            throw error;
        }
    };

    // server/services/authService.js
    const comparePassword = async (plainPassword, hashedPassword) => {
        console.log('--- Password Comparison Debug ---');
        console.log('Plain Password (received for login):', plainPassword);
        console.log('Hashed Password (from DB):', hashedPassword);
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('Password Match Result:', match);
        console.log('--- End Password Comparison Debug ---');
        return match;
    };

    return {
        findUserByUsername,
        registerUser,
        comparePassword,
    };
};

export default authServiceFactory;