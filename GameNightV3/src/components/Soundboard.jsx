// src/components/Soundboard.jsx
import React, { useState, useRef } from 'react';

function Soundboard() {
    // Define your sound effects.
    // The 'src' should be relative to the 'public' folder.
    const soundEffects = [
        { id: 'sword_clash', name: 'Sword Clash', src: '/audio/sword_clash.mp3' },
        { id: 'door_creak', name: 'Door Creak', src: '/audio/door_creak.mp3' },
        { id: 'monster_roar', name: 'Monster Roar', src: '/audio/monster_roar.mp3' },
        { id: 'fanfare', name: 'Fanfare', src: './audio/fanfare.mp3' },
        { id: 'footsteps', name: 'Footsteps', src: '/audio/footsteps.mp3' },
        { id: 'dice_roll', name: 'Dice Roll', src: '/audio/dice_roll.mp3' },
        { id: 'card_shuffle', name: 'Card Shuffle', src: '/audio/card_shuffle.mp3' },
        { id: 'victory_jingle', name: 'Victory Jingle', src: '/audio/victory_jingle.mp3' },
        { id: 'game_over', name: 'Game Over', src: '/audio/game_over.mp3' },
        { id: 'crowd_cheer', name: 'Crowd Cheer', src: '/audio/crowd_cheer.mp3' },
        // --- NEW SOUND EFFECTS ADDED BELOW ---
        { id: 'spell_cast', name: 'Spell Cast', src: '/audio/spell_cast.mp3' },
        { id: 'heal', name: 'Heal', src: '/audio/heal.mp3' },
        { id: 'level_up', name: 'Level Up', src: '/audio/level_up.mp3' },
        { id: 'item_collect', name: 'Item Collect', src: '/audio/item_collect.mp3' },
        { id: 'coin', name: 'Coin', src: '/audio/coin.mp3' },
        { id: 'explosion', name: 'Explosion', src: '/audio/explosion.mp3' },
        { id: 'punch', name: 'Punch', src: '/audio/punch.mp3' },
        { id: 'jump', name: 'Jump', src: '/audio/jump.mp3' },
        { id: 'ui_click', name: 'UI Click', src: '/audio/ui_click.mp3' },
        { id: 'whoosh', name: 'Whoosh', src: '/audio/whoosh.mp3' },
    ];

    // useRef is good for directly interacting with DOM elements or persistent values
    // that don't cause a re-render when they change. Here, it's used to store Audio objects.
    const audioPlayers = useRef({}); // Stores Audio objects for each sound

    // State to track which sound is currently playing (optional, for visual feedback)
    const [playingSoundId, setPlayingSoundId] = useState(null);

    const playSound = (soundId) => {
        const sound = soundEffects.find(s => s.id === soundId);
        if (!sound) return;

        // Create or get the Audio object
        if (!audioPlayers.current[soundId]) {
            audioPlayers.current[soundId] = new Audio(sound.src);
            // Optional: Listen for when the sound ends
            audioPlayers.current[soundId].onended = () => {
                if (playingSoundId === soundId) {
                    setPlayingSoundId(null);
                }
            };
        }

        const audio = audioPlayers.current[soundId];

        // Stop if it's already playing and restart (or just play if not)
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0; // Rewind to start
        }

        audio.play().then(() => {
            setPlayingSoundId(soundId); // Set state to show it's playing
        }).catch(error => {
            console.error(`Error playing sound ${sound.name}:`, error);
            setPlayingSoundId(null);
        });
    };

    return (
        <div className="tool-card soundboard-card">
            <h3>Soundboard</h3>
            <div className="sound-buttons-grid">
                {soundEffects.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => playSound(sound.id)}
                        className={`sound-button ${playingSoundId === sound.id ? 'playing' : ''}`}
                    >
                        {sound.name}
                        {playingSoundId === sound.id && <span className="playing-indicator"> ▶</span>}
                    </button>
                ))}
            </div>
            <p className="soundboard-tip">Click a button to play a sound effect!</p>
        </div>
    );
}

export default Soundboard;
