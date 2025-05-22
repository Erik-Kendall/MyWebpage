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
// ADD THIS LINE FOR DEBUGGING
console.log(`[DEBUG] JWT_SECRET loaded: ${JWT_SECRET ? '***** (present)' : 'NOT FOUND'}`);

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file. Please create a .env file in the server directory with JWT_SECRET=your_super_secret_key');
    process.exit(1);
}

let db; // Global variable to hold the database connection

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// --- 3. MIDDLEWARE ---
app.use(cors(corsOptions));
app.use(express.json());
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
        // Ensure req.user is populated by auth middleware for profile picture uploads
        // This relies on the authenticateToken middleware running before this multer middleware
        // This check ensures req.user.id exists before using it
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

        // CORRECTED BLOCK FOR isAdmin COLUMN CHECK
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

        // --- START OF NEW REFINED COLUMN ADDITION LOGIC (YOUR EXISTING CODE) ---
        const columnsToAdd = [
            'firstName TEXT',
            'lastName TEXT',
            'favoriteGames TEXT',
            'profilePictureUrl TEXT'
        ];

        // This existingColumns and existingColumnNames variable already serves the purpose
        // for the other columns. No need to refetch it here if the isAdmin check is handled above.
        // If 'userTableInfo' and 'existingUserColumnNames' were just used for isAdmin,
        // you could reuse them here or keep this separate. For clarity, I'm keeping it as is,
        // assuming your other column checks were already working fine.

        for (const columnDef of columnsToAdd) {
            const columnName = columnDef.split(' ')[0]; // Extracts 'firstName' from 'firstName TEXT'
            if (!existingUserColumnNames.has(columnName)) { // Use the already fetched set
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
        // --- END OF NEW REFINED COLUMN ADDITION LOGIC ---


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
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(event_id, user_id)
                );
        `);
        console.log('Event Attendees table checked/created.');

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

        // --- NEW TABLE: user_availability ---
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
        // --- END NEW TABLE ---

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
            // ADD THIS LINE FOR DEBUGGING
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
// ...
app.post('/register', async (req, res) => {
    const { username, password } = req.body; // Assuming your /register only takes these currently
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4(); // Generate a UUID for the user ID

        // CORRECTED: Include isAdmin with a default of 0
        await db.run('INSERT INTO users (id, username, password, isAdmin) VALUES (?, ?, ?, ?)',
            userId, username, hashedPassword, 0); // Added '0' for isAdmin

        res.status(201).json({ message: 'User registered successfully!', userId: userId });
    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Username already taken.' });
        }
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});
// ...


// User Login
// ...
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // CORRECTED: Select isAdmin from the database
        const user = await db.get('SELECT id, username, password, isAdmin FROM users WHERE username = ?', username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // CORRECTED: Include isAdmin in the JWT payload (convert 0/1 to boolean true/false)
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin === 1 },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // CORRECTED: Include isAdmin in the response body
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
// ...

// GET /profile - Fetch Current User Profile
// ...
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // CORRECTED: Select isAdmin from the database
        const user = await db.get('SELECT id, username, firstName, lastName, favoriteGames, profilePictureUrl, isAdmin FROM users WHERE id = ?', userId);

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
            isAdmin: user.isAdmin === 1 // Send as boolean
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
// ...

// GET /profile/games - Fetch User Games
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

// PUT /profile - Update User Profile
app.put('/profile', authenticateToken, async (req, res) => {
    const { firstName, lastName, favoriteGames, profilePictureUrl } = req.body;
    const userId = req.user.id;

    try {
        await db.run(
            `UPDATE users SET
                firstName = ?,
                lastName = ?,
                favoriteGames = ?,
                profilePictureUrl = ?
             WHERE id = ?`,
            [firstName, lastName, favoriteGames, profilePictureUrl, userId]
        );
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Internal server error updating profile.' });
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
    console.log(`[Public Profile Debug] Received request for public profile: ${username}`);

    try {
        const userProfile = await db.get(
            `SELECT id, username, firstName, lastName, favoriteGames, profilePictureUrl FROM users WHERE username = ?`,
            [username]
        );

        console.log(`[Public Profile Debug] DB query result for ${username}:`, userProfile);

        if (!userProfile) {
            console.warn(`[Public Profile Debug] User "${username}" not found in database for public profile.`);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch user's games (from user_games table)
        const userGames = await db.all(
            `SELECT game_title, notes, status
             FROM user_games
             WHERE user_id = ?`,
            [userProfile.id]
        );
        console.log(`[Public Profile Debug] Found ${userGames.length} games for ${username}.`);


        // Fetch user's hosted events
        const hostedEvents = await db.all(
            `SELECT id, title, description, event_date, event_time, location, game_title, host_username
             FROM events
             WHERE host_id = ? AND status = 'scheduled'
             ORDER BY event_date ASC, event_time ASC`,
            [userProfile.id]
        );
        console.log(`[Public Profile Debug] Found ${hostedEvents.length} hosted events for ${username}.`);


        // Return a combined profile object
        res.status(200).json({
            ...userProfile,
            games: userGames,
            hostedEvents: hostedEvents
        });

    } catch (error) {
        console.error(`[Public Profile Debug] !!! CRITICAL ERROR fetching public profile for ${username}:`, error.message, error.stack);
        res.status(500).json({ message: 'Internal server error fetching public profile.' });
    }
});

// =======================================================================================
// NEW AVAILABILITY ROUTES (for SQLite)
// =======================================================================================

// Route to get a user's availability (requires authentication)
app.get('/api/availability/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    // Optional: Security check - ensure logged-in user can access this.
    // For now, any authenticated user can fetch any other user's availability.
    // if (req.user.id !== userId) {
    //     // You might want to add logic here to check if they are friends,
    //     // or simply prevent fetching others' availability directly.
    //     return res.status(403).json({ message: 'Access denied: You can only view your own availability.' });
    // }

    try {
        const result = await db.all(
            'SELECT available_date FROM user_availability WHERE user_id = ? ORDER BY available_date ASC',
            [userId]
        );
        // available_date is already stored as YYYY-MM-DD string
        const availableDates = result.map(row => row.available_date);
        res.json({ availableDates });
    } catch (err) {
        console.error('Error fetching user availability:', err.message);
        res.status(500).json({ message: 'Server error while fetching availability.' });
    }
});

// Route to set/update a user's availability (requires authentication)
// This endpoint expects an array of all dates the user has currently selected as available.
app.post('/api/availability', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get user ID from authenticated token
    const { availableDates } = req.body; // Expects an array of 'YYYY-MM-DD' strings

    if (!Array.isArray(availableDates)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of dates.' });
    }

    try {
        // 1. Delete all existing availability for this user
        await db.run('DELETE FROM user_availability WHERE user_id = ?', [userId]);

        // 2. Insert the new set of available dates
        if (availableDates.length > 0) {
            // Using a loop for inserts because SQLite doesn't easily support bulk inserts
            // from an array parameter with `db.run` for multiple rows in one go.
            // Using a UUID for the primary key `id` for each entry.
            const insertPromises = availableDates.map(dateString =>
                db.run(
                    'INSERT INTO user_availability (id, user_id, available_date) VALUES (?, ?, ?)',
                    [uuidv4(), userId, dateString]
                )
            );
            await Promise.all(insertPromises); // Wait for all inserts to complete
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

        // Ensure a request doesn't already exist in either direction
        const existingFriendship = await db.get(
            `SELECT * FROM friendships
             WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
            [requesterId, recipientId, recipientId, requesterId]
        );

        // --- Corrected and completed logic for /friends/request ---
        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                return res.status(409).json({ message: 'Friend request already pending.' });
            } else if (existingFriendship.status === 'accepted') {
                return res.status(409).json({ message: 'You are already friends.' });
            } else if (existingFriendship.status === 'blocked') {
                // You might have specific rules for 'blocked' status
                return res.status(403).json({ message: 'Cannot send request due to existing block.' });
            }
        }

        // If no existing or pending request, create a new one
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
}); // End of app.post('/friends/request')

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
    const { requesterId, status } = req.body; // 'status' will be 'accepted' or 'rejected'
    const recipientId = req.user.id; // The logged-in user is the recipient of the request

    if (!requesterId || !status) {
        return res.status(400).json({ message: 'Requester ID and status are required.' });
    }

    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        // Find the pending friendship where the logged-in user is user_id2 (recipient)
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
            `SELECT f.id,
                    CASE
                        WHEN f.user_id1 = ? THEN u2.id
                        ELSE u1.id
                        END AS id,  -- Changed alias from friend_id to id
                    CASE
                        WHEN f.user_id1 = ? THEN u2.username
                        ELSE u1.username
                        END AS username, -- Changed alias from friend_username to username
                    f.status
             FROM friendships f
                      JOIN users u1 ON f.user_id1 = u1.id
                      JOIN users u2 ON f.user_id2 = u2.id
             WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND f.status = 'accepted'`,
            [userId, userId, userId, userId]
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
    const userId = req.user.id;

    try {
        const result = await db.run(
            `DELETE FROM friendships WHERE id = ? AND (user_id1 = ? OR user_id2 = ?)`,
            [friendshipId, userId, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Friendship or request not found or you do not have permission to delete it.' });
        }
        res.status(200).json({ message: 'Friendship or request deleted successfully.' });
    } catch (error) {
        console.error('Error deleting friendship:', error.message);
        res.status(500).json({ message: 'Internal server error deleting friendship.' });
    }
});

// --- Events API ---
// Create Event
app.post('/events', authenticateToken, async (req, res) => {
    const { title, description, event_date, event_time, location, max_players, game_id, game_title } = req.body;
    const hostId = req.user.id;
    let hostUsername = req.user.username;

    console.log('[Event Create Debug] Received request to create event.');
    console.log('[Event Create Debug] Request Body:', req.body);
    console.log('[Event Create Debug] Host ID:', hostId, 'Host Username:', hostUsername);


    if (!title || !event_date || !event_time || !location) {
        console.warn('[Event Create Debug] Missing required fields for event creation.');
        return res.status(400).json({ message: 'Title, date, time, and location are required for the event.' });
    }

    try {
        const eventId = uuidv4();
        console.log('[Event Create Debug] Generated Event ID:', eventId);

        // Check if host_username is actually populated from token or database
        if (!hostUsername) {
            console.error('[Event Create Debug] Host username is missing from token, attempting to fetch from DB.');
            const hostUser = await db.get('SELECT username FROM users WHERE id = ?', [hostId]);
            if (!hostUser) {
                return res.status(500).json({ message: 'Host user data not found.' });
            }
            hostUsername = hostUser.username;
            console.log('[Event Create Debug] Fetched host username from DB:', hostUsername);
        }


        await db.run(
            `INSERT INTO events (id, title, description, event_date, event_time, location, host_id, host_username, max_players, game_id, game_title, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [eventId, title, description, event_date, event_time, location, hostId, hostUsername, max_players, game_id, game_title, 'scheduled']
        );
        console.log('[Event Create Debug] Event inserted into events table successfully.');


        // Automatically add the host as an 'accepted' attendee
        const attendeeId = uuidv4();
        await db.run(
            `INSERT INTO event_attendees (id, event_id, user_id, status)
             VALUES (?, ?, ?, ?)`,
            [attendeeId, eventId, hostId, 'accepted']
        );
        console.log('[Event Create Debug] Host added as attendee successfully.');

        console.log('[Event Create Debug] Event creation process complete. Responding with 201.');
        res.status(201).json({ message: 'Event created successfully!', eventId: eventId });
    } catch (error) {
        console.error('[Events] Error creating event (detailed):', error.message, error.stack);
        res.status(500).json({ message: 'Internal server error creating event.' });
    }
});

// Get all events (public or private based on logic)
app.get('/events', async (req, res) => {
    try {
        const events = await db.all(`
            SELECT e.*, u.username AS host_username_from_users
            FROM events e
                     JOIN users u ON e.host_id = u.id
            ORDER BY e.event_date DESC, e.event_time DESC
        `);
        res.status(200).json(events);
    } catch (error) {
        console.error('[Events] Error fetching all events:', error.message);
        res.status(500).json({ message: 'Internal server error fetching events.' });
    }
});

// Get Event by ID
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[Event Get Debug] Received request for event ID: ${id}`);

    try {
        const event = await db.get(`
            SELECT e.*, u.username AS host_username_from_users
            FROM events e
                     JOIN users u ON e.host_id = u.id
            WHERE e.id = ?
        `, [id]);

        if (!event) {
            console.warn(`[Event Get Debug] Event with ID ${id} not found in database.`);
            return res.status(404).json({ message: 'Event not found.' });
        }

        console.log(`[Event Get Debug] Found event: ${event.title}`);

        // Fetch attendees for the event
        const attendees = await db.all(
            `SELECT ea.user_id, u.username, ea.status
             FROM event_attendees ea
                      JOIN users u ON ea.user_id = u.id
             WHERE ea.event_id = ?`,
            [id]
        );
        console.log(`[Event Get Debug] Fetched ${attendees.length} attendees for event ID: ${id}`);


        res.status(200).json({ ...event, attendees: attendees });
    } catch (error) {
        console.error(`[Events] Error fetching event ${id} (detailed):`, error.message, error.stack);
        res.status(500).json({ message: 'Internal server error fetching event details.' });
    }
});

// Update Event
app.put('/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, event_time, location, max_players, game_id, game_title, status } = req.body;
    const hostId = req.user.id;

    try {
        // Ensure only the host can update the event
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [id]);
        if (!event || event.host_id !== hostId) {
            return res.status(403).json({ message: 'Forbidden: You are not the host of this event.' });
        }

        const result = await db.run(
            `UPDATE events SET
                title = ?, description = ?, event_date = ?, event_time = ?, location = ?, max_players = ?, game_id = ?, game_title = ?, status = ?
             WHERE id = ?`,
            [title, description, event_date, event_time, location, max_players, game_id, game_title, status, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Event not found or no changes made.' });
        }

        res.status(200).json({ message: 'Event updated successfully!' });
    } catch (error) {
        console.error(`[Events] Error updating event ${id}:`, error.message);
        res.status(500).json({ message: 'Internal server error updating event.' });
    }
});

// Delete Event
app.delete('/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const hostId = req.user.id;

    try {
        // Ensure only the host can delete the event
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [id]);
        if (!event || event.host_id !== hostId) {
            return res.status(403).json({ message: 'Forbidden: You are not the host of this event.' });
        }

        const result = await db.run('DELETE FROM events WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(200).json({ message: 'Event deleted successfully!' });
    } catch (error) {
        console.error(`[Events] Error deleting event ${id}:`, error.message);
        res.status(500).json({ message: 'Internal server error deleting event.' });
    }
});

// POST /events/:eventId/invite - Invite users to an event
app.post('/events/:eventId/invite', authenticateToken, async (req, res) => {
    const eventId = req.params.eventId;
    const hostId = req.user.id; // The person sending the invite must be the host
    const { invitedUserIds } = req.body; // Array of user IDs to invite

    if (!Array.isArray(invitedUserIds) || invitedUserIds.length === 0) {
        console.error('[Events] Invite Error: No invited user IDs provided.');
        return res.status(400).json({ message: 'At least one invited user ID is required.' });
    }

    console.log(`[Events] Attempting to invite users ${invitedUserIds} to event ${eventId} by host ${hostId}`);

    try {
        // 1. Verify that the logged-in user is the host of the event
        const event = await db.get('SELECT host_id FROM events WHERE id = ?', [eventId]);
        if (!event) {
            console.error(`[Events] Invite Error: Event ${eventId} not found.`);
            return res.status(404).json({ message: 'Event not found.' });
        }
        if (event.host_id !== hostId) {
            console.error(`[Events] Invite Error: User ${hostId} is not host of event ${eventId}.`);
            return res.status(403).json({ message: 'Forbidden: Only the event host can invite attendees.' });
        }

        const successfulInvites = [];
        const failedInvites = [];

        for (const invitedUserId of invitedUserIds) {
            // Prevent inviting self if somehow included (host is already an 'accepted' attendee)
            if (invitedUserId === hostId) {
                const reason = 'Cannot invite event host (already attending).';
                console.warn(`[Events] Invite Warning: ${invitedUserId} - ${reason}`);
                failedInvites.push({ userId: invitedUserId, reason: reason });
                continue;
            }

            // Check if the user already has an entry for this event (to avoid duplicates)
            const existingAttendee = await db.get(
                'SELECT status FROM event_attendees WHERE event_id = ? AND user_id = ?',
                [eventId, invitedUserId]
            );

            if (existingAttendee) {
                const reason = `Already ${existingAttendee.status} for this event.`;
                console.warn(`[Events] Invite Warning: User ${invitedUserId} ${reason}`);
                failedInvites.push({ userId: invitedUserId, reason: reason });
                continue;
            }

            try {
                const attendeeId = uuidv4();
                await db.run(
                    `INSERT INTO event_attendees (id, event_id, user_id, status)
                     VALUES (?, ?, ?, ?)`,
                    [attendeeId, eventId, invitedUserId, 'invited']
                );
                successfulInvites.push(invitedUserId);
                console.log(`[Events] Successfully invited user ${invitedUserId} to event ${eventId}.`);
            } catch (innerError) {
                // This will catch DB errors like constraint violations
                console.error(`[Events] Database Error inviting user ${invitedUserId} to event ${eventId}: ${innerError.message}`, innerError);
                failedInvites.push({ userId: invitedUserId, reason: innerError.message });
            }
        }

        console.log(`[Events] Invites processed for event ${eventId} by host ${hostId}. Successful: ${successfulInvites.length}, Failed: ${failedInvites.length}`);

        res.status(200).json({
            message: 'Invitation process completed.',
            successfulInvites: successfulInvites,
            failedInvites: failedInvites
        });

    } catch (error) {
        // This will catch errors outside the loop, e.g., initial DB queries
        console.error(`[Events] Unhandled Error inviting users to event ${eventId}: ${error.message}`, error);
        res.status(500).json({ message: 'Internal server error inviting users.' });
    }
});


// GET /my-events - Fetch events where the user is host or attendee
app.get('/my-events', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log(`[MyEvents Debug] Received request for user events for ID: ${userId}`);

    try {
        // Fetch events hosted by the user
        const hostedEvents = await db.all(
            `SELECT
                 e.id, e.title, e.description, e.event_date, e.event_time, e.location, e.max_players, e.game_id, e.game_title, e.status, e.created_at,
                 u.username AS host_username,
                 'host' AS user_role,
                 NULL AS attendee_status
             FROM events e
                      JOIN users u ON e.host_id = u.id
             WHERE e.host_id = ?
             ORDER BY e.event_date DESC, e.event_time DESC`,
            [userId]
        );
        console.log(`[MyEvents Debug] Found ${hostedEvents.length} hosted events.`);

        // Fetch events where the user is an attendee
        const invitedEvents = await db.all(
            `SELECT
                 e.id, e.title, e.description, e.event_date, e.event_time, e.location, e.max_players, e.game_id, e.game_title, e.status, e.created_at,
                 u.username AS host_username,
                 'attendee' AS user_role,
                 ea.status AS attendee_status
             FROM events e
                      JOIN event_attendees ea ON e.id = ea.event_id
                      JOIN users u ON e.host_id = u.id
             WHERE ea.user_id = ? AND e.host_id != ?
             ORDER BY e.event_date DESC, e.event_time DESC`,
            [userId, userId]
        );
        console.log(`[MyEvents Debug] Found ${invitedEvents.length} invited events.`);


        const allEventsMap = new Map();
        hostedEvents.forEach(event => { allEventsMap.set(event.id, event); });
        invitedEvents.forEach(event => { if (!allEventsMap.has(event.id)) { allEventsMap.set(event.id, event); } });

        const allEvents = Array.from(allEventsMap.values());
        console.log(`[MyEvents Debug] Total unique events to send: ${allEvents.length}`);

        res.status(200).json(allEvents);

    } catch (error) {
        console.error(`[MyEvents Debug] Error fetching user events (detailed): ${error.message}`, error.stack);
        res.status(500).json({ message: 'Internal server error fetching your events.' });
    }
});
// Backend: Add this new route for handling RSVP responses
// PUT /events/:eventId/rsvp - Allows a user to accept/decline an event invitation
app.put('/events/:eventId/rsvp', authenticateToken, async (req, res) => {
    const { eventId } = req.params;
    const { status } = req.body; // Expected status: 'accepted' or 'declined'
    const userId = req.user.id; // The user accepting/declining

    if (!status || (status !== 'accepted' && status !== 'declined')) {
        return res.status(400).json({ message: 'Invalid or missing status.' });
    }

    try {
        // First, check if the user is invited to this event and what their current status is
        const existingAttendee = await db.get(
            `SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?`,
            [eventId, userId]
        );

        if (!existingAttendee) {
            // If they are not an attendee at all (neither invited, nor accepted/declined)
            return res.status(404).json({ message: 'User not found as an attendee for this event.' });
        }

        // If they are already in the attendees table, update their status
        await db.run(
            `UPDATE event_attendees SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE event_id = ? AND user_id = ?`,
            [status, eventId, userId]
        );

        res.status(200).json({ message: `Invitation ${status} successfully.` });

    } catch (error) {
        console.error(`Error updating RSVP status for event ${eventId} and user ${userId}:`, error.message);
        res.status(500).json({ message: 'Internal server error updating RSVP status.' });
    }
});

// --- SERVER STARTUP ---
// This IIFE ensures connectDb() is called and awaited before the server starts listening
// ... (all your imports, constants, db initialization, middleware like authenticateToken and authorizeAdmin) ...

(async () => {
    try {
        await connectDb(); // Initialize the database

        // All your API routes should be defined here, before static file serving and catch-all
        // This includes:
        // - app.post('/register', ...)
        // - app.post('/login', ...)
        // - app.get('/profile', ...)
        // - app.put('/profile', ...)
        // - app.post('/profile/upload', ...)
        // - app.post('/profile/games', ...)
        // - app.put('/profile/games/:gameId', ...)
        // - app.delete('/profile/games/:gameId', ...)
        // - app.get('/friends', ...)
        // - app.post('/friends/request', ...)
        // - app.put('/friends/respond', ...)
        // - app.delete('/friends/:id', ...)
        // - app.get('/friends/pending', ...)
        // - app.get('/friends/outgoing', ...)
        // - app.get('/users/search', ...)
        // - app.get('/public-profile/:username', ...)
        // - app.post('/events', ...)
        // - app.get('/events', ...)
        // - app.get('/events/:id', ...)
        // - app.put('/events/:id', ...)
        // - app.delete('/events/:id', ...)
        // - app.post('/events/:id/attend', ...)
        // - app.delete('/events/:id/unattend', ...)
        // - app.get('/events/:id/attendees', ...)
        // - app.get('/user-availability/:userId', ...)
        // - app.post('/user-availability', ...)
        // - app.delete('/user-availability/:date', ...)


        // NEW ADMIN ENDPOINTS - ADD THESE HERE
        // These are protected by authenticateToken AND authorizeAdmin
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

        // --- END OF NEW ADMIN ENDPOINTS ---


        const buildPath = path.join(__dirname, '..', 'dist'); // Corrected path to client build files
        if (fs.existsSync(buildPath)) {
            app.use(express.static(buildPath));
            console.log(`Serving static files from: ${buildPath}`);
        } else {
            console.error(`ERROR: Client build directory not found at: ${buildPath}. Please run 'npm run build' from D:\\Game Night\\website.`);
            // Optionally, exit the process if the build isn't found
            // process.exit(1);
        }

        // Catch-all to serve index.html for any other requests (for React Router)
        // This MUST be after all your API routes
        app.get('*', (req, res) => {
            const apiPrefixes = ['/api', '/uploads', '/register', '/login', '/profile', '/users', '/public-profile', '/games', '/friends', '/events', '/admin']; // ADDED '/admin' to apiPrefixes
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