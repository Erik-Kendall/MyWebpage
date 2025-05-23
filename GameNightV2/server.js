// server.js
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// --- 2. CONFIGURATION & GLOBAL VARIABLES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3001;
const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET;
console.log(`[DEBUG] JWT_SECRET loaded: ${JWT_SECRET ? '***** (present)' : 'NOT FOUND'}`);

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file. Please create a .env file in the server directory with JWT_SECRET=your_super_secret_key');
    process.exit(1);
}

let db; // Global variable to hold the database connection

const corsOptions = {
    origin: 'http://localhost:5173', // Your frontend URL - CONFIRM THIS IS CORRECT!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// --- 3. MIDDLEWARE ---
app.use(express.json()); // Process JSON body first
app.use(cors(corsOptions)); // Then apply CORS headers, allowing preflight to be handled correctly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. MULTER CONFIGURATION (for file uploads) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user && req.user.id ? req.user.id : uuidv4(); // Fallback to uuid if user not authenticated
        const fileExtension = path.extname(file.originalname);
        cb(null, `${userId}${fileExtension}`); // Overwrite existing profile picture
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
});

const popularGames = [
    { id: 1, title: 'Catan', description: 'A classic resource-gathering board game.' },
    { id: 2, title: 'Ticket to Ride', description: 'Collect train cars and claim railway routes.' },
    { id: 3, title: 'Codenames', description: 'A word association game for two teams.' },
    { id: 4, title: 'Gloomhaven', description: 'A cooperative legacy dungeon crawler.' },
    { id: 5, title: 'Terraforming Mars', description: 'Transform Mars into a habitable planet.' },
    { id: 6, title: '7 Wonders', description: 'Lead an ancient civilization through three ages.' },
    { id: 7, title: 'Pandemic', description: 'Cooperate to stop global outbreaks.' },
    { id: 8, title: 'Splendor', description: 'Collect gem tokens and acquire development cards.' },
    { id: 9, title: 'Dominion', description: 'A deck-building card game.' },
    { id: 10, title: 'Chess', description: 'A timeless strategy board game.' },
    { id: 11, title: 'Everdell', description: 'A charming worker placement game about forest creatures.' },
    { id: 12, title: 'Wingspan', description: 'Attract birds to your wildlife preserve.' },
    { id: 13, title: 'Azul', description: 'Tile-laying game for creating beautiful patterns.' },
    { id: 14, title: 'Root', description: 'Asymmetric warfare in a vast woodland.' },
    { id: 15, title: 'Spirit Island', description: 'Cooperative game of settler-destroying spirits.' },
];

// NEW: Game Search Endpoint
app.get('/games/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';

    if (!query) {
        return res.json([]); // Return empty array if no query
    }

    const filteredGames = popularGames.filter(game =>
        game.title.toLowerCase().includes(query)
    );

    res.json(filteredGames);
});

// --- 5. DATABASE INITIALIZATION FUNCTION ---
async function connectDb() {
    try {
        db = await open({
            filename: './gamenight.db', // Ensure this path is correct relative to server.js
            driver: sqlite3.Database
        });
        console.log('Connected to the SQLite database.');

        await db.run('PRAGMA foreign_keys = ON;'); // Enable foreign key constraints

        // Create users table
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                isAdmin INTEGER DEFAULT 0
            );
        `);
        console.log('Users table checked/created.');

        // Fetch ALL column info for 'users' table
        const userTableInfo = await db.all(`PRAGMA table_info(users);`);
        const existingUserColumnNames = new Set(userTableInfo.map(col => col.name));

        // Check specifically if 'isAdmin' column exists
        if (!existingUserColumnNames.has('isAdmin')) {
            await db.exec(`ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0;`);
            console.log('Column isAdmin added to users table.');
        } else {
            console.log('Column isAdmin already exists in users table.');
        }

        const columnsToAdd = [
            'firstName TEXT',
            'lastName TEXT',
            'favoriteGames TEXT',
            'profilePictureUrl TEXT',
            'bio TEXT', // Ensure bio is also added if not present
            'madLibStory TEXT' // NEW: Mad Lib Story column
        ];

        for (const columnDef of columnsToAdd) {
            const columnName = columnDef.split(' ')[0];
            if (!existingUserColumnNames.has(columnName)) {
                try {
                    await db.run(`ALTER TABLE users ADD COLUMN ${columnDef};`);
                    console.log(`Added ${columnName} column to users table.`);
                } catch (error) {
                    console.error(`Error adding column ${columnName}:`, error.message);
                }
            } else {
                console.log(`Column ${columnName} already exists in users table.`);
            }
        }
        console.log('User profile columns checked/added.');

        // Create events table
        await db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                event_date TEXT NOT NULL,
                event_time TEXT NOT NULL,
                location TEXT NOT NULL,
                host_id TEXT NOT NULL,
                host_username TEXT NOT NULL,
                max_players INTEGER,
                game_id TEXT,
                game_title TEXT,
                status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'cancelled', 'completed')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Events table checked/created.');

        // Create event_attendees table
        await db.run(`
            CREATE TABLE IF NOT EXISTS event_attendees (
                id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('invited', 'accepted', 'declined', 'attended')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                responded_at DATETIME, -- Added responded_at column
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(event_id, user_id)
            );
        `);
        console.log('Event Attendees table checked/created.');

        // Add responded_at column if it doesn't exist
        const attendeeTableInfo = await db.all(`PRAGMA table_info(event_attendees);`);
        const existingAttendeeColumnNames = new Set(attendeeTableInfo.map(col => col.name));
        if (!existingAttendeeColumnNames.has('responded_at')) {
            await db.exec(`ALTER TABLE event_attendees ADD COLUMN responded_at DATETIME;`);
            console.log('Column responded_at added to event_attendees table.');
        } else {
            console.log('Column responded_at already exists in event_attendees table.');
        }


        // Create friendships table
        await db.run(`
            CREATE TABLE IF NOT EXISTS friendships (
                id TEXT PRIMARY KEY,
                user_id1 TEXT NOT NULL,
                user_id2 TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id1, user_id2),
                FOREIGN KEY (user_id1) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id2) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Friendships table checked/created.');

        // Create user_games table
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_games (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                game_title TEXT NOT NULL,
                notes TEXT,
                status TEXT NOT NULL CHECK(status IN ('owned', 'want_to_play', 'played')),
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, game_title)
            );
        `);
        console.log('User Games table checked/created.');

        // NEW TABLE: user_availability
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_availability (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                available_date TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE (user_id, available_date)
            );
        `);
        console.log('User Availability table checked/created.');

        console.log('Database initialization complete.');

    } catch (error) {
        console.error('Error connecting to database or initializing tables:', error);
        process.exit(1); // Exit process if DB setup fails
    }
}

// --- 6. JWT AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
        req.user = user; // Set req.user from JWT payload
        console.log('[Auth Middleware] Token verified successfully for user:', user.username);
        next();
    });
};

// NEW: Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
    // authenticateToken must run before this to set req.user
    // Ensure req.user exists and isAdmin property is true (from JWT payload)
    if (!req.user || req.user.isAdmin !== true) {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};

// --- 7. API ROUTES ---

// User Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const userId = uuidv4();

        await db.run('INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
            userId, username, hashedPassword, 0); // Default isAdmin to 0

        res.status(201).json({ message: 'User registered successfully!', userId: userId });
    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Username already taken.' });
        }
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});


// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await db.get('SELECT id, username, password, isAdmin FROM users WHERE username = ?', username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin === 1 },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Logged in successfully!',
            token: token,
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin === 1 // Send as boolean
        });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// GET /profile - Fetch Current User Profile
app.get('/profile', authenticateToken, async (req, res) => {
    console.log('--- DEBUG: GET /profile request ---');
    console.log('Authenticated User ID from Token:', req.user.id);
    console.log('Authenticated Username from Token:', req.user.username); // Also check username
    try {
        const userId = req.user.id;

        // NEW: Include madLibStory in the user fetch
        const user = await db.get('SELECT id, username, firstName, lastName, favoriteGames, profilePictureUrl, bio, isAdmin, madLibStory FROM users WHERE id = ?', userId);

        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        res.status(200).json({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            favoriteGames: user.favoriteGames,
            profilePictureUrl: user.profilePictureUrl,
            bio: user.bio, // Ensure bio is included here
            isAdmin: user.isAdmin === 1, // Send as boolean
            madLibStory: user.madLibStory // NEW: Include madLibStory
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /profile/games - Fetch User Games (might be redundant if /games/my-games is used)
app.get('/profile/games', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const games = await db.all('SELECT * FROM user_games WHERE user_id = ? ORDER BY game_title ASC', [userId]);
        console.log(`[UserGames] Fetched ${games.length} games for user ID: ${userId} via /profile/games`);
        res.status(200).json(games);
    } catch (error) {
        console.error('[UserGames] Error fetching user games (GET /profile/games):', error.message);
        res.status(500).json({ message: 'Internal server error fetching user games.' });
    }
});

// GET /games/my-games - Fetch all games for the logged-in user
app.get('/games/my-games', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const userGames = await db.all('SELECT id, game_title, notes, status FROM user_games WHERE user_id = ? ORDER BY game_title ASC', [userId]);
        res.status(200).json(userGames);
    } catch (error) {
        console.error('[UserGames] Error fetching user games:', error.message);
        res.status(500).json({ message: 'Internal server error fetching games.' });
    }
});

// PUT /games/my-games/:gameId - Update a specific game in user's collection
app.put('/games/my-games/:gameId', authenticateToken, async (req, res) => {
    const { gameId } = req.params;
    const { game_title, notes, status } = req.body;
    const userId = req.user.id;

    if (!game_title || !status) {
        return res.status(400).json({ message: 'Game title and status are required for update.' });
    }

    try {
        const result = await db.run(
            `UPDATE user_games SET game_title = ?, notes = ?, status = ? WHERE id = ? AND user_id = ?`,
            [game_title, notes, status, gameId, userId]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Game not found or you do not have permission to update it.' });
        }
        res.status(200).json({ message: 'Game updated successfully!' });
    } catch (error) {
        console.error('[UserGames] Error updating game:', error.message);
        res.status(500).json({ message: 'Internal server error updating game.' });
    }
});

// PUT /profile - Update User Profile (for bio)
app.put('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get logged-in user's ID from middleware
    const { bio } = req.body; // Extract bio from request body

    // Optional: Add validation for bio length, content etc.
    if (typeof bio !== 'string' || bio.length > 500) { // Example validation
        return res.status(400).json({ message: 'Bio must be a string and less than 500 characters.' });
    }

    try {
        const result = await db.run(
            `UPDATE users SET bio = ? WHERE id = ?`,
            [bio, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }

        res.status(200).json({ message: 'Profile updated successfully!', bio });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Internal server error updating profile.' });
    }
});

// NEW: Endpoint to save/update a user's Mad Lib story on their profile
app.put('/profile/madlib', authenticateToken, async (req, res) => {
    const { madLibStory } = req.body;
    const userId = req.user.id; // User ID from the authorization middleware

    if (madLibStory === undefined || typeof madLibStory !== 'string') {
        return res.status(400).json({ message: 'Mad Lib story content is required and must be a string.' });
    }
    // Allow null or empty string to clear the mad lib
    const storyToSave = madLibStory.trim() === '' ? null : madLibStory;

    try {
        await db.run(
            `UPDATE users SET madLibStory = ? WHERE id = ?`,
            [storyToSave, userId]
        );
        res.status(200).json({ message: 'Mad Lib story posted to profile successfully!' });
    } catch (error) {
        console.error('Error posting Mad Lib story to profile:', error);
        res.status(500).json({ message: 'Internal server error posting Mad Lib story.' });
    }
});


// POST /profile/upload - Upload Profile Picture
app.post('/profile/upload', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const userId = req.user.id;
    const profilePictureUrl = `/uploads/${req.file.filename}`;

    try {
        await db.run('UPDATE users SET profilePictureUrl = ? WHERE id = ?', [profilePictureUrl, userId]);
        res.status(200).json({ message: 'Profile picture updated successfully!', profilePictureUrl: profilePictureUrl });
    } catch (error) {
        console.error('Error updating profile picture URL:', error.message);
        res.status(500).json({ message: 'Internal server error updating profile picture.' });
    }
});

// GET /users/search - Search Users
app.get('/users/search', authenticateToken, async (req, res) => {
    const searchTerm = req.query.term;
    console.log(`[User Search Debug] Received search request for term: "${searchTerm}"`);

    if (!searchTerm) {
        console.warn('[User Search Debug] No search term provided. Sending 400.');
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        const users = await db.all(
            `SELECT id, username, firstName, lastName, profilePictureUrl FROM users WHERE username LIKE ? AND id != ?`,
            [`%${searchTerm}%`, req.user.id] // Case-insensitive and partial match, exclude current user
        );
        console.log(`[User Search Debug] Found ${users.length} users matching "${searchTerm}".`);
        res.status(200).json(users);
    } catch (error) {
        console.error('[User Search Debug] Error during user search:', error.message);
        res.status(500).json({ message: 'Internal server error during user search.' });
    }
});

// GET /public-profile/:username - Get Public Profile by Username
app.get('/public-profile/:username', async (req, res) => {
    const { username } = req.params;
    console.log(`[Backend] Attempting to fetch public profile for: ${username}`); // Debug Log 1

    try {
        const user = await db.get(`
            SELECT
                id,
                username,
                firstName,
                lastName,
                favoriteGames,
                profilePictureUrl,
                bio,
                isAdmin,
                madLibStory -- NEW: Include madLibStory for public profile
            FROM
                users
            WHERE
                username = ?
        `, [username]);

        console.log(`[Backend] DB query result for ${username}:`, user); // Debug Log 2

        if (!user) {
            console.warn(`[Backend] User ${username} not found.`); // Debug Log 3
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch user's game library (existing code)
        const games = await db.all(`
            SELECT game_title, status, notes
            FROM user_games
            WHERE user_id = ?
        `, [user.id]);
        console.log(`[Backend] Fetched games for ${username}:`, games); // Debug Log 4

        // Fetch hosted events (corrected to use 'id' and 'title' from your events table)
        const hostedEvents = await db.all(`
            SELECT id AS event_id, title AS event_name
            FROM events
            WHERE host_id = ?
        `, [user.id]);
        console.log(`[Backend] Fetched hosted events for ${username}:`, hostedEvents); // Debug Log 5


        res.status(200).json({ ...user, games, hostedEvents });
        console.log(`[Backend] Successfully sent public profile for: ${username}`); // Debug Log 6

    } catch (error) {
        console.error(`[Backend] Caught error in /public-profile/${username}:`, error.message); // Debug Log 7 (more specific)
        // Log the full error object for more detail, if available
        console.error(`[Backend] Full error object:`, error);
        res.status(500).json({ message: 'Internal server error fetching public profile.' });
    }
});

// =======================================================================================
// NEW AVAILABILITY ROUTES (for SQLite)
// =======================================================================================

// Route to get a user's availability (requires authentication)
app.get('/api/availability/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.all(
            'SELECT available_date FROM user_availability WHERE user_id = ? ORDER BY available_date ASC',
            [userId]
        );
        const availableDates = result.map(row => row.available_date);
        res.json({ availableDates });
    } catch (err) {
        console.error('Error fetching user availability:', err.message);
        res.status(500).json({ message: 'Server error while fetching availability.' });
    }
});

// Route to set/update a user's availability (requires authentication)
app.post('/api/availability', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { availableDates } = req.body;

    if (!Array.isArray(availableDates)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of dates.' });
    }

    try {
        await db.run('DELETE FROM user_availability WHERE user_id = ?', [userId]);

        if (availableDates.length > 0) {
            const insertPromises = availableDates.map(dateString =>
                db.run(
                    'INSERT INTO user_availability (id, user_id, available_date) VALUES (?, ?, ?)',
                    [uuidv4(), userId, dateString]
                )
            );
            await Promise.all(insertPromises);
        }

        res.status(200).json({ message: 'Availability updated successfully.' });

    } catch (err) {
        console.error('Error updating user availability:', err.message);
        res.status(500).json({ message: 'Failed to update availability.' });
    }
});

// =======================================================================================
// END NEW AVAILABILITY ROUTES
// =======================================================================================

// POST /games/my-games - Add a game to user's collection
app.post('/games/my-games', authenticateToken, async (req, res) => {
    const { game_title, notes, status } = req.body;
    const userId = req.user.id;

    if (!game_title || !status) {
        return res.status(400).json({ message: 'Game title and status are required.' });
    }

    try {
        const gameId = uuidv4();
        await db.run(
            `INSERT INTO user_games (id, user_id, game_title, notes, status)
             VALUES (?, ?, ?, ?, ?)`,
            [gameId, userId, game_title, notes, status]
        );
        res.status(201).json({ message: 'Game added successfully!' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed: user_games.user_id, user_games.game_title')) {
            return res.status(409).json({ message: 'You have already added this game.' });
        }
        console.error('[UserGames] Error adding game:', error.message);
        res.status(500).json({ message: 'Internal server error adding game.' });
    }
});

// DELETE /games/my-games/:gameId - Delete a game from user's collection
app.delete('/games/my-games/:gameId', authenticateToken, async (req, res) => {
    const { gameId } = req.params;
    const userId = req.user.id;
    try {
        const result = await db.run('DELETE FROM user_games WHERE id = ? AND user_id = ?', [gameId, userId]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Game not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Game deleted successfully!' });
    } catch (error) {
        console.error('[UserGames] Error deleting game:', error.message);
        res.status(500).json({ message: 'Internal server error deleting game.' });
    }
});

// --- Friends API ---
// POST /friends/request - Send a friend request
app.post('/friends/request', authenticateToken, async (req, res) => {
    const { recipientUsername } = req.body;
    const requesterId = req.user.id;

    if (!recipientUsername) {
        return res.status(400).json({ message: 'Recipient username is required.' });
    }

    try {
        const recipient = await db.get('SELECT id FROM users WHERE username = ?', [recipientUsername]);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient user not found.' });
        }

        const recipientId = recipient.id;

        if (requesterId === recipientId) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
        }

        const existingFriendship = await db.get(
            `SELECT * FROM friendships
             WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
            [requesterId, recipientId, recipientId, requesterId]
        );

        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                return res.status(409).json({ message: 'Friend request already pending.' });
            } else if (existingFriendship.status === 'accepted') {
                return res.status(409).json({ message: 'You are already friends.' });
            } else if (existingFriendship.status === 'blocked') {
                return res.status(403).json({ message: 'Cannot send request due to existing block.' });
            }
        }

        const friendshipId = uuidv4();
        await db.run(
            `INSERT INTO friendships (id, user_id1, user_id2, status)
             VALUES (?, ?, ?, 'pending')`,
            [friendshipId, requesterId, recipientId]
        );
        res.status(201).json({ message: 'Friend request sent successfully.' });

    } catch (error) {
        console.error('Error sending friend request:', error.message);
        res.status(500).json({ message: 'Internal server error sending friend request.' });
    }
});

// GET /friends/outgoing - Fetch outgoing friend requests
app.get('/friends/outgoing', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const outgoingRequests = await db.all(
            `SELECT f.id AS friendship_id, u.id AS recipient_id, u.username AS recipient_username
             FROM friendships f
                      JOIN users u ON f.user_id2 = u.id
             WHERE f.user_id1 = ? AND f.status = 'pending'`,
            [userId]
        );
        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.error('Error fetching outgoing friend requests:', error.message);
        res.status(500).json({ message: 'Internal server error fetching outgoing requests.' });
    }
});

// PUT /friends/respond - Accept or reject a friend request
app.put('/friends/respond', authenticateToken, async (req, res) => {
    const { requesterId, status } = req.body;
    const recipientId = req.user.id;

    if (!requesterId || !status) {
        return res.status(400).json({ message: 'Requester ID and status are required.' });
    }

    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const friendship = await db.get(
            `SELECT id, status FROM friendships
             WHERE user_id1 = ? AND user_id2 = ? AND status = 'pending'`,
            [requesterId, recipientId]
        );

        if (!friendship) {
            console.warn(`[Friend Respond] Pending friend request not found for requester: ${requesterId}, recipient: ${recipientId}`);
            return res.status(404).json({ message: 'Pending friend request not found.' });
        }

        await db.run(
            `UPDATE friendships SET status = ? WHERE id = ?`,
            [status, friendship.id]
        );

        const message = status === 'accepted' ? 'Friend request accepted.' : 'Friend request rejected.';
        res.status(200).json({ message });

    } catch (error) {
        console.error('Error responding to friend request:', error.message);
        res.status(500).json({ message: 'Internal server error responding to friend request.' });
    }
});

// GET /friends - Fetch accepted friends
app.get('/friends', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const friends = await db.all(
            `SELECT f.id AS friendship_id, -- Alias the friendship ID clearly
                    CASE
                        WHEN f.user_id1 = ? THEN u2.id
                        ELSE u1.id
                        END AS friend_user_id, -- Alias the friend's user ID
                    CASE
                        WHEN f.user_id1 = ? THEN u2.username
                        ELSE u1.username
                        END AS username,
                    f.status,
                    CASE
                        WHEN f.user_id1 = ? THEN u2.profilePictureUrl
                        ELSE u1.profilePictureUrl
                        END AS profilePictureUrl -- Add profile picture if not already present
             FROM friendships f
                      JOIN users u1 ON f.user_id1 = u1.id
                      JOIN users u2 ON f.user_id2 = u2.id
             WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'accepted'`,
            [userId, userId, userId, userId, userId] // Make sure you have enough parameters for all '?'
        );
        res.status(200).json({ friends: friends });
    } catch (error) {
        console.error('Error fetching friends list:', error.message);
        res.status(500).json({ message: 'Internal server error fetching friends.' });
    }
});

// GET /friends/pending - Fetch incoming pending friend requests
app.get('/friends/pending', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const pendingRequests = await db.all(
            `SELECT f.id AS friendship_id, u.id AS requester_id, u.username AS requester_username
             FROM friendships f
                      JOIN users u ON f.user_id1 = u.id
             WHERE f.user_id2 = ? AND f.status = 'pending'`,
            [userId]
        );
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error('Error fetching pending friend requests:', error.message);
        res.status(500).json({ message: 'Internal server error fetching pending requests.' });
    }
});

// DELETE /friends/:id - Unfriend / Delete a friendship or pending request
app.delete('/friends/:id', authenticateToken, async (req, res) => {
    const friendshipId = req.params.id;
    const userId = req.user.id; // This is the logged-in user's ID

    // === ADD THESE CONSOLE LOGS ===
    console.log('[Backend Delete Friendship] Received request to delete friendship ID:', friendshipId);
    console.log('[Backend Delete Friendship] Logged-in user ID:', userId);
    // =============================

    try {
        // First, let's SELECT the friendship to see its user_id1 and user_id2
        const existingFriendship = await db.get(
            `SELECT id, user_id1, user_id2 FROM friendships WHERE id = ?`,
            [friendshipId]
        );

        // === ADD THESE CONSOLE LOGS ===
        console.log('[Backend Delete Friendship] Found existing friendship:', existingFriendship);
        // =============================

        // If the friendship itself isn't found by ID, return 404
        if (!existingFriendship) {
            console.log('[Backend Delete Friendship] Friendship not found in DB with ID:', friendshipId);
            return res.status(404).json({ message: 'Friendship or request not found.' });
        }

        // Now attempt the DELETE query
        const result = await db.run(
            `DELETE FROM friendships WHERE id = ? AND (user_id1 = ? OR user_id2 = ?)`,
            [friendshipId, userId, userId]
        );

        // === ADD THESE CONSOLE LOGS ===
        console.log('[Backend Delete Friendship] Delete query result (changes):', result.changes);
        // =============================

        if (result.changes === 0) {
            // This case means the friendship ID was found, but the user_id1/user_id2 condition failed
            // or for some other reason, no rows were affected by the delete.
            return res.status(404).json({ message: 'Friendship or request not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Friendship or request deleted successfully.' });
    } catch (error) {
        console.error('[Backend Delete Friendship] Error deleting friendship:', error.message);
        res.status(500).json({ message: 'Internal server error deleting friendship.' });
    }
});


// NEW ADMIN ENDPOINTS
app.get('/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await db.all('SELECT id, username, firstName, lastName, created_at, isAdmin FROM users');
        const usersWithBooleanAdmin = users.map(user => ({
            ...user,
            isAdmin: user.isAdmin === 1
        }));
        res.status(200).json(usersWithBooleanAdmin);
    } catch (error) {
        console.error('Admin: Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.delete('/admin/users/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        if (req.user.id === userId) {
            return res.status(403).json({ message: 'Admins cannot delete their own account via this interface.' });
        }
        const result = await db.run('DELETE FROM users WHERE id = ?', userId);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User and associated data deleted successfully!' });
    } catch (error) {
        console.error('Admin: Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.delete('/admin/events/:eventId', authenticateToken, authorizeAdmin, async (req, res) => {
    const { eventId } = req.params;
    try {
        const result = await db.run('DELETE FROM events WHERE id = ?', eventId);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(200).json({ message: 'Event and associated attendees deleted successfully!' });
    } catch (error) {
        console.error('Admin: Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.put('/admin/users/:userId/set-admin', authenticateToken, authorizeAdmin, async (req, res) => {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (isAdmin === undefined || typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: 'Invalid isAdmin value. Must be true or false.' });
    }

    try {
        if (req.user.id === userId && isAdmin === false) {
            return res.status(403).json({ message: 'Admins cannot revoke their own admin status via this interface.' });
        }

        const adminValue = isAdmin ? 1 : 0;
        const result = await db.run('UPDATE users SET isAdmin = ? WHERE id = ?', adminValue, userId);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: `User admin status set to ${isAdmin}.` });
    } catch (error) {
        console.error('Admin: Error setting admin status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- Events API ---
// POST /events - Create a new event
app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, event_date, event_time, location, max_players, game_id, game_title } = req.body;
    const hostId = req.user.id;
    const hostUsername = req.user.username; // Get username from JWT payload

    if (!title || !event_date || !event_time || !location) {
        return res.status(400).json({ message: 'Title, date, time, and location are required for an event.' });
    }

    try {
        const eventId = uuidv4();
        await db.run(
            `INSERT INTO events (id, title, description, event_date, event_time, location, host_id, host_username, max_players, game_id, game_title)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [eventId, title, description, event_date, event_time, location, hostId, hostUsername, max_players, game_id, game_title]
        );
        res.status(201).json({ message: 'Event created successfully!', eventId });
    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(500).json({ message: 'Internal server error creating event.' });
    }
});

// GET /events - Get all events (or filtered by user ID)
app.get('/events', async (req, res) => {
    const { userId, status } = req.query; // Added status to query parameters
    let query = `
        SELECT
            e.id AS event_id,
            e.title,
            e.description,
            e.event_date,
            e.event_time,
            e.location,
            e.host_id,
            e.host_username,
            e.max_players,
            e.game_id,
            e.game_title,
            e.status,
            e.created_at,
            COUNT(ea.user_id) AS current_attendees -- Count attendees
        FROM
            events e
        LEFT JOIN
            event_attendees ea ON e.id = ea.event_id AND ea.status = 'accepted'
        GROUP BY
            e.id
    `;
    const params = [];
    const conditions = [];

    if (userId) {
        conditions.push(`(e.host_id = ? OR ea.user_id = ?)`);
        params.push(userId, userId);
    }
    if (status) {
        conditions.push(`e.status = ?`);
        params.push(status);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY e.event_date DESC, e.event_time DESC;`;

    try {
        const events = await db.all(query, params);

        // For each event, fetch accepted attendees details
        const eventsWithAttendees = await Promise.all(events.map(async (event) => {
            const attendees = await db.all(`
                SELECT u.id, u.username, u.profilePictureUrl
                FROM event_attendees ea
                JOIN users u ON ea.user_id = u.id
                WHERE ea.event_id = ? AND ea.status = 'accepted'
            `, [event.event_id]);
            return { ...event, attendees };
        }));

        res.status(200).json(eventsWithAttendees);
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).json({ message: 'Internal server error fetching events.' });
    }
});


// GET /events/:id - Get a single event by ID
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await db.get(`
            SELECT
                e.id AS event_id,
                e.title,
                e.description,
                e.event_date,
                e.event_time,
                e.location,
                e.host_id,
                e.host_username,
                e.max_players,
                e.game_id,
                e.game_title,
                e.status,
                e.created_at,
                COUNT(ea.user_id) AS current_attendees
            FROM
                events e
            LEFT JOIN
                event_attendees ea ON e.id = ea.event_id AND ea.status = 'accepted'
            WHERE
                e.id = ?
            GROUP BY
                e.id
        `, [id]);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const attendees = await db.all(`
            SELECT u.id, u.username, u.profilePictureUrl
            FROM event_attendees ea
            JOIN users u ON ea.user_id = u.id
            WHERE ea.event_id = ? AND ea.status = 'accepted'
        `, [id]);

        // Get pending invitees (only if host is requesting)
        let pendingInvitees = [];
        // This check would normally be done with authentication in a real app
        // For now, assuming anyone can see pending, but ideally host_id check needed
        pendingInvitees = await db.all(`
            SELECT u.id, u.username, u.profilePictureUrl
            FROM event_attendees ea
            JOIN users u ON ea.user_id = u.id
            WHERE ea.event_id = ? AND ea.status = 'invited'
        `, [id]);


        res.status(200).json({ ...event, attendees, pendingInvitees });
    } catch (error) {
        console.error('Error fetching event by ID:', error.message);
        res.status(500).json({ message: 'Internal server error fetching event.' });
    }
});

// PUT /events/:id - Update an event
app.put('/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, event_time, location, max_players, game_id, game_title, status } = req.body;
    const userId = req.user.id; // Host ID from authenticated user

    try {
        // First, check if the event exists and if the authenticated user is the host
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [id]);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.host_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this event.' });
        }

        const result = await db.run(
            `UPDATE events SET
                title = ?,
                description = ?,
                event_date = ?,
                event_time = ?,
                location = ?,
                max_players = ?,
                game_id = ?,
                game_title = ?,
                status = ?
             WHERE id = ?`,
            [title, description, event_date, event_time, location, max_players, game_id, game_title, status, id]
        );

        if (result.changes === 0) {
            // This case should ideally not be hit if event exists and host_id matches,
            // but good for robustness if no actual changes were made to values.
            return res.status(200).json({ message: 'Event found, but no changes were applied (data was identical).' });
        }

        res.status(200).json({ message: 'Event updated successfully!' });
    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(500).json({ message: 'Internal server error updating event.' });
    }
});

// DELETE /events/:id - Delete an event
app.delete('/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Host ID from authenticated user

    try {
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [id]);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.host_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this event.' });
        }

        await db.run('DELETE FROM events WHERE id = ?', [id]);
        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(500).json({ message: 'Internal server error deleting event.' });
    }
});

// POST /events/:id/attendees - Add an attendee to an event
app.post('/events/:id/attendees', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const attendeeId = req.user.id; // Current authenticated user is the attendee
    const { status } = req.body; // 'accepted' or 'invited'

    if (!status || !['accepted', 'invited'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "invited".' });
    }

    try {
        const event = await db.get('SELECT id FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Check if attendee already exists for this event
        const existingAttendee = await db.get(
            `SELECT id, status FROM event_attendees WHERE event_id = ? AND user_id = ?`,
            [eventId, attendeeId]
        );

        if (existingAttendee) {
            if (existingAttendee.status === status) {
                return res.status(409).json({ message: `You are already ${status} for this event.` });
            } else {
                // Update existing attendee's status
                await db.run(
                    `UPDATE event_attendees SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [status, existingAttendee.id]
                );
                return res.status(200).json({ message: `Your status for this event has been updated to ${status}.` });
            }
        }

        // If no existing record, insert new
        const attendeeEntryId = uuidv4();
        await db.run(
            `INSERT INTO event_attendees (id, event_id, user_id, status, responded_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [attendeeEntryId, eventId, attendeeId, status]
        );
        res.status(201).json({ message: `Successfully set status to ${status} for event.` });

    } catch (error) {
        console.error('Error adding/updating event attendee:', error.message);
        res.status(500).json({ message: 'Internal server error managing event attendance.' });
    }
});


// DELETE /events/:id/attendees/:userId - Remove an attendee from an event
app.delete('/events/:id/attendees/:userId', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const userIdToDelete = req.params.userId; // The user to remove (could be self or another if host)
    const currentUserId = req.user.id; // The currently logged-in user

    try {
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Check if the current user is the host OR if the current user is trying to remove themselves
        if (event.host_id !== currentUserId && userIdToDelete !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to remove this attendee.' });
        }

        const result = await db.run(
            `DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?`,
            [eventId, userIdToDelete]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Attendee not found for this event.' });
        }
        res.status(200).json({ message: 'Attendee removed successfully.' });

    } catch (error) {
        console.error('Error removing event attendee:', error.message);
        res.status(500).json({ message: 'Internal server error removing event attendee.' });
    }
});


// --- SERVER STARTUP ---
(async () => {
    try {
        await connectDb(); // Initialize the database

        // Ensure all API routes are defined BEFORE the static file serving and catch-all
        // (All the routes are defined above this startup block in the complete file)

        const buildPath = path.join(__dirname, '..', 'dist'); // Corrected path to client build files
        if (fs.existsSync(buildPath)) {
            app.use(express.static(buildPath));
            console.log(`Serving static files from: ${buildPath}`);
        } else {
            console.error(`ERROR: Client build directory not found at: ${buildPath}. Please run 'npm run build' from D:\\Game Night\\website.`);
        }

        // Catch-all to serve index.html for any other requests (for React Router)
        // This MUST be after all your API routes
        app.get('*', (req, res) => {
            const apiPrefixes = ['/api', '/uploads', '/register', '/login', '/profile', '/users', '/public-profile', '/games', '/friends', '/events', '/admin'];
            const isApiRoute = apiPrefixes.some(prefix => req.path.startsWith(prefix));

            if (isApiRoute) {
                return res.status(404).send('API endpoint not found.');
            }
            res.sendFile(path.join(buildPath, 'index.html'));
        });

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server due to database connection error:', err);
        process.exit(1);
    }
})();