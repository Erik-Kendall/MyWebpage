// src/components/WeatherEnvironmentGenerator.js
import React, { useState } from 'react';
// import './styles/WeatherEnvironmentGenerator.css'; // REMOVE OR COMMENT OUT THIS LINE

const WeatherEnvironmentGenerator = () => {
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [environmentType, setEnvironmentType] = useState('any'); // e.g., 'forest', 'city', 'desert'

    const weatherConditions = [
        'Clear skies, gentle breeze', 'Light rain, overcast', 'Heavy downpour, strong winds',
        'Misty, cool', 'Scorching sun, still air', 'Blizzard, freezing temperatures',
        'Foggy, silent', 'Thunderstorm, oppressive humidity', 'Overcast, cold'
    ];

    const timeOfDayOptions = [
        'Early morning (dawn)', 'Mid-morning', 'High noon', 'Late afternoon',
        'Dusk', 'Night (new moon)', 'Night (full moon)', 'Midnight'
    ];

    const environmentDetails = {
        any: [
            'Sounds of distant wildlife', 'A faint, earthy smell', 'The distant hum of machinery',
            'Silence broken only by the wind', 'A peculiar shimmer in the air'
        ],
        forest: [
            'Rustling leaves underfoot', 'The scent of damp earth and pine', 'Birdsong filling the air',
            'Sunlight dappling through the canopy', 'Thick undergrowth making passage difficult'
        ],
        city: [
            'Distant city hum and traffic', 'Smell of pollution mixed with street food', 'Crowds bustling by',
            'Bright neon lights illuminating the streets', 'The clatter of distant construction'
        ],
        desert: [
            'Fine sand blowing across the ground', 'Intense dry heat', 'Mirages shimmering on the horizon',
            'The vast, empty silence', 'Rocky outcrops casting long shadows'
        ],
        mountains: [
            'Thin, crisp air', 'Echoes bouncing between peaks', 'Stunning panoramic views',
            'Steep, treacherous paths', 'Distant snow-capped summits'
        ]
    };

    const generateRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const generateDescription = () => {
        const weather = generateRandom(weatherConditions);
        const time = generateRandom(timeOfDayOptions);
        const details = generateRandom(environmentDetails[environmentType] || environmentDetails['any']);

        setGeneratedDescription(
            `${weather}, ${time}. ${details}.`
        );
    };

    return (
        <div className="weather-environment-generator-container tool-card">
            <h2>Weather & Environment Generator</h2> {/* CHANGED FROM H3 TO H2 */}
            <div className="input-group">
                <label htmlFor="environment-type">Environment Type:</label>
                <select id="environment-type" value={environmentType} onChange={(e) => setEnvironmentType(e.target.value)}>
                    <option value="any">Any / General</option>
                    <option value="forest">Forest</option>
                    <option value="city">City</option>
                    <option value="desert">Desert</option>
                    <option value="mountains">Mountains</option>
                </select>
            </div>
            <button onClick={generateDescription}>Generate Scene</button>
            {generatedDescription && (
                <div className="generated-output">
                    <p className="result-text">{generatedDescription}</p> {/* Added result-text class */}
                </div>
            )}
        </div>
    );
};

export default WeatherEnvironmentGenerator;