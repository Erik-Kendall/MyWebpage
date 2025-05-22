// src/pages/Games.jsx
import React, { useState, useEffect } from 'react';
import '../App.css';
import { useColorblind } from '../contexts/ColorblindContext';

// Define the Konami Code sequence (using KeyboardEvent.key values)
const KONAMI_CODE = [
    'arrowup', 'arrowup',
    'arrowdown', 'arrowdown',
    'arrowleft', 'arrowright',
    'arrowleft', 'arrowright',
    'b', 'a', 'enter'
];

export default function Games() {
    const { colorblindMode } = useColorblind();

    const [doomVisible, setDoomVisible] = useState(false);
    const [konamiSequence, setKonamiSequence] = useState([]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const keyPressed = event.key.toLowerCase();

            // Prevent default browser actions for these keys if they are part of the code
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'b', 'a', 'enter'].includes(keyPressed)) {
                event.preventDefault();
            }

            setKonamiSequence(prevSequence => {
                if (keyPressed === KONAMI_CODE[prevSequence.length]) {
                    const newSequence = [...prevSequence, keyPressed];
                    if (newSequence.length === KONAMI_CODE.length) {
                        setDoomVisible(true);
                    }
                    return newSequence;
                } else {
                    if (keyPressed === KONAMI_CODE[0]) {
                        return [keyPressed];
                    } else {
                        return [];
                    }
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <section className="games-page">
            <h1>Games</h1>
            {/* MODIFIED: This paragraph now changes its text content */}
            <p className="hint-message" style={{ color: '#aaa', fontSize: '0.9em', textAlign: 'center', marginTop: '10px' }}>
                {!doomVisible // If Doom is NOT visible, show the hint
                    ? "*There's a secret hidden here for those who know the code...*"
                    : "*Congratulations! You found the secret! Scroll down for your surprise 😜.*" // Otherwise, show the congratulations
                }
            </p>

            <div className="ttrpg-section">
                <h2>Tabletop Role-Playing Games</h2>
                <div className="game-list">
                    <div className="game-item">
                        <h3>Fools Gold (D&D 5e Module/World)</h3>
                        <p>Venture into the Bellowing Wilds of Fools Gold, a unique D&D 5th Edition campaign setting brought to life by a passionate YouTube group and funded on Kickstarter. This world diverges from typical D&D settings, offering its own distinct lore, intriguing locations, and potentially modified rules to enhance the gameplay experience. Expect a world brimming with adventure, crafted by the creators' vision and shaped by their community. The system is designed to play through an action movie-style story in which the action sequences become increasingly more outlandish.</p>
                    </div>

                    <div className="game-item">
                        <h3>Anima: Beyond Fantasy</h3>
                        <p>Experience the intricate and anime-inspired world of Anima: Beyond Fantasy, a tabletop RPG with a system all its own, though often noted for its depth akin to Pathfinder. Immerse yourself in the richly detailed world of Gaïa, where magic and psychic powers are potent forces. Create highly customizable characters through a vast array of classes and skills, and engage in tactical combat where Ki abilities and strategic maneuvers are key. If you enjoy deep character customization and epic, story-driven campaigns with a touch of Japanese RPG flair, Anima offers a compelling experience.</p>
                    </div>

                    <div className="game-item">
                        <h3>Never Stop Blowing Up (Dimension 20)</h3>
                        <p>From the mind of Brennan Lee Mulligan and featured on Dimension 20, <em>Never Stop Blowing Up</em> is a TTRPG inspired by <em>Kids on Bikes</em>, designed to emulate the over-the-top action of 80s and 90s action movies. This rules-light system focuses on collaborative storytelling, where players take on the roles of unlikely action heroes. A key mechanic involves 'blowing up' your stats to increase their dice size, leading to increasingly ridiculous and powerful abilities. Expect a fast-paced, comedic, and explosive experience where players might even get to take over the GM seat for short bursts of time.</p>
                    </div>

                    <div className="game-item">
                        <h3>Rogue Trader (Warhammer 40,000)</h3>
                        <p>Journey to the grim darkness of the far future with Rogue Trader, the original tabletop role-playing game that first defined the Warhammer 40,000 universe. Take on the role of a charismatic Rogue Trader and their diverse retinue as they venture into the uncharted void beyond the Imperium. Explore new worlds, engage in interstellar trade and diplomacy (or conflict!), and manage your powerful voidship. Expect grand-scale adventures filled with exploration, danger, and the unique blend of science fiction and gothic horror that defines the 40k setting.</p>
                    </div>
                </div>
            </div>

            <div className="board-games-section">
                <h2>Board Games</h2>
                <p>Information about board games will go here.</p>
            </div>

            <div className="card-games-section">
                <h2>Card Games</h2>
                <p>Information about card games will go here.</p>
            </div>

            {/* --- Conditionally Rendered Doom Game --- */}
            {doomVisible && (
                <>
                    <hr style={{ margin: '3rem 0', borderColor: '#444' }} />
                    <div className="doom-embed-container">
                        <h2>Play The Ultimate Doom</h2>
                        <p>Blast your way through classic demon-infested levels right in your browser!</p>
                        <iframe
                            src="https://thedoggybrad.github.io/doom_on_js-dos/"
                            width="800"
                            height="600"
                            style={{ border: 'none' }}
                            title="Doom in Browser"
                            allowFullScreen
                        />
                    </div>
                </>
            )}
            {/* --- End Conditionally Rendered Doom Game --- */}

        </section>
    );
}