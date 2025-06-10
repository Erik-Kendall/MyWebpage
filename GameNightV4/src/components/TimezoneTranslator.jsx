import React, { useState, useEffect } from 'react';
import './styles/TimezoneTranslator.css';

const TimezoneTranslator = () => {
    const [yourTimezone, setYourTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM format
    const [targetTimezone, setTargetTimezone] = useState('America/Los_Angeles');
    const [convertedTime, setConvertedTime] = useState('');

    const timezones = [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney', 'UTC'
    ];

    useEffect(() => {
        convertTime();
    }, [dateTime, yourTimezone, targetTimezone]);


    const convertTime = () => {
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) {
                setConvertedTime('Invalid Date/Time');
                return;
            }

            const options = {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                timeZoneName: 'short',
                hour12: true,
            };

            const converted = new Intl.DateTimeFormat('en-US', {
                ...options,
                timeZone: targetTimezone
            }).format(date);

            setConvertedTime(converted);
        } catch (e) {
            setConvertedTime('Error converting time.');
            console.error("Time conversion error:", e);
        }
    };

    return (
        <div className="tool-card">
            <h2>Timezone Translator</h2>
            <div className="timezone-group">
                <label className="timezone-label">Your Timezone</label>
                <select
                    className="text-input timezone-select"
                    value={yourTimezone}
                    onChange={(e) => setYourTimezone(e.target.value)}
                >
                    {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>

            <div className="timezone-group">
                <label className="timezone-label">Date and Time in Your Timezone</label>
                <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="text-input datetime-input"
                />
            </div>

            <div className="timezone-group">
                <label className="timezone-label">Convert To Timezone</label>
                <select
                    className="text-input timezone-select"
                    value={targetTimezone}
                    onChange={(e) => setTargetTimezone(e.target.value)}
                >
                    {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>

            <button onClick={convertTime} className="primary-button convert-button">Convert Time</button>
            {convertedTime && <p className="converted-result">Converted: {convertedTime}</p>}
        </div>
    );
};

export default TimezoneTranslator;