// src/components/AltarOfKhorne.jsx
import React, { useRef } from 'react'; // <--- MODIFIED: Import useRef
// No need for useNavigate if we're not navigating to a new page
// import { useNavigate } from 'react-router-dom';

function AltarOfKhorne() {
    // const navigate = useNavigate(); // REMOVED: No longer needed for navigation

    const khorneAudioRef = useRef(null); // <--- NEW: Create a ref for the audio element

    const handleButtonClick = () => {
        // REMOVED: navigate('/khorne-laughs');
        // <--- NEW: Play Khorne's laugh directly
        if (khorneAudioRef.current) {
            khorneAudioRef.current.currentTime = 0; // Rewind to start if already played
            khorneAudioRef.current.play().catch(error => {
                console.error("Failed to play Khorne's laugh:", error);
                // This catch is useful for autoplay policy issues.
                // You might want to show a message to the user: "Click to play audio"
            });
        }
    };

    return (
        <div className="altar-of-khorne-container">
            <h2>The Altar to the Blood God</h2>
            <img
                src="/images/Khorne_Skull.jpg" // Your image path here
                alt="Skull Icon for Khorne, the Blood God"
                className="khorne-icon"
            />
            <p>
                Offerings of blood, skulls, or even a small monetary tribute are always appreciated by Khorne.
                Glory to the Skull Throne!
            </p>
            <div className="khorne-buttons-group"> {/* Optional: Group buttons for styling */}
                <button className="khorne-button" onClick={handleButtonClick}>
                    Blood for the Blood God!
                </button>
                <button className="khorne-button" onClick={handleButtonClick}>
                    Skulls for the Skull Throne!
                </button>
            </div>

            {/* <--- NEW: Audio element for Khorne's laugh */}
            <audio ref={khorneAudioRef} src="/server/sounds/khorne-laugh.mp3" preload="auto">
                Your browser does not support the audio element.
            </audio>
        </div>
    );
}

export default AltarOfKhorne;