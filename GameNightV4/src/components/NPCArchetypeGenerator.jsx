// src/components/NpcArchetypeGenerator.js
import React, { useState } from 'react';
// import './styles/NpcArchetypeGenerator.css'; // REMOVE OR COMMENT OUT THIS LINE

const NpcArchetypeGenerator = () => {
    const [generatedNpc, setGeneratedNpc] = useState(null);

    const personalityTraits = [
        'Loyal', 'Cynical', 'Optimistic', 'Grumpy', 'Curious', 'Shy', 'Boastful', 'Quiet', 'Charismatic'
    ];
    const goals = [
        'Seek revenge for a past wrong', 'Find a lost family heirloom', 'Become famous/infamous',
        'Protect a secret', 'Amass a fortune', 'Discover ancient knowledge', 'Escape a debt',
        'Help those in need', 'Overthrow a tyrant'
    ];
    const professions = [
        'Blacksmith', 'Scholar', 'Mercenary', 'Merchant', 'Guard', 'Bard', 'Fisherman', 'Innkeeper', 'Thief'
    ];
    const quirks = [
        'Always humming a tune', 'Talks to themselves', 'Has a nervous tic', 'Constantly cleans/tidies',
        'Never makes eye contact', 'Obsessed with a specific item', 'Speaks in riddles', 'Has a distinctive laugh'
    ];
    const secrets = [
        'Is secretly nobility', 'Worked for the antagonist', 'Possesses a hidden magical ability',
        'Is not who they seem to be (doppelganger, robot, etc.)', 'Witnessed a major crime',
        'Has a serious illness they hide', 'Stole something valuable', 'Is part of a secret organization'
    ];

    const generateRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const generateNpc = () => {
        setGeneratedNpc({
            personality: generateRandom(personalityTraits),
            goal: generateRandom(goals),
            profession: generateRandom(professions),
            quirk: generateRandom(quirks),
            secret: generateRandom(secrets),
        });
    };

    return (
        <div className="npc-archetype-generator-container tool-card">
            <h2>NPC / Character Archetype Generator</h2> {/* CHANGED FROM H3 TO H2 */}
            <button onClick={generateNpc}>Generate NPC</button>
            {generatedNpc && (
                <div className="generated-output">
                    <h4 className="section-heading">Generated Archetype:</h4> {/* Added section-heading class */}
                    <p>Personality: <span className="result-text">{generatedNpc.personality}</span></p> {/* Added result-text for values */}
                    <p>Goal: <span className="result-text">{generatedNpc.goal}</span></p>
                    <p>Profession: <span className="result-text">{generatedNpc.profession}</span></p>
                    <p>Quirk: <span className="result-text">{generatedNpc.quirk}</span></p>
                    <p>Secret: <span className="result-text">{generatedNpc.secret}</span></p>
                </div>
            )}
        </div>
    );
};

export default NpcArchetypeGenerator;