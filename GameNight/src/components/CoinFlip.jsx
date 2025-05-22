// src/components/CoinFlip.jsx
import React, { useState } from 'react';

function CoinFlip() {
    const [flipResult, setFlipResult] = useState('...');

    const handleFlip = () => {
        const result = Math.random() < 0.5 ? 'Heads!' : 'Tails!';
        setFlipResult(result);
    };

    return (
        <div className="tool-card coin-flip-card">
            <h3>Coin Flip</h3>
            <div className="flip-result">{flipResult}</div>
            <button onClick={handleFlip} className="flip-button">Flip Coin!</button>
            <p className="coin-tip">Need to decide something quickly?</p>
        </div>
    );
}

export default CoinFlip;