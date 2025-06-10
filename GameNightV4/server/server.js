import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import initializeDatabase from './config/db.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Not strictly needed here after refactoring, but harmless
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { authMiddlewareFactory } from './middleware/AuthMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutesFactory from './routes/authRoutes.js';
import userRoutesFactory from './routes/userRoutes.js';
import friendRoutesFactory from './routes/friendRoutes.js';
import gameRoutesFactory from './routes/gameRoutes.js';
import eventRoutesFactory from './routes/eventRoutes.js';
import adminRoutesFactory from './routes/adminRoutes.js';

import authServiceFactory from './services/authService.js';
import userServiceFactory from './services/userService.js';
import friendServiceFactory from './services/friendService.js';
import gameServiceFactory from './services/gameService.js';
import eventServiceFactory from './services/eventService.js';
import adminServiceFactory from './services/adminService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const soundsDirectoryPath = path.join(__dirname, 'sounds');
if (!fs.existsSync(soundsDirectoryPath)) {
    fs.mkdirSync(soundsDirectoryPath, { recursive: true });
    console.log(`[SERVER_INIT] Created sounds directory: ${soundsDirectoryPath}`);
}
app.use('/sounds', express.static(soundsDirectoryPath));
console.log(`[SERVER_INIT] Serving static sound files from: ${soundsDirectoryPath} at /sounds`);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
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

const DATABASE_PATH = path.join(__dirname, 'data', 'gamenight.sqlite');

initializeDatabase(DATABASE_PATH)
    .then(async (databaseInstance) => {
        console.log('[SERVER_INIT] Database connected and schema checked successfully!');

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('[SERVER_ERROR] JWT_SECRET not found in environment variables. Please set it.');
            process.exit(1);
        }
        console.log('[SERVER_DEBUG] JWT_SECRET loaded: ***** (present)');

        const authService = authServiceFactory(databaseInstance);
        const userService = userServiceFactory(databaseInstance);
        const friendService = friendServiceFactory(databaseInstance);
        const gameService = gameServiceFactory(databaseInstance);
        const eventService = eventServiceFactory(databaseInstance);
        const adminService = adminServiceFactory(databaseInstance);

        const popularGames = [];

        // This `authenticateToken` is used for routes where middleware is applied via `app.use`
        // or explicitly passed to route factories that don't instantiate their own middleware.
        const { authenticateToken, authorizeAdmin } = authMiddlewareFactory(jwtSecret, authService);

        app.use('/api/auth', authRoutesFactory(authService, jwtSecret));

        // For user routes, the authenticateToken from server.js is passed to userRoutesFactory
        app.use('/api/users',
            authenticateToken, // This authenticateToken instance handles /api/users at this level
            userRoutesFactory(databaseInstance, upload, uuidv4, jwtSecret, authenticateToken, userService)
        );

        // >>> Modified line: friendRoutesFactory now receives db, jwtSecret, and authService <<<
        // The authenticateToken middleware will be instantiated *inside* friendRoutesFactory
        // to ensure it has correct access to jwtSecret and authService.
        app.use('/api/friends', friendRoutesFactory(databaseInstance, jwtSecret, authService));

        app.use('/api/games', gameRoutesFactory(databaseInstance, popularGames, authenticateToken));
        app.use('/api/events', eventRoutesFactory(databaseInstance, authenticateToken));

        app.use('/api/admin', adminRoutesFactory(databaseInstance, jwtSecret, authService));

        server.listen(PORT, () => {
            console.log(`[SERVER_INIT] Server running on port ${PORT}`);
            console.log(`[SERVER_INIT] Frontend expected at http://localhost:5173`);
            console.log(`[SERVER_INIT] Serving static files from: ${__dirname}`);
        });
    })
    .catch((err) => {
        console.error('[SERVER_ERROR] Failed to initialize database:', err.message);
        console.error('[SERVER_ERROR] Full error stack:', err.stack);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.send('Game Night API is running!');
});

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack || err);
    res.status(500).json({
        message: 'Something broke on the server!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});