// src/components/PushMeButton.jsx
import React, { useState, useRef } from 'react'; // Make sure useRef is imported

function PushMeButton() {
    const [isAnimating, setIsAnimating] = useState(false);
    const moanAudioRef = useRef(null); // Create a ref for the audio element

    const handleClick = () => {
        if (!isAnimating) { // Prevent rapid clicks from re-triggering before animation finishes
            setIsAnimating(true);

            // --- NEW: Play the moan sound ---
            if (moanAudioRef.current) {
                moanAudioRef.current.currentTime = 0; // Rewind to start if already playing/played
                moanAudioRef.current.play();
            }
            // --- END NEW ---

            // After the animation duration, remove the 'animating' class
            setTimeout(() => {
                setIsAnimating(false);
            }, 650); // Must be slightly longer than the CSS animation duration
        }
    };

    return (
        <div className="push-me-container">
            <button
                className={`push-me-button ${isAnimating ? 'animating' : ''}`}
                onClick={handleClick}
            >
                PUSH ME!
            </button>
            {/* --- NEW: Audio element for the moan sound --- */}
            <audio ref={moanAudioRef} src="/moan.mp3" preload="auto" />
            {/* --- END NEW --- */}
        </div>
    );
}

export default PushMeButton;