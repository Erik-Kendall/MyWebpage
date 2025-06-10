// src/components/RandomGenerator.jsx
import React, { useState } from 'react';

function RandomGenerator() {
    const [output, setOutput] = useState('');
    const encounterIdeas = [
        "A band of goblins trying to start a cooking fire with explosive fungi.",
        "A lost merchant begging for escort through a haunted forest.",
        "A mysterious, glowing object humming in the distance.",
        "Two rival cults arguing over who gets to sacrifice the next sheep.",
        "A lone adventurer being chased by a very angry badger.",
        "A broken down warforged begging for oil and spare parts.",
        "A group of well-dressed nobles lost in the sewers."
    ];
    const npcNames = [
        "Elara Whisperwind", "Bartholomew 'Barty' Stout", "Seraphina Shadowbrook",
        "Grizelda Grime", "Kaelen Stonefist", "Lyra Brightmoon", "Zoltan the Unscrupulous"
    ];

    const generateEncounter = () => {
        const randomIndex = Math.floor(Math.random() * encounterIdeas.length);
        setOutput(`Encounter Idea: ${encounterIdeas[randomIndex]}`);
    };

    const generateNPC = () => {
        const randomIndex = Math.floor(Math.random() * npcNames.length);
        setOutput(`NPC Idea: ${npcNames[randomIndex]} - What's their secret?`);
    };

    return (
        <div className="tool-card generator-card">
            <h3>Idea Generator</h3>
            <div className="generator-output">{output || 'Need an idea?'}</div>
            <button onClick={generateEncounter}>Random Encounter</button>
            <button onClick={generateNPC} style={{ marginLeft: '10px' }}>Random NPC</button>
        </div>
    );
}

export default RandomGenerator;