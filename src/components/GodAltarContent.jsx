// src/components/GodAltarContent.jsx
import React, { useRef, useEffect } from 'react';
// MODIFIED: Import ALL_GOD_DATA (singular)
import { ALL_GOD_DATA } from '../utils/godsData.jsx';
// You might need to adjust Home.css imports or create a specific style for this component
import '../pages/styles/Home.css'; // Assuming Home.css contains styles for .god-content etc.
import AltarOfKhorne from './AltarOfKhorne'; // Re-import AltarOfKhorne for Blood God specific component

// MODIFIED: Accept new props for handling secret clicks
const GodAltarContent = ({ godName, onAltarClick, onSecretTextClick }) => {
    const godData = ALL_GOD_DATA[godName];
    const audioRef = useRef(null); // Ref to control the audio playback

    // Effect to play audio when godName changes
    useEffect(() => {
        if (godData && godData.soundPath && audioRef.current) {
            audioRef.current.currentTime = 0; // Rewind to start
            audioRef.current.play().catch(error => {
                console.warn(`Audio autoplay blocked for ${godName} (${godData.soundPath}):`, error);
                // No need to add to playedGodSounds here; Home.jsx handles this on successful play.
            });
        } else if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [godData]); // Re-run this effect when godData changes (i.e., godName changes)

    if (!godData) {
        return <div className="god-content">No content found for "{godName}"</div>;
    }

    // Helper function to render text and make specific words clickable for "Ancient Tome"
    const renderChantWithSecrets = (chantText, secretWords, onSecretTextClick) => {
        if (!secretWords || !onSecretTextClick) {
            return <p>{chantText}</p>; // Render as normal if no secret words or handler
        }

        const parts = [];
        let lastIndex = 0;

        // Iterate over each secret word to find and mark them
        secretWords.forEach(({ word, className }) => {
            const regex = new RegExp(`\\b(${word})\\b`, 'gi'); // Use word boundaries (\\b) and global/case-insensitive flags
            let match;
            while ((match = regex.exec(chantText)) !== null) {
                // Add text before the match
                if (match.index > lastIndex) {
                    parts.push(<React.Fragment key={`text-${lastIndex}`}>{chantText.substring(lastIndex, match.index)}</React.Fragment>);
                }
                // Add the clickable secret word
                parts.push(
                    <span
                        key={`secret-${match.index}`}
                        className={className}
                        onClick={onSecretTextClick} // Pass the event object to Home.jsx
                        data-secret-word={word} // Identify which word was clicked
                        style={{ cursor: 'pointer', textDecoration: 'underline' }} // Basic styling for clickable text
                    >
                        {match[0]}
                    </span>
                );
                lastIndex = regex.lastIndex;
            }
        });

        // Add any remaining text after the last match
        if (lastIndex < chantText.length) {
            parts.push(<React.Fragment key={`text-${lastIndex}`}>{chantText.substring(lastIndex)}</React.Fragment>);
        }

        return <p style={{ fontWeight: 'bold' }}>{parts}</p>;
    };

    return (
        // MODIFIED: Add onClick for "The Unseen Hand" secret
        <div
            className="god-altar-container"
            onClick={onAltarClick} // This will trigger the altar click counter in Home.jsx
            style={{
                backgroundColor: godData.backgroundColor,
                color: godData.color,
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: godData.border || 'none', // Use border from data if available
                boxShadow: godData.boxShadow || 'none' // Use boxShadow from data if available
            }}
        >
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: godName === "Blood God" ? '#ffaaaa' : 'inherit' }}>
                    {godData.title}
                </h2>
                {/* Conditionally render chant based on godName for secret words */}
                {godName === "Blood God" ? (
                    renderChantWithSecrets(godData.chant, godData.secretWords, onSecretTextClick)
                ) : (
                    <p style={{ fontStyle: godData.chantStyle || 'italic' }}>{godData.chant}</p>
                )}
                <p>{godData.description1}</p>
                <p>{godData.description2}</p>
                {godData.description3 && <p>{godData.description3}</p>}
            </div>

            {/* Render AltarOfKhorne only for Blood God, otherwise render general image */}
            {godName === "Blood God" && <AltarOfKhorne />}
            {godData.imagePath && godName !== "Blood God" && ( // Ensure AltarOfKhorne is not rendered if there's an image
                <div
                    style={{
                        flexGrow: 1,
                        backgroundImage: `url(${godData.imagePath})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: `rgba(0, 0, 0, 0.2)`, // Generic overlay
                        borderRadius: '4px',
                    }}></div>
                </div>
            )}

            {/* Audio element for God sounds for "The Divine Harmony" secret */}
            {godData.soundPath && (
                <audio ref={audioRef} src={godData.soundPath} preload="auto" />
            )}
        </div>
    );
};

export default GodAltarContent;