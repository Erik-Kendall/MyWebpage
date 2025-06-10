import bcrypt from 'bcrypt';
import CustomError from '../utils/CustomError.js';

export default (databaseConnection) => { // Accepted parameter is databaseConnection
    const registerUser = async (userId, username, password, isAdmin) => {
        try {
            console.log('--- DEBUG (authService.registerUser): Value of databaseConnection:', databaseConnection);
            console.log('--- DEBUG (authService.registerUser): Type of databaseConnection:', typeof databaseConnection);
            console.log('--- DEBUG (authService.registerUser): Does databaseConnection have .get method?', typeof databaseConnection.get);
            console.log('--- DEBUG (authService.registerUser): Query being run:', 'SELECT id FROM users WHERE username = ? OR email = ?');
            console.log('--- DEBUG (authService.registerUser): Parameters for query:', username, username);

            const existingUser = await databaseConnection.get('SELECT id FROM users WHERE username = ? OR email = ?', username, username);
            if (existingUser) {
                throw new CustomError('Username or email already taken.', 409);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = {
                id: userId,
                username: username,
                password: hashedPassword,
                isAdmin: isAdmin ? 1 : 0
            };

            await databaseConnection.run(
                'INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
                user.id, user.username, user.password, user.isAdmin
            );
            return user;
        } catch (error) {
            console.error('Error in AuthService.registerUser:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to register user.', 500);
        }
    };

    const findUserByUsername = async (username) => {
        try {
            console.log('--- DEBUG (authService.findUserByUsername): Value of databaseConnection:', databaseConnection);
            console.log('--- DEBUG (authService.findUserByUsername): Type of databaseConnection:', typeof databaseConnection);
            console.log('--- DEBUG (authService.findUserByUsername): Does databaseConnection have .get method?', typeof databaseConnection.get);
            return await databaseConnection.get('SELECT * FROM users WHERE username = ? OR email = ?', username, username);
        } catch (error) {
            console.error('Error in AuthService.findUserByUsername:', error);
            throw new CustomError('Failed to find user.', 500);
        }
    };

    const comparePassword = async (plainPassword, hashedPassword) => {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error in AuthService.comparePassword:', error);
            throw new CustomError('Password comparison failed.', 500);
        }
    };

    const blacklistToken = async (token, expiresIn) => {
        try {
            const expiryTime = Math.floor(Date.now() / 1000) + expiresIn;
            await databaseConnection.run('INSERT OR REPLACE INTO blacklisted_tokens (token, expiry_time) VALUES (?, ?)', token, expiryTime);
        } catch (error) {
            console.error('Error in AuthService.blacklistToken:', error);
            throw new CustomError('Failed to blacklist token.', 500);
        }
    };

    const isTokenBlacklisted = async (token) => {
        try {
            const result = await databaseConnection.get('SELECT token FROM blacklisted_tokens WHERE token = ? AND expiry_time > ?', token, Math.floor(Date.now() / 1000));
            return !!result;
        } catch (error) {
            console.error('Error in AuthService.isTokenBlacklisted:', error);
            throw new CustomError('Failed to check token blacklist status.', 500);
        }
    };

    return {
        registerUser,
        findUserByUsername,
        comparePassword,
        blacklistToken,
        isTokenBlacklisted,
    };
};