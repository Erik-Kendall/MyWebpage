// server/server.js
import express from 'express';
import cors from 'cors';
// IMPORTANT: Changed to import initializeDatabase from db.js
import initializeDatabase from './config/db.js'; // This is the single source of truth for DB init
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import route factories
import authRoutesFactory from './routes/authRoutes.js';
import userRoutesFactory from './routes/userRoutes.js';
import friendRoutesFactory from './routes/friendRoutes.js';
import gameRoutesFactory from './routes/gameRoutes.js';
import eventRoutesFactory from './routes/eventRoutes.js';
import adminRoutesFactory from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sanitizer = {
    sanitizeBody: (req, res, next) => {
        // Implement your sanitization logic here if needed
        next();
    },
};

let db = null; // Initialize db to null

// Call the single database initialization function
initializeDatabase()
    .then(async (database) => {
        db = database; // Assign the open database connection
        console.log('[SERVER_INIT] Database connected and schema checked successfully!'); // More specific log

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('[SERVER_ERROR] JWT_SECRET not found in environment variables. Please set it.');
            process.exit(1);
        }
        console.log('[SERVER_DEBUG] JWT_SECRET loaded: ***** (present)');

        // Pass db, uuidv4, AND jwtSecret to route factories
        app.use('/api/auth', authRoutesFactory(db, uuidv4, jwtSecret));
        app.use('/api/users', userRoutesFactory(db, upload, sanitizer, uuidv4));
        app.use('/api/friends', friendRoutesFactory(db));
        app.use('/api/games', gameRoutesFactory(db));
        app.use('/api/events', eventRoutesFactory(db)); // Event routes
        app.use('/api/admin', adminRoutesFactory(db));

        // Global error handler
        app.use((err, req, res, next) => {
            console.error('GLOBAL ERROR HANDLER:', err);
            const statusCode = err.statusCode || 500;
            const message = err.message || 'An unexpected error occurred.';
            res.status(statusCode).json({ message: message });
        });

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('[SERVER_SHUTDOWN] SIGINT signal received: Closing server...');
            server.close(() => {
                console.log('[SERVER_SHUTDOWN] Express server closed.');
                if (db) {
                    db.close((err) => {
                        if (err) {
                            console.error('[SERVER_SHUTDOWN_ERROR] Error closing database:', err.message);
                        } else {
                            console.log('[SERVER_SHUTDOWN] Database connection closed.');
                        }
                        process.exit(0);
                    });
                } else {
                    process.exit(0);
                }
            });
        });

    })
    .catch((err) => {
        console.error('[SERVER_FATAL_ERROR] Server failed to start due to database initialization error:', err);
        process.exit(1);
    });
