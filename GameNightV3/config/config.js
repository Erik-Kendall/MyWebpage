// server/config/config.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 3001;
export const saltRounds = 10;
export const JWT_SECRET = process.env.JWT_SECRET;
export const popularGames = [ // Keep this here for now, might move to a 'data' folder later if it grows
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

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file. Please create a .env file in the server directory with JWT_SECRET=your_super_secret_key');
    process.exit(1);
}
console.log(`[DEBUG] JWT_SECRET loaded: ${JWT_SECRET ? '***** (present)' : 'NOT FOUND'}`);

export const corsOptions = {
    origin: 'http://localhost:5173', // Your frontend URL - CONFIRM THIS IS CORRECT!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// MULTER CONFIGURATION (for file uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Adjust uploadPath to be relative to the server/ folder, not config/
        const uploadPath = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user && req.user.id ? req.user.id : uuidv4();
        const fileExtension = path.extname(file.originalname);
        cb(null, `${userId}${fileExtension}`);
    }
});

export const upload = multer({
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