import React, { useState } from 'react';
import './styles/Counter.css';

const Counter = () => {
    const [hp, setHp] = useState(100); // Initial HP
    const [damageHealInput, setDamageHealInput] = useState('');

    const adjustHp = (amount) => {
        setHp((prevHp) => Math.max(0, prevHp + amount)); // Ensure HP doesn't go below 0
    };

    const handleManualAdjust = () => {
        const value = parseInt(damageHealInput);
        if (!isNaN(value)) {
            adjustHp(value);
            setDamageHealInput('');
        }
    };

    const resetHp = () => {
        setHp(100); // Or to a customizable default
    };

    return (
        <div className="tool-card">
            <h2>HP Counter</h2>
            <div className="hp-display-input">
                <label htmlFor="hpInput" className="hp-label">HP</label>
                <input
                    id="hpInput"
                    type="number"
                    value={hp}
                    onChange={(e) => setHp(parseInt(e.target.value) || 0)}
                    className="text-input hp-input"
                />
            </div>
            <div className="hp-value">{hp}</div>

            <div className="hp-buttons">
                <button onClick={() => adjustHp(-1)} className="secondary-button">-1</button>
                <button onClick={() => adjustHp(+1)} className="secondary-button">+1</button>
                <button onClick={resetHp} className="primary-button hp-reset-button">Reset</button>
                <button onClick={() => adjustHp(-5)} className="secondary-button">-5</button>
                <button onClick={() => adjustHp(+5)} className="secondary-button">+5</button>
                <button onClick={() => adjustHp(-10)} className="secondary-button">-10</button>
                <button onClick={() => adjustHp(+10)} className="secondary-button">+10</button>
            </div>
            <div className="hp-manual-input">
                <input
                    type="number"
                    placeholder="0"
                    value={damageHealInput}
                    onChange={(e) => setDamageHealInput(e.target.value)}
                    className="text-input manual-input"
                />
                <button onClick={handleManualAdjust} className="primary-button">Adjust</button>
            </div>
        </div>
    );
};

export default Counter;