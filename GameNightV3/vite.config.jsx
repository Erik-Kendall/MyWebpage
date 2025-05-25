// D:/Game Night/website/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module for __dirname if needed (less common for aliases but good practice)

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // This tells Vite: whenever you see 'date-fns-tz', use this specific file instead.
            'date-fns-tz': path.resolve(__dirname, 'node_modules/date-fns-tz/dist/index.mjs'),
            // You might need to add one for date-fns as well if it causes issues later
            'date-fns': path.resolve(__dirname, 'node_modules/date-fns/esm/index.js'), // Common path for date-fns ESM
        },
    },
    // You can keep optimizeDeps if you like, but the alias is usually stronger.
    // optimizeDeps: {
    //   include: [
    //     'date-fns-tz',
    //     'date-fns',
    //   ],
    // },
});