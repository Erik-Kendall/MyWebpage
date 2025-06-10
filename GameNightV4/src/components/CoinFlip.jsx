import React, { useState } from 'react';
import './styles/CoinFlip.css';

const CoinFlip = () => {
    const [result, setResult] = useState(null); // 'heads' or 'tails'
    const [isFlipping, setIsFlipping] = useState(false); // Controls animation state
    const [displaySide, setDisplaySide] = useState('heads'); // What's currently visible (for pre-flip or initial state)

    const handleFlip = () => {
        if (isFlipping) return; // Prevent multiple flips

        setIsFlipping(true);
        setResult(null); // Clear previous result
        setDisplaySide(Math.random() < 0.5 ? 'heads' : 'tails'); // Set the "final" side instantly for logic, but animation will reveal

        // Simulate a flip animation
        setTimeout(() => {
            setIsFlipping(false);
            // The displaySide state already holds the result,
            // the CSS transition will naturally end on this side
            setResult(displaySide); // Now set the human-readable result
        }, 2000); // This duration should match the CSS animation duration
    };

    return (
        <div className="tool-card coin-flip-card">
            <h2>Coin Flip</h2>
            <p className="coin-flip-subtitle">Heads or Tails?</p>

            <div className={`coin-container ${isFlipping ? 'flipping' : ''}`}>
                <div className={`coin ${displaySide}`}>
                    <div className="coin-front">HEADS</div>
                    <div className="coin-back">TAILS</div>
                </div>
            </div>

            <button
                onClick={handleFlip}
                className="primary-button flip-button"
                disabled={isFlipping}
            >
                {isFlipping ? 'Flipping...' : 'Flip Coin!'}
            </button>

            {result && (
                <p className="flip-result">Result: <span className="result-text">{result.toUpperCase()}!</span></p>
            )}
        </div>
    );
};

export default CoinFlip;