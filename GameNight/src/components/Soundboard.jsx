// src/components/Soundboard.jsx
import React, { useState, useRef } from 'react';

function Soundboard() {
    // Define your sound effects.
    // The 'src' should be relative to the 'public' folder.
    const soundEffects = [
        { id: 'sword_clash', name: 'Sword Clash', src: '/sounds/sword_clash.mp3' },
        { id: 'door_creak', name: 'Door Creak', src: '/sounds/door_creak.mp3' },
        { id: 'monster_roar', name: 'Monster Roar', src: '/sounds/monster_roar.mp3' },
        { id: 'fanfare', name: 'Fanfare', src: '/sounds/fanfare.mp3' },
        { id: 'footsteps', name: 'Footsteps', src: '/sounds/footsteps.mp3' },
        // Add more sound effects here!
        // { id: 'spell_cast', name: 'Spell Cast', src: '/sounds/spell_cast.mp3' },
        // { id: 'treasure_chime', name: 'Treasure Chime', src: '/sounds/treasure_chime.mp3' },
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