// src/components/FancyTimer.jsx
import React, { useState, useEffect } from 'react';

function FancyTimer() {
    const [duration, setDuration] = useState(0); // in seconds
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [inputMinutes, setInputMinutes] = useState('');

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Optionally play a sound or show an alert when timer finishes
            alert("Time's up! Roll initiative!");
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        const minutes = parseInt(inputMinutes, 10);
        if (isNaN(minutes) || minutes <= 0) {
            alert("Please enter a valid number of minutes.");
            return;
        }
        setDuration(minutes * 60);
        setTimeLeft(minutes * 60);
        setIsActive(true);
    };

    const handleStop = () => {
        setIsActive(false);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(0);
        setDuration(0);
        setInputMinutes('');
    };

    return (
        <div className="tool-card fancy-timer-card">
            <h3>Adventure Timer</h3>
            <div className="timer-display">
                {formatTime(timeLeft)}
            </div>
            <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                placeholder="Minutes"
                min="1"
                className="timer-input"
                disabled={isActive}
            />
            <div className="timer-controls">
                <button onClick={handleStart} disabled={isActive}>Start</button>
                <button onClick={handleStop} disabled={!isActive}>Pause</button>
                <button onClick={handleReset}>Reset</button>
            </div>
            <p className="timer-tip">Great for combat rounds, rest breaks, or dungeon delves!</p>
        </div>
    );
}

export default FancyTimer;