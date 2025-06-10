import React, { useState } from 'react';
import './styles/Calculator.css';

const EnhancedCalculator = () => {
    const [expression, setExpression] = useState('');
    const [calcResult, setCalcResult] = useState('-');

    const handleCalcButtonClick = (value) => {
        if (value === '=') {
            try {
                let evalExpression = expression.replace(/(\d+)d(\d+)/g, (match, num, sides) => {
                    let total = 0;
                    for (let i = 0; i < parseInt(num); i++) {
                        total += Math.floor(Math.random() * parseInt(sides)) + 1;
                    }
                    return total;
                });
                setCalcResult(eval(evalExpression)); // DANGER: Use a safe math evaluator in production!
            } catch (e) {
                setCalcResult('Error');
            }
        } else if (value === 'C') {
            setExpression('');
            setCalcResult('-');
        } else {
            setExpression((prev) => prev + value);
        }
    };

    return (
        <div className="tool-card">
            <h2>TTRPG Calculator</h2>
            <input
                type="text"
                placeholder="e.g., 2d20+5, 15*3"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="text-input calculator-input"
                readOnly
            />
            <p className="result-display">Result: {calcResult}</p>
            <div className="keypad">
                {['7', '8', '9', '/', 'C', '4', '5', '6', '*', 'd', '1', '2', '3', '-', '0', '.', '+', '='].map((key) => (
                    <button
                        key={key}
                        onClick={() => handleCalcButtonClick(key)}
                        className={
                            ['=', '+', '-', '*', '/', 'C', 'd'].includes(key)
                                ? 'secondary-button keypad-button'
                                : 'primary-button keypad-button'
                        }
                    >
                        {key}
                    </button>
                ))}
            </div>
            <p className="calc-hint">Use 'd' for dice, e.g., '2d6+3'</p>
        </div>
    );
};

export default EnhancedCalculator;