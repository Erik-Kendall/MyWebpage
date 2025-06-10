// src/hooks/useGameNightCountdown.js
import { useState, useEffect } from 'react';

const useGameNightCountdown = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        // Correctly calculate next Friday 5 PM CDT (UTC-5)
        // This is a more robust way to handle time zones and next occurrences.
        const calculateNextGameNight = () => {
            const now = new Date(); // Current time (local)
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00:00 local

            let nextFriday = new Date(today);
            nextFriday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7); // Calculate next Friday

            // Set to 5 PM local time
            nextFriday.setHours(17, 0, 0, 0);

            // If it's already Friday and past 5 PM, target next week's Friday
            if (now.getDay() === 5 && now.getHours() >= 17) {
                nextFriday.setDate(nextFriday.getDate() + 7);
            }

            return nextFriday;
        };

        const updateTimer = () => {
            const now = new Date();
            const nextGameNight = calculateNextGameNight();
            const diffMs = nextGameNight - now;

            if (diffMs <= 0) {
                setTimeLeft('Game Night is on now!');
                return;
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            const seconds = Math.floor((diffMs / 1000) % 60); // Added seconds for precision

            setTimeLeft(
                `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
            );
        };

        updateTimer(); // Initial call
        const timerId = setInterval(updateTimer, 1000); // Update every second

        return () => clearInterval(timerId); // Cleanup
    }, []); // Empty dependency array means this runs once on mount

    return timeLeft;
};

export default useGameNightCountdown;