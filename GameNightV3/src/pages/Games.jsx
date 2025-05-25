// src/pages/Games.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../Games.css'; // <-- VERIFY THIS PATH IS CORRECT for your Games.css file
import { useColorblind } from '../contexts/ColorblindContext'; // This import is fine

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

    // Create a ref for the Audio object
    // IMPORTANT: Place your Doom Slayer music file at public/audio/doom-slayer.mp3
    const doomMusic = useRef(new Audio('/audio/doom-slayer.mp3')); // <-- Corrected for public/audio


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
                        if (doomMusic.current) {
                            doomMusic.current.volume = 0.5; // Medium loud volume (0.0 to 1.0)
                            doomMusic.current.loop = true; // Loop the music
                            doomMusic.current.play().catch(e => console.error("Failed to play audio:", e));
                        }
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
            if (doomMusic.current) {
                doomMusic.current.pause();
                doomMusic.current.currentTime = 0;
            }
        };
    }, []);


    useEffect(() => {
        if (!doomVisible && doomMusic.current && !doomMusic.current.paused) {
            doomMusic.current.pause();
            doomMusic.current.currentTime = 0;
        }
    }, [doomVisible]);


    return (
        <section className="games-page">
            <h1>Games</h1>
            <p className="hint-message" style={{ color: '#aaa', fontSize: '0.9em', textAlign: 'center', marginTop: '10px' }}>
                {!doomVisible
                    ? "*There's a secret hidden here for those who know the code...*"
                    : "*Congratulations! You found the secret! Scroll down for your surprise 😜.*"
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
                <div className="game-list">
                    <div className="game-item">
                        <h3>Hero Quest</h3>
                        <p>HeroQuest is a fantasy adventure board game where players take on the roles of iconic heroes – the Barbarian, Dwarf, Elf, and Wizard – to face perilous quests. Guided by a Dungeon Master, the heroes explore a labyrinthine dungeon, battle monstrous foes, discover powerful treasures, and complete objectives. Featuring detailed miniatures, dice-based combat, and a modular board, HeroQuest offers a classic dungeon-crawling experience with a focus on tactical combat and heroic storytelling.</p>
                    </div>

                    <div className="game-item">
                        <h3>Pandemic</h3>
                        <p>In Pandemic, players work together as a team of disease-fighting specialists to stop four deadly diseases from spreading across the globe. As outbreaks occur and infections rage, players must strategically use their unique character abilities, collect sets of city cards to discover cures, and coordinate travel to contain the diseases before they wipe out humanity. It's a cooperative board game known for its challenging gameplay, requiring intense planning and teamwork to overcome the escalating threats.</p>
                    </div>
                </div>
            </div>

            <div className="card-games-section">
                <h2>Card Games</h2>
                <div className="game-list">
                    <div className="game-item">
                        <h3>Exploding Kittens</h3>
                        <p>Exploding Kittens is a highly strategic, kitty-powered version of Russian Roulette. Players draw cards until someone draws an Exploding Kitten, at which point they are out of the game unless they have a Defuse card. The deck is filled with other cards that allow players to move, mitigate, or avoid Exploding Kittens. The game is known for its darkly humorous artwork and quick, unpredictable gameplay, making it suitable for casual play.</p>
                    </div>

                    <div className="game-item">
                        <h3>Epic Spell Wars of the Battle Wizards: Duel at Mt. Skullzfyre</h3>
                        <p>Epic Spell Wars is a game of over-the-top, combative card-slaying where players take on the roles of battle wizards vying to be the last one standing. Players create ridiculous and powerful spells by combining "Source," "Quality," and "Delivery" cards, unleashing devastating attacks, bizarre effects, and grotesque magical mayhem. The game emphasizes humor, chaotic interactions, and a "last wizard standing" mentality, with plenty of bloody imagery and ridiculous outcomes.</p>
                    </div>

                    <div className="game-item">
                        <h3>Joking Hazard</h3>
                        <p>From the creators of Cyanide & Happiness, Joking Hazard is an offensive card game where players complete hilarious and often inappropriate comic strips. Following a simple rule, players draw a panel to create a three-panel comic, aiming for the funniest (or most shocking) outcome. The game thrives on dark humor, unexpected twists, and the collective twisted minds of the players, making for highly replayable and laugh-out-loud moments, often best suited for mature audiences.</p>
                    </div>

                    <div className="game-item">
                        <h3>Magic: The Gathering</h3>
                        <p>Magic: The Gathering is the original collectible card game (CCG) where players assume the role of powerful Planeswalkers, casting spells and summoning creatures to defeat their opponents. Players construct unique decks from a vast array of available cards, each with its own abilities, lore, and strategic implications. Combat revolves around mana resources, creature attacks, and a wide variety of sorceries, instants, and enchantments, leading to deep strategic play and endless deck-building possibilities.</p>
                    </div>
                </div>
            </div>

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

        </section>
    );
}