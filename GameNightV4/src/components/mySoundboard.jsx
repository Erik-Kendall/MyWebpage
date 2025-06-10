import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/MySoundboard.css'; // Dedicated CSS for MySoundboard

const BASE_URL = 'http://localhost:3001'; // Your backend server's URL

// All available sounds that can be dragged.
// Add all your sound effects here, categorized as you wish for selection.
const allAvailableSounds = [
    // Combat
    { id: 'sc-sword', name: 'Sword Clash', file: '/sounds/sword_clash.mp3', category: 'Combat' },
    { id: 'sc-exp', name: 'Explosion', file: '/sounds/explosion.mp3', category: 'Combat' },
    { id: 'sc-punch', name: 'Punch', file: '/sounds/punch.mp3', category: 'Combat' },
    { id: 'sc-arrow', name: 'Arrow Woosh', file: '/sounds/arrow_woosh.mp3', category: 'Combat' },
    { id: 'sc-shield', name: 'Shield Block', file: '/sounds/shield_block.mp3', category: 'Combat' },

    // Environment
    { id: 'se-door', name: 'Door Creak', file: '/sounds/door_creak.mp3', category: 'Environment' },
    { id: 'se-foot', name: 'Footsteps', file: '/sounds/footsteps.mp3', category: 'Environment' },
    { id: 'se-roar', name: 'Monster Roar', file: '/sounds/monster_roar.mp3', category: 'Environment' },
    { id: 'se-rain', name: 'Rain', file: '/sounds/rain.mp3', category: 'Environment' },
    { id: 'se-forest', name: 'Forest Birds', file: '/sounds/forest_birds.mp3', category: 'Environment' },

    // UI/Feedback
    { id: 'sui-fanfare', name: 'Fanfare', file: '/sounds/fanfare.mp3', category: 'UI/Feedback' },
    { id: 'sui-victory', name: 'Victory Jingle', file: '/sounds/victory_jingle.mp3', category: 'UI/Feedback' },
    { id: 'sui-gameover', name: 'Game Over', file: '/sounds/game_over.mp3', category: 'UI/Feedback' },
    { id: 'sui-coin', name: 'Coin', file: '/sounds/coin.mp3', category: 'UI/Feedback' },
    { id: 'sui-levelup', name: 'Level Up', file: '/sounds/level_up.mp3', category: 'UI/Feedback' },
    { id: 'sui-item', name: 'Item Collect', file: '/sounds/item_collect.mp3', category: 'UI/Feedback' },
    { id: 'sui-click', name: 'UI Click', file: '/sounds/ui_click.mp3', category: 'UI/Feedback' },
    { id: 'sui-whoosh', name: 'Whoosh', file: '/sounds/whoosh.mp3', category: 'UI/Feedback' },
    { id: 'sui-jump', name: 'Jump', file: '/sounds/jump.mp3', category: 'UI/Feedback' },

    // Game Mechanics
    { id: 'sgm-dice', name: 'Dice Roll', file: '/sounds/dice_roll.mp3', category: 'Game Mechanics' },
    { id: 'sgm-card', name: 'Card Shuffle', file: '/sounds/card_shuffle.mp3', category: 'Game Mechanics' },

    // Magic/Fantasy
    { id: 'sm-spell', name: 'Spell Cast', file: '/sounds/spell_cast.mp3', category: 'Magic/Fantasy' },
    { id: 'sm-heal', name: 'Heal', file: '/sounds/heal.mp3', category: 'Magic/Fantasy' },
    { id: 'sm-crowd', name: 'Crowd Cheer', file: '/sounds/crowd_cheer.mp3', category: 'Magic/Fantasy' },
    { id: 'sm-fireball', name: 'Fireball', file: '/sounds/fireball.mp3', category: 'Magic/Fantasy' },
    { id: 'sm-teleport', name: 'Teleport', file: '/sounds/teleport.mp3', category: 'Magic/Fantasy' },
    { id: 'sm-mystic', name: 'Mystic Hum', file: '/sounds/mystic_hum.mp3', category: 'Magic/Fantasy' },
];

// Modified MySoundboard to accept and apply the className prop
const MySoundboard = ({ className }) => { // Accept className as a prop
    // Custom sounds, loaded from localStorage
    const [mySounds, setMySounds] = useState(() => {
        const savedSounds = localStorage.getItem('myCustomSoundboard');
        return savedSounds ? JSON.parse(savedSounds) : [];
    });

    // Available sounds display based on category filter
    const [availableCategory, setAvailableCategory] = useState('All');
    const categories = ['All', ...new Set(allAvailableSounds.map(sound => sound.category))];

    const audioPlayers = useRef({});

    // Initialize audio players and update localStorage
    useEffect(() => {
        // Initialize all available sounds once for efficient playback
        allAvailableSounds.forEach(sound => {
            if (!audioPlayers.current[sound.id]) { // Use sound.id as unique key
                const fullPath = `${BASE_URL}${sound.file}`;
                audioPlayers.current[sound.id] = new Audio(fullPath);
                audioPlayers.current[sound.id].preload = 'auto';
            }
        });

        // Save mySounds to localStorage whenever it changes
        localStorage.setItem('myCustomSoundboard', JSON.stringify(mySounds));

        // Cleanup: pause and clear audio objects on unmount (less critical here as all sounds are preloaded)
        return () => {
            for (const key in audioPlayers.current) {
                if (audioPlayers.current[key]) {
                    audioPlayers.current[key].pause();
                    audioPlayers.current[key].src = '';
                    delete audioPlayers.current[key];
                }
            }
        };
    }, [mySounds]); // Depend on mySounds to update localStorage, but audioPlayers initialization is stable

    const playSound = useCallback((soundId) => {
        const audio = audioPlayers.current[soundId];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                if (error.name === "NotAllowedError" || error.name === "AbortError") {
                    // Browser may be blocking autoplay. User interaction is required.
                }
            });
        }
    }, []); // Memoize playSound to prevent re-renders when passed to children

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e, soundId) => {
        e.dataTransfer.setData("soundId", soundId);
        e.dataTransfer.effectAllowed = "copy"; // Or 'move' if you want to remove from source immediately
    };

    const handleDropOnMyBoard = (e) => {
        e.preventDefault();
        const soundId = e.dataTransfer.getData("soundId");
        const droppedSound = allAvailableSounds.find(s => s.id === soundId);

        if (droppedSound && !mySounds.some(s => s.id === droppedSound.id)) {
            setMySounds(prevMySounds => [...prevMySounds, droppedSound]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Essential to allow drop
        e.dataTransfer.dropEffect = "copy";
    };

    const handleRemoveSound = (soundId) => {
        setMySounds(prevMySounds => prevMySounds.filter(s => s.id !== soundId));
    };

    const filteredAvailableSounds = availableCategory === 'All'
        ? allAvailableSounds
        : allAvailableSounds.filter(sound => sound.category === availableCategory);

    return (
        // Apply the className prop to the outermost div, combining it with existing classes
        <div className={`tool-card my-soundboard-card ${className || ''}`}>
            <h2>My Soundboard</h2>
            <p className="subtitle">Drag sounds from below to build your custom board!</p>

            <div
                className="my-soundboard-grid"
                onDrop={handleDropOnMyBoard}
                onDragOver={handleDragOver}
            >
                {mySounds.length === 0 ? (
                    <p className="empty-message">Drag sounds here to add them to your custom soundboard.</p>
                ) : (
                    mySounds.map(sound => (
                        <div key={sound.id} className="my-sound-button-wrapper">
                            <button
                                onClick={() => playSound(sound.id)}
                                className="my-sound-button"
                                title={sound.name}
                            >
                                {sound.name}
                            </button>
                            <button
                                onClick={() => handleRemoveSound(sound.id)}
                                className="remove-my-sound-button"
                                title="Remove from My Soundboard"
                            >
                                &times;
                            </button>
                        </div>
                    ))
                )}
            </div>

            <h3 className="available-sounds-heading">Available Sounds</h3>
            <div className="available-categories">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-button ${availableCategory === category ? 'active' : ''}`}
                        onClick={() => setAvailableCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="available-sounds-grid">
                {filteredAvailableSounds.map(sound => (
                    <button
                        key={sound.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sound.id)}
                        onClick={() => playSound(sound.id)} // Allow click to play from available list
                        className="available-sound-button"
                        title={`Drag to My Soundboard: ${sound.name}`}
                    >
                        {sound.name}
                    </button>
                ))}
            </div>
            <p className="hint-text">*Your custom soundboard layout is saved in this browser.</p>
        </div>
    );
};

export default MySoundboard;