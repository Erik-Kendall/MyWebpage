// src/components/SimpleDiceRoller.jsx
import React, { useState } from 'react';

function SimpleDiceRoller() {
    const [rollResult, setRollResult] = useState('');
    const [numDice, setNumDice] = useState(1);
    const [dieSides, setDieSides] = useState(20); // Default to d20
    const [modifier, setModifier] = useState(0);

    const commonDice = [4, 6, 8, 10, 12, 20, 100];

    const rollDice = () => {
        let sum = 0;
        let rolls = [];
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * dieSides) + 1;
            sum += roll;
            rolls.push(roll);
        }
        const finalResult = sum + modifier;
        setRollResult(`${numDice}d${dieSides} ${rolls.join(', ')} ${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''} = ${finalResult}`);
    };

    return (
        <div className="tool-card dice-roller-card">
            <h3>Dice Roller</h3>
            <div className="dice-inputs">
                <input
                    type="number"
                    value={numDice}
                    onChange={(e) => setNumDice(parseInt(e.target.value, 10) || 1)}
                    min="1"
                    className="dice-input num-dice-input"
                />
                <span>d</span>
                <div className="die-sides-buttons">
                    {commonDice.map(sides => (
                        <button
                            key={sides}
                            className={`die-side-button ${dieSides === sides ? 'active' : ''}`}
                            onClick={() => setDieSides(sides)}
                        >
                            {sides}
                        </button>
                    ))}
                </div>
            </div>
            <div className="dice-modifier-input">
                <span>Modifier:</span>
                <input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
                    className="dice-input modifier-input"
                />
            </div>
            <button onClick={rollDice} className="roll-button">Roll!</button>
            <div className="dice-result">{rollResult || 'Roll some dice!'}</div>
        </div>
    );
}

export default SimpleDiceRoller;