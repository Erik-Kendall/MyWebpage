// src/components/EnhancedCalculator.jsx
import React, { useState } from 'react';
// No need to import CSS here, it's global via App.css if that's your setup

function EnhancedCalculator() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const handleButtonClick = (value) => {
        setInput((prev) => prev + value);
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
    };

    const handleCalculate = () => {
        try {
            const diceRegex = /(\d+)d(\d+)([\+\-]\d+)?/g;
            let expression = input;
            let match;

            while ((match = diceRegex.exec(expression)) !== null) {
                const numDice = parseInt(match[1], 10);
                const dieSides = parseInt(match[2], 10);
                let diceRollSum = 0;
                for (let i = 0; i < numDice; i++) {
                    diceRollSum += Math.floor(Math.random() * dieSides) + 1;
                }
                const modifier = match[3] ? parseInt(match[3], 10) : 0;
                expression = expression.replace(match[0], `(${diceRollSum + modifier})`);
                diceRegex.lastIndex = 0; // Reset regex index for new expression
            }

            // Evaluate safely: using Function constructor
            // eslint-disable-next-line no-new-func
            const evalResult = Function(`"use strict";return (${expression})`)();
            setResult(evalResult);
        } catch (e) {
            console.error("Calculator error:", e);
            setResult('Error');
        }
    };

    const buttons = [
        '1', '2', '3', '+',
        '4', '5', '6', '-',
        '7', '8', '9', '*',
        '.', '0', '/', '=',
        'C', 'd' // 'd' for dice rolling
    ];

    return (
        <div className="tool-card calculator-card">
            <h3>TTRPG Calculator</h3>
            <input
                type="text"
                className="calc-display"
                value={input}
                placeholder="e.g., 2d20+5, 15*3"
                readOnly
            />
            <div className="calc-result">Result: {result !== null ? result : '-'}</div>
            <div className="calc-buttons">
                {buttons.map((char) => (
                    <button
                        key={char}
                        onClick={() => (char === 'C' ? handleClear() : char === '=' ? handleCalculate() : handleButtonClick(char))}
                        className={`calc-button ${['+', '-', '*', '/', '='].includes(char) ? 'operator' : ''} ${char === 'C' ? 'clear-btn' : ''}`}
                    >
                        {char}
                    </button>
                ))}
            </div>
            <p className="calc-tip">Use 'd' for dice, e.g., '2d6+3'</p>
        </div>
    );
}

export default EnhancedCalculator;