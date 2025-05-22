// src/contexts/ColorblindContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorblindContext = createContext();

export const useColorblind = () => useContext(ColorblindContext);

export const ColorblindProvider = ({ children }) => {
    const [colorblindMode, setColorblindMode] = useState(() => {
        const stored = localStorage.getItem('colorblindMode');
        return stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem('colorblindMode', colorblindMode);
    }, [colorblindMode]);

    const toggleColorblindMode = () => setColorblindMode((prev) => !prev);

    return (
        <ColorblindContext.Provider value={{ colorblindMode, toggleColorblindMode }}>
            {children}
        </ColorblindContext.Provider>
    );
};
