// server/config/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'gamenight.db');

// --- NEW DEBUG LOG (LINE A) ---
console.log(`[DB_PATH_CALC] Calculated DB_PATH: ${DB_PATH}`);


async function initializeDatabase() {
    let db;
    try {
        // --- NEW DEBUG LOG (LINE B) ---
        console.log(`[DB_INIT_CONNECT] Attempting to open database at: ${DB_PATH}`);

        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        console.log(`[DB_INIT] Connected to SQLite database at path: ${DB_PATH}`);
        // --- NEW DEBUG LOG (LINE C) ---
        console.log(`[DB_INIT_CONFIRMED] Database object's filename: ${db.config.filename}`);


        await db.run('PRAGMA foreign_keys = ON;');

        // Users Table - RENAMED profilePictureUrl to profile_picture_url for consistency
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id TEXT PRIMARY KEY,
                                                 username TEXT UNIQUE NOT NULL,
                                                 email TEXT UNIQUE,
                                                 password TEXT NOT NULL,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 isAdmin INTEGER DEFAULT 0,
                                                 firstName TEXT,
                                                 lastName TEXT,
                                                 favoriteGames TEXT,
                                                 profile_picture_url TEXT,
                                                 bio TEXT,
                                                 mad_lib_story TEXT,
                                                 social_media_links TEXT DEFAULT '[]' -- CHANGED TO snake_case HERE
            );
        `);
        console.log('[DB_INIT] Users table checked/created.');

        // --- NEW DEBUG LOG (LINE D) ---
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        console.log(`[DB_INIT_USER_COUNT] Users table currently has ${userCount ? userCount.count : 'N/A'} users.`);


        // --- Schema Migrations for existing Users table ---
        const userTableInfo = await db.all(`PRAGMA table_info(users);`);
        const existingUserColumnNames = new Set(userTableInfo.map(col => col.name));
        const userColumnsToAdd = [
            'email TEXT UNIQUE',
            'isAdmin INTEGER DEFAULT 0',
            'firstName TEXT',
            'lastName TEXT',
            'favoriteGames TEXT',
            'profile_picture_url TEXT',
            'bio TEXT',
            'mad_lib_story TEXT',
            'social_media_links TEXT DEFAULT \'[]\'' // CHANGED TO snake_case HERE
        ];
        for (const columnDef of userColumnsToAdd) {
            const columnName = columnDef.split(' ')[0];
            if (!existingUserColumnNames.has(columnName)) {
                try {
                    await db.run(`ALTER TABLE users ADD COLUMN ${columnDef};`);
                    console.log(`[DB_INIT] Added ${columnName} column to users table.`);
                } catch (error) {
                    console.error(`[DB_INIT_ERROR] Error adding column ${columnName} to users table:`, error.message);
                }
            }
        }
        console.log('[DB_INIT] User profile columns checked/added.');

        // Events Table
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
        console.log('[DB_INIT] Events table checked/created.');

        // Event Attendees Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_event_attendees (
                                                                id TEXT PRIMARY KEY,
                                                                event_id TEXT NOT NULL,
                                                                user_id TEXT NOT NULL,
                                                                status TEXT NOT NULL CHECK(status IN ('invited', 'accepted', 'declined', 'attended')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                responded_at DATETIME,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(event_id, user_id)
                );
        `);
        console.log('[DB_INIT] User Event Attendees table checked/created with "responded_at".');

        // --- Migration for responded_at (redundant with DROP, but good for future) ---
        const attendeeTableInfo = await db.all(`PRAGMA table_info(user_event_attendees);`);
        const existingAttendeeColumnNames = new Set(attendeeTableInfo.map(col => col.name));
        if (!existingAttendeeColumnNames.has('responded_at')) {
            try {
                await db.run(`ALTER TABLE user_event_attendees ADD COLUMN responded_at DATETIME;`);
                console.log('[DB_INIT] Explicitly added "responded_at" column to user_event_attendees table (via ALTER TABLE).');
            } catch (alterError) {
                console.error('[DB_INIT_ERROR] Error explicitly adding "responded_at" column to user_event_attendees table:', alterError.message);
            }
        } else {
            console.log('[DB_INIT] "responded_at" column already confirmed in user_event_attendees table.');
        }


        // Friendships Table
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
        console.log('[DB_INIT] Friendships table checked/created.');

        // User Games Table
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
        console.log('[DB_INIT] User Games table checked/created.');

        // User Availability Table
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
        console.log('[DB_INIT] User Availability table checked/created.');

        // Profile Comments Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS profile_comments (
                                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            profile_owner_id TEXT NOT NULL,
                                                            commenter_id TEXT NOT NULL,
                                                            content TEXT NOT NULL,
                                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                            FOREIGN KEY (profile_owner_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (commenter_id) REFERENCES users(id) ON DELETE CASCADE
                );
        `);
        console.log('[DB_INIT] Profile Comments table checked/created.');

        // Games Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS games (
                                                 id TEXT PRIMARY KEY,
                                                 title TEXT UNIQUE NOT NULL,
                                                 thumbnailUrl TEXT,
                                                 description TEXT
            );
        `);
        console.log('[DB_INIT] Games table checked/created.');

        // --- NEW: Blacklisted Tokens Table ---
        await db.run(`
            CREATE TABLE IF NOT EXISTS blacklisted_tokens (
                                                              token TEXT PRIMARY KEY NOT NULL,
                                                              expiry_time INTEGER NOT NULL
            );
        `);
        console.log('[DB_INIT] Blacklisted Tokens table checked/created.');

        console.log('[DB_INIT] Database initialization and schema setup complete.');
        return db;
    } catch (error) {
        console.error('FATAL ERROR: Failed to initialize database:', error.message);
        console.error('Error stack:', error.stack);
        process.exit(1);
    }
}

export default initializeDatabase;