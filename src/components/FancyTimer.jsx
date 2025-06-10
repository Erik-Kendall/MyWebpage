import React, { useState, useEffect, useRef } from 'react';
import './styles/Timer.css';

const FancyTimer = () => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [initialMinutes, setInitialMinutes] = useState(0);

    const intervalRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds((prevSeconds) => {
                    if (prevSeconds === 0) {
                        if (minutes === 0) {
                            clearInterval(intervalRef.current);
                            setIsActive(false);
                            return 0;
                        }
                        setMinutes((prevMinutes) => prevMinutes - 1);
                        return 59;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        } else if (!isActive && intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, minutes]);

    const handleStartTimer = () => {
        if (!isActive && (minutes > 0 || seconds > 0)) {
            setInitialMinutes(minutes);
            setIsActive(true);
        }
    };

    const handlePauseTimer = () => {
        setIsActive(false);
    };

    const handleResetTimer = () => {
        setIsActive(false);
        setMinutes(initialMinutes);
        setSeconds(0);
    };

    const formatTime = (time) => String(time).padStart(2, '0');

    return (
        <div className="tool-card">
            <h2>Adventure Timer</h2>
            <div className="timer-display">
                {formatTime(minutes)}:{formatTime(seconds)}
            </div>
            <div className="timer-controls">
                <select
                    className="text-input timer-select"
                    value={minutes}
                    onChange={(e) => {
                        setMinutes(parseInt(e.target.value));
                        setIsActive(false);
                    }}
                >
                    {[...Array(61).keys()].map(m => (
                        <option key={m} value={m}>{m} Minutes</option>
                    ))}
                </select>
                <button onClick={handleStartTimer} className="primary-button" disabled={isActive}>Start</button>
                <button onClick={handlePauseTimer} className="secondary-button" disabled={!isActive}>Pause</button>
                <button onClick={handleResetTimer} className="primary-button">Reset</button>
            </div>
            <p className="timer-hint">Great for combat rounds, rest breaks, or dungeon delves!</p>
        </div>
    );
};

export default FancyTimer;