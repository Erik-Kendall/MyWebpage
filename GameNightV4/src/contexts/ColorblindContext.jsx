// src/contexts/ColorblindContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorblindContext = createContext();

export const useColorblind = () => useContext(ColorblindContext);

export const ColorblindProvider = ({ children }) => {
    const [colorblindMode, setColorblindMode] = useState(() => {
        const stored = localStorage.getItem('colorblindMode');
        // Initialize from localStorage to persist preference
        return stored === 'true';
    });

    useEffect(() => {
        // This is the crucial part that adds/removes the CSS class from the body
        if (colorblindMode) {
            document.body.classList.add('colorblind-mode');
        } else {
            document.body.classList.remove('colorblind-mode');
        }

        // Also update localStorage to remember the user's preference
        localStorage.setItem('colorblindMode', colorblindMode);
    }, [colorblindMode]); // This effect re-runs whenever colorblindMode state changes

    const toggleColorblindMode = () => setColorblindMode((prev) => !prev);

    return (
        <ColorblindContext.Provider value={{ colorblindMode, toggleColorblindMode }}>
            {children}
        </ColorblindContext.Provider>
    );
};