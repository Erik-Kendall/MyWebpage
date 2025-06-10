// src/components/NameGenerator.js
import React, { useState } from 'react';
// import './styles/NameGenerator.css'; // REMOVE OR COMMENT OUT THIS LINE

const NameGenerator = () => {
    const [nameCategory, setNameCategory] = useState('fantasy-human');
    const [generatedName, setGeneratedName] = useState('');

    const nameData = {
        'fantasy-human': [
            'Aerion', 'Elara', 'Thorne', 'Lysandra', 'Kaelen', 'Seraphina', 'Gareth', 'Rhys'
        ],
        'fantasy-elf': [
            'Faelar', 'Lyraen', 'Aerion', 'Sylas', 'Elara', 'Eldrin', 'Oriana', 'Valen'
        ],
        'sci-fi-human': [
            'Jax', 'Kira', 'Zane', 'Anya', 'Caleb', 'Nova', 'Ryder', 'Sierra'
        ],
        'sci-fi-alien': [
            'Xylar', 'Zorblax', 'Gronk', 'Flixta', 'Kaelo', 'Vorgon', 'Zephyr'
        ],
        'town-name': [
            'Oakhaven', 'Stonebridge', 'Silverwood', 'Blackwater', 'Thornwood', 'Fairhaven', 'Ironpeak'
        ],
        'weapon-name': [
            'Soulreaper', 'Stardrinker', 'Whisperwind', 'Grimfang', 'Sunstone', 'Moonblade', 'Voidpiercer'
        ]
    };

    const generateName = () => {
        const names = nameData[nameCategory];
        if (names && names.length > 0) {
            const randomIndex = Math.floor(Math.random() * names.length);
            setGeneratedName(names[randomIndex]);
        } else {
            setGeneratedName('No names found for this category.');
        }
    };

    return (
        <div className="name-generator-container tool-card">
            <h2>Name Generator</h2> {/* CHANGED FROM H3 TO H2 */}
            <div className="input-group">
                <label htmlFor="name-category">Category:</label>
                <select id="name-category" value={nameCategory} onChange={(e) => setNameCategory(e.target.value)}>
                    <option value="fantasy-human">Fantasy Human</option>
                    <option value="fantasy-elf">Fantasy Elf</option>
                    <option value="sci-fi-human">Sci-Fi Human</option>
                    <option value="sci-fi-alien">Sci-Fi Alien</option>
                    <option value="town-name">Town Name</option>
                    <option value="weapon-name">Weapon Name</option>
                </select>
            </div>
            <button onClick={generateName}>Generate Name</button>
            {generatedName && (
                <div className="generated-output">
                    <p className="result-text">{generatedName}</p> {/* Added result-text class */}
                </div>
            )}
        </div>
    );
};

export default NameGenerator;