import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles/DiceRoller.css'; // Keep existing DiceRoller.css for general layout and styling

// Helper function to get face content (e.g., number or special text)
const getFaceContent = (dieType, faceNumber) => {
    // For D100 tens die: 10 is '00', others are multiples of 10
    if (dieType === 'd100_tens') {
        return faceNumber === 10 ? '00' : String((faceNumber - 1) * 10);
    }
    // For D100 ones die: 10 is '0', others are 1-9
    if (dieType === 'd100_ones') {
        return faceNumber === 10 ? '0' : String(faceNumber);
    }
    // Default for all other dice (1-X)
    return String(faceNumber);
};

const SimpleDiceRoller = () => {
    const [dieType, setDieType] = useState('d6'); // 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'
    const [numDice, setNumDice] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [currentVisualValues, setCurrentVisualValues] = useState([]); // Values shown during rolling (dynamic)
    const [finalRollResults, setFinalRollResults] = useState([]);     // Actual numerical results after roll

    // Ref to store intervals so we can clear them
    const intervalRefs = useRef([]);

    // Determine max value for the selected die type
    const getMaxFaces = useCallback(() => {
        switch (dieType) {
            case 'd4': return 4;
            case 'd6': return 6;
            case 'd8': return 8;
            case 'd10': return 10;
            case 'd12': return 12;
            case 'd20': return 20;
            case 'd100': return 10; // D100 uses two D10s (max 10 faces each for internal logic)
            default: return 6;
        }
    }, [dieType]);

    // Cleanup intervals on component unmount or when roll finishes
    useEffect(() => {
        return () => {
            intervalRefs.current.forEach(clearInterval);
            intervalRefs.current = [];
        };
    }, []);

    const handleRollDice = () => {
        if (isRolling) return;

        // Clear any previous intervals
        intervalRefs.current.forEach(clearInterval);
        intervalRefs.current = [];

        setIsRolling(true);
        setFinalRollResults([]); // Clear previous numerical results

        const newResults = []; // Store the actual numerical result (for total)
        const maxFaces = getMaxFaces();
        const diceCount = dieType === 'd100' ? 2 : numDice;

        // Initialize visual values with a placeholder for the start of the roll
        setCurrentVisualValues(Array.from({ length: diceCount }).map(() => ({
            type: dieType === 'd100' ? 'd10' : dieType, // Visual type
            displayType: dieType, // Content type
            value: 1 // Start with 1 for visual
        })));


        // Set up rolling animation intervals
        for (let i = 0; i < diceCount; i++) {
            const interval = setInterval(() => {
                setCurrentVisualValues(prevValues => {
                    const updatedValues = [...prevValues];
                    let randomValue;

                    if (dieType === 'd100' && i === 0) { // Tens die for D100
                        randomValue = Math.floor(Math.random() * 10) + 1; // 1-10
                        updatedValues[i] = { type: 'd10', value: randomValue, displayType: 'd100_tens' };
                    } else if (dieType === 'd100' && i === 1) { // Ones die for D100
                        randomValue = Math.floor(Math.random() * 10) + 1; // 1-10
                        updatedValues[i] = { type: 'd10', value: randomValue, displayType: 'd100_ones' };
                    } else { // All other dice types
                        randomValue = Math.floor(Math.random() * maxFaces) + 1;
                        updatedValues[i] = { type: dieType, value: randomValue, displayType: dieType };
                    }
                    return updatedValues;
                });
            }, 100); // Update every 100ms for a "rolling" effect
            intervalRefs.current.push(interval);
        }

        // After animation duration, stop rolling and determine final results
        setTimeout(() => {
            intervalRefs.current.forEach(clearInterval); // Stop all rolling intervals
            intervalRefs.current = [];

            const finalVisuals = [];

            if (dieType === 'd100') {
                const tensRoll = Math.floor(Math.random() * 10) + 1;
                const onesRoll = Math.floor(Math.random() * 10) + 1;

                finalVisuals.push({ type: 'd10', value: tensRoll, displayType: 'd100_tens' });
                finalVisuals.push({ type: 'd10', value: onesRoll, displayType: 'd100_ones' });

                const calculatedTens = tensRoll === 10 ? 0 : (tensRoll - 1) * 10;
                const calculatedOnes = onesRoll === 10 ? 0 : onesRoll;

                let totalResult = calculatedTens + calculatedOnes;
                if (calculatedTens === 0 && calculatedOnes === 0) {
                    totalResult = 100; // Common D&D rule: 00 + 0 = 100
                }
                newResults.push(totalResult);
            } else {
                for (let i = 0; i < numDice; i++) {
                    const randomValue = Math.floor(Math.random() * maxFaces) + 1;
                    finalVisuals.push({ type: dieType, value: randomValue, displayType: dieType });
                    newResults.push(randomValue);
                }
            }

            setCurrentVisualValues(finalVisuals); // Set to final values
            setFinalRollResults(newResults);
            setIsRolling(false);
        }, 1500); // Total animation duration
    };

    // This useEffect hook is to ensure the dice values reset when changing dieType or numDice
    useEffect(() => {
        // Clear any ongoing intervals if the user changes die type while rolling
        intervalRefs.current.forEach(clearInterval);
        intervalRefs.current = [];

        setIsRolling(false);
        setCurrentVisualValues([]); // Clear visuals
        setFinalRollResults([]); // Clear results
    }, [dieType, numDice]);


    const getDieShapeClass = (type) => {
        // Simple classes for visual distinction based on die type
        // These can be styled in DiceRoller.css to look like a square, circle, etc.
        switch (type) {
            case 'd4': return 'die-shape-d4';
            case 'd6': return 'die-shape-d6';
            case 'd8': return 'die-shape-d8';
            case 'd10': return 'die-shape-d10';
            case 'd12': return 'die-shape-d12';
            case 'd20': return 'die-shape-d20';
            default: return 'die-shape-d6'; // Fallback
        }
    };


    return (
        <div className="tool-card dice-roller-card">
            <h2>Dice Roller</h2>
            <p className="dice-roller-subtitle">Roll the bones!</p>

            <div className="dice-controls">
                <label htmlFor="dieType">Die Type:</label>
                <select
                    id="dieType"
                    value={dieType}
                    onChange={(e) => setDieType(e.target.value)}
                    disabled={isRolling}
                    className="die-type-select"
                >
                    <option value="d4">D4</option>
                    <option value="d6">D6</option>
                    <option value="d8">D8</option>
                    <option value="d10">D10</option>
                    <option value="d12">D12</option>
                    <option value="d20">D20</option>
                    <option value="d100">D100 (Percentile)</option>
                </select>

                {dieType !== 'd100' && ( // Only show number of dice selector for non-D100
                    <>
                        <label htmlFor="numDice">Number of Dice:</label>
                        <select
                            id="numDice"
                            value={numDice}
                            onChange={(e) => setNumDice(parseInt(e.target.value))}
                            disabled={isRolling}
                            className="num-dice-select"
                        >
                            {[...Array(6).keys()].map(i => ( // Up to 6 dice for most types
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            <div className="dice-display-area">
                {currentVisualValues.length > 0 ? (
                    currentVisualValues.map((diceInfo, i) => (
                        <div key={`${diceInfo.type}-${i}`} className={`visual-die ${getDieShapeClass(diceInfo.type)}`}>
                            <span className="die-number">
                                {getFaceContent(diceInfo.displayType, diceInfo.value)}
                            </span>
                        </div>
                    ))
                ) : (
                    // Placeholder when no dice have been rolled yet
                    <div className={`visual-die ${getDieShapeClass(dieType === 'd100' ? 'd10' : dieType)}`}>
                        <span className="die-number">
                            {dieType === 'd100' ? '00' : '🎲'}
                        </span>
                    </div>
                )}
            </div>

            <button
                onClick={handleRollDice}
                className="primary-button roll-button"
                disabled={isRolling}
            >
                {isRolling ? 'Rolling...' : 'Roll Dice!'}
            </button>

            {finalRollResults.length > 0 && !isRolling && (
                <div className="roll-results">
                    {dieType === 'd100' ? (
                        <p>Result: <span className="result-text">{finalRollResults[0]}</span></p>
                    ) : (
                        <>
                            <p>Results: <span className="result-text">{finalRollResults.join(', ')}</span></p>
                            {numDice > 1 && <p>Total: <span className="result-text">{finalRollResults.reduce((sum, val) => sum + val, 0)}</span></p>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimpleDiceRoller;