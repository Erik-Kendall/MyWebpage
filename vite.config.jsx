// D:/Game Night/website/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Needed for path.resolve and __dirname

// __dirname is not directly available in ESM, so we define it.
// This is a common pattern for Vite configs when using path.resolve
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);


export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // These aliases are for specific module resolution issues, common with date-fns
            'date-fns-tz': path.resolve(__dirname, 'node_modules/date-fns-tz/dist/index.mjs'),
            'date-fns': path.resolve(__dirname, 'node_modules/date-fns/esm/index.js'),
        },
    },
    server: {
        port: 5173, // Your frontend development server port
        proxy: {
            // Proxy API requests to your backend server
            '/api': {
                target: 'http://localhost:3001', // Your backend server URL
                changeOrigin: true,
                secure: false, // Set to true for HTTPS in production
            },
            // Proxy /uploads requests to your backend for static file serving
            '/uploads': {
                target: 'http://localhost:3001', // Your backend server URL
                changeOrigin: true,
                secure: false,
            },
        },
    },
});