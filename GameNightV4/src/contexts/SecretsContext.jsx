import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Create the Context
const SecretsContext = createContext(null);

// 2. Create the Provider Component
export const SecretsProvider = ({ children }) => {
    // State to keep track of how many unique secrets have been found
    const [secretsFoundCount, setSecretsFoundCount] = useState(() => {
        // Initialize from localStorage to persist across sessions
        const savedCount = localStorage.getItem('unboundCurrentSecretsCount');
        return savedCount ? parseInt(savedCount, 10) : 0;
    });

    // State to store which specific secrets (by ID) have been found
    const [foundSecretIds, setFoundSecretIds] = useState(() => {
        const savedIds = localStorage.getItem('unboundCurrentFoundSecretIds');
        return savedIds ? new Set(JSON.parse(savedIds)) : new Set();
    });

    // State to indicate if The Unbound Current is unlocked
    const [unboundCurrentUnlocked, setUnboundCurrentUnlocked] = useState(() => {
        const savedUnlocked = localStorage.getItem('unboundCurrentUnlocked');
        return savedUnlocked === 'true'; // localStorage stores strings
    });

    // Effect to update localStorage whenever count or foundSecretIds change
    useEffect(() => {
        localStorage.setItem('unboundCurrentSecretsCount', secretsFoundCount.toString());
        localStorage.setItem('unboundCurrentFoundSecretIds', JSON.stringify(Array.from(foundSecretIds)));
    }, [secretsFoundCount, foundSecretIds]);

    // Effect to update unboundCurrentUnlocked status
    useEffect(() => {
        const isUnlocked = secretsFoundCount >= 12; // Our condition for unlocking
        setUnboundCurrentUnlocked(isUnlocked);
        localStorage.setItem('unboundCurrentUnlocked', isUnlocked.toString());
    }, [secretsFoundCount]);

    // Function to increment the count and mark a secret as found
    const incrementSecretsFound = useCallback((secretId) => {
        if (!foundSecretIds.has(secretId)) {
            setFoundSecretIds(prevIds => {
                const newIds = new Set(prevIds);
                newIds.add(secretId);
                return newIds;
            });
            setSecretsFoundCount(prevCount => prevCount + 1);
            console.log(`Secret Found! ID: ${secretId}. Total secrets: ${secretsFoundCount + 1}`);
        } else {
            console.log(`Secret ID: ${secretId} already found.`);
        }
    }, [foundSecretIds]); // Removed secretsFoundCount from dependencies as it's updated in the same render cycle here

    // Function to check if a specific secret has been found
    const isSecretFound = useCallback((secretId) => {
        return foundSecretIds.has(secretId);
    }, [foundSecretIds]);

    // Provide the states and functions through the context
    const contextValue = {
        secretsFoundCount,
        unboundCurrentUnlocked,
        incrementSecretsFound,
        isSecretFound,
        // Optional: Function to reset for testing purposes
        resetUnboundCurrentSecrets: () => {
            setSecretsFoundCount(0);
            setFoundSecretIds(new Set());
            setUnboundCurrentUnlocked(false);
            localStorage.removeItem('unboundCurrentSecretsCount');
            localStorage.removeItem('unboundCurrentFoundSecretIds');
            localStorage.removeItem('unboundCurrentUnlocked');
            console.log("Unbound Current secrets reset!");
        }
    };

    return (
        <SecretsContext.Provider value={contextValue}>
            {children}
        </SecretsContext.Provider>
    );
};

// 3. Custom Hook to consume the Context
export const useSecrets = () => {
    const context = useContext(SecretsContext);
    if (context === undefined) {
        throw new Error('useSecrets must be used within a SecretsProvider');
    }
    return context;
};