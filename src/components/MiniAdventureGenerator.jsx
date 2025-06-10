// src/components/MiniAdventureGenerator.js
import React, { useState } from 'react';
// import './styles/MiniAdventureGenerator.css'; // REMOVE OR COMMENT OUT THIS LINE

const MiniAdventureGenerator = () => {
    const [generatedAdventure, setGeneratedAdventure] = useState(null);

    const hooks = [
        'A mysterious message arrives, delivered by a frantic stranger.',
        'A valuable item has been stolen from a local dignitary.',
        'Strange sounds are emanating from the abandoned mines.',
        'A group of travelers has gone missing on a familiar route.',
        'A local festival is interrupted by an unexpected event.',
        'A bountiful harvest has suddenly withered and died.',
        'Someone close to the party is acting strangely.'
    ];

    const challenges = [
        'Overcome a dangerous creature or group of foes.',
        'Navigate a hazardous environment or trap-filled dungeon.',
        'Solve a complex riddle or puzzle.',
        'Outwit a cunning rival or saboteur.',
        'Retrieve a well-guarded artifact.',
        'Protect a vulnerable person or place.',
        'Uncover a hidden conspiracy.'
    ];

    const locations = [
        'deep within an ancient, forgotten ruin.',
        'in a bustling but treacherous market district.',
        'at the heart of a remote, mist-shrouded swamp.',
        'within a high-security arcane research facility.',
        'inside a seemingly quaint but secretly sinister village.',
        'on a desolate, wind-swept plateau.',
        'underneath a thriving, peaceful city.'
    ];

    const objectivesOrTwists = [
        'The true mastermind is someone the party trusts.',
        'The stolen item is not what it seems, and has a hidden power.',
        'The missing travelers were lured away by an illusion.',
        'The mysterious message was a trap set by a rival.',
        'The "creature" is actually a desperate, misunderstood being.',
        'Solving the puzzle reveals a new, greater threat.',
        'The easy objective hides a moral dilemma.'
    ];

    const generateRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const generateAdventure = () => {
        setGeneratedAdventure({
            hook: generateRandom(hooks),
            challenge: generateRandom(challenges),
            location: generateRandom(locations),
            objectiveOrTwist: generateRandom(objectivesOrTwists),
        });
    };

    return (
        <div className="mini-adventure-generator-container tool-card">
            <h2>Mini-Adventure Outline Generator</h2> {/* CHANGED FROM H3 TO H2 */}
            <button onClick={generateAdventure}>Generate Adventure</button>
            {generatedAdventure && (
                <div className="generated-output">
                    <h4 className="section-heading">Adventure Outline:</h4> {/* Added section-heading class */}
                    <p><strong>Hook:</strong> <span className="result-text">{generatedAdventure.hook}</span></p> {/* Added result-text for values */}
                    <p><strong>Challenge:</strong> The party must <span className="result-text">{generatedAdventure.challenge.toLowerCase()}</span></p>
                    <p><strong>Location:</strong> This all takes place <span className="result-text">{generatedAdventure.location}</span></p>
                    <p><strong>Twist/Objective:</strong> <span className="result-text">{generatedAdventure.objectiveOrTwist}</span></p>
                </div>
            )}
        </div>
    );
};

export default MiniAdventureGenerator;