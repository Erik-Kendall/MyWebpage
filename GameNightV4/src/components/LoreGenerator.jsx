// src/components/LoreGenerator.js
import React, { useState } from 'react';
// import './styles/LoreGenerator.css'; // REMOVE OR COMMENT OUT THIS LINE

const LoreGenerator = () => {
    const [keywords, setKeywords] = useState('');
    const [generatedLore, setGeneratedLore] = useState('');
    const [category, setCategory] = useState('general'); // e.g., 'general', 'npc', 'location', 'plot'

    const generateLore = () => {
        const examplePrompts = {
            general: [
                `An ancient artifact found in a forgotten temple.`,
                `The true history of the fallen kingdom.`,
                `A strange phenomenon occurring in the whispering woods.`,
                `The secret society that controls the city's underworld.`
            ],
            npc: [
                `A seasoned mercenary with a hidden past.`,
                `A eccentric inventor obsessed with a rare material.`,
                `The quiet librarian who knows more than they let on.`,
                `A noble with a surprising criminal connection.`
            ],
            location: [
                `A bustling port city built on the ruins of a magical disaster.`,
                `A desolate mountain pass rumored to be haunted.`,
                `An enchanted forest where time moves differently.`,
                `A floating island inhabited by reclusive scholars.`
            ],
            plot: [
                `A mysterious plague begins to spread, but its origin is not natural.`,
                `Someone is systematically stealing magical knowledge.`,
                `A long-lost prophecy suddenly starts to come true.`,
                `The discovery of a new resource threatens a fragile peace.`
            ]
        };

        const currentPrompts = examplePrompts[category];
        const randomIndex = Math.floor(Math.random() * currentPrompts.length);
        let loreOutput = currentPrompts[randomIndex];

        if (keywords.trim() !== '') {
            loreOutput += ` (Keywords: ${keywords.trim()})`;
        }

        setGeneratedLore(loreOutput);
    };

    return (
        <div className="lore-generator-container tool-card">
            <h2>Lore Generator</h2> {/* CHANGED FROM H3 TO H2 */}
            <div className="input-group">
                <label htmlFor="lore-category">Category:</label>
                <select id="lore-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="general">General</option>
                    <option value="npc">NPC Backstory</option>
                    <option value="location">Location Description</option>
                    <option value="plot">Plot Hook</option>
                </select>
            </div>
            <div className="input-group">
                <label htmlFor="keywords">Keywords (optional):</label>
                <input
                    type="text"
                    id="keywords"
                    placeholder="e.g., ancient, ruin, magic"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                />
            </div>
            <button onClick={generateLore}>Generate Lore</button>
            {generatedLore && (
                <div className="generated-output">
                    <p>{generatedLore}</p>
                </div>
            )}
        </div>
    );
};

export default LoreGenerator;