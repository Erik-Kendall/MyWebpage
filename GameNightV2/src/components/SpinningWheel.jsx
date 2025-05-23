// src/components/SpinningWheel.jsx
import React, { useState } from 'react';

function SpinningWheel() {
    const [choices, setChoices] = useState([
        'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'
    ]);
    const [newChoice, setNewChoice] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0); // Current wheel rotation
    const [result, setResult] = useState('');
    const [resultIndex, setResultIndex] = useState(-1); // Index of the winning choice

    const addChoice = () => {
        if (newChoice.trim() !== '') {
            setChoices([...choices, newChoice.trim()]);
            setNewChoice('');
        }
    };

    const removeChoice = (indexToRemove) => {
        setChoices(choices.filter((_, index) => index !== indexToRemove));
    };

    const handleSpin = () => {
        if (choices.length === 0) {
            setResult('Add some choices first!');
            return;
        }

        setIsSpinning(true);
        setResult(''); // Clear previous result

        // Calculate a random degree to stop on
        // Each slice has an angle of (360 / number of choices)
        const totalDegrees = 360;
        const degreesPerSlice = totalDegrees / choices.length;

        // Choose a random index to land on
        const chosenIndex = Math.floor(Math.random() * choices.length);
        setResultIndex(chosenIndex); // Store the index of the winner

        // Calculate a rotation that lands *just past* the center of the chosen slice
        // We add multiple full rotations (e.g., 5-10 full spins) to make it look like it's spinning a lot
        // Then add the angle to get to the start of the chosen slice
        // Then add half the slice's width to land in the middle
        // We also add a small random offset within the slice to make it less predictable
        const minRotations = 5;
        const maxRotations = 10;
        const randomFullRotations = Math.floor(Math.random() * (maxRotations - minRotations + 1) + minRotations);

        const targetSliceStartAngle = totalDegrees - (chosenIndex * degreesPerSlice); // Angle for the *start* of the slice (0-360, clockwise)
        const randomOffsetWithinSlice = Math.random() * (degreesPerSlice - 5) + 2.5; // Small offset within the slice

        const newRotation = (randomFullRotations * totalDegrees) + targetSliceStartAngle + (degreesPerSlice / 2) + randomOffsetWithinSlice;

        setRotation(newRotation);

        // Set a timeout to display the result after the animation finishes
        // The CSS animation duration for the wheel is 5s
        setTimeout(() => {
            setIsSpinning(false);
            setResult(`Winner: ${choices[chosenIndex]}`);
            // Optional: reset rotation slightly after spin for next spin to look good
            // setRotation(newRotation % totalDegrees); // This might cause a jump, often better to just let it sit
        }, 5000); // Must match CSS animation duration
    };

    // Style for each segment based on the number of choices
    const segmentStyle = (index) => {
        const degreesPerSlice = 360 / choices.length;
        const rotate = index * degreesPerSlice;
        const skewY = 90 - degreesPerSlice; // For shaping segments

        return {
            backgroundColor: `hsl(${index * (360 / choices.length) % 360}, 70%, 50%)`, // Vary hue for segments
            transform: `rotate(${rotate}deg) skewY(${skewY}deg)`,
            transformOrigin: '0% 100%', // Rotate around the bottom-left corner (center of wheel)
            width: '50%', // Half the width of the circle
            height: '50%', // Half the height of the circle
            position: 'absolute',
            top: '0',
            left: '50%',
            overflow: 'hidden', // Hide overflow from skew
            clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%, 0% 100%)', // Triangle shape
            // This clipPath with skewY creates the pie slice
        };
    };

    return (
        <div className="tool-card spinning-wheel-card">
            <h3>Decision Wheel</h3>

            <div className="wheel-container">
                <div
                    className={`wheel ${isSpinning ? 'spinning' : ''}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {choices.length > 0 ? (
                        choices.map((choice, index) => (
                            <div key={index} className="wheel-segment" style={segmentStyle(index)}>
                                <div className="segment-text" style={{
                                    transform: `skewY(${-(90 - (360 / choices.length))}deg) rotate(${360 / (choices.length * 2)}deg)`, // Un-skew and center text
                                    transformOrigin: '0% 0%',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '5px', // Adjust text position within segment
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 'calc(100% - 10px)'
                                }}>
                                    {choice}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="wheel-placeholder">Add Choices</div>
                    )}
                </div>
                <div className="wheel-pointer"></div>
            </div>

            <div className="wheel-controls">
                <div className="result-display">{result || 'Spin to find out!'}</div>
                <button onClick={handleSpin} disabled={isSpinning || choices.length === 0} className="spin-button">
                    {isSpinning ? 'Spinning...' : 'Spin!'}
                </button>
            </div>

            <div className="choice-management">
                <h4>Manage Choices</h4>
                <div className="add-choice">
                    <input
                        type="text"
                        value={newChoice}
                        onChange={(e) => setNewChoice(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addChoice()}
                        placeholder="Add a choice"
                        className="choice-input"
                    />
                    <button onClick={addChoice} className="add-choice-button">Add</button>
                </div>
                <ul className="choice-list">
                    {choices.map((choice, index) => (
                        <li key={index}>
                            {choice}
                            <button onClick={() => removeChoice(index)} className="remove-choice-button">X</button>
                        </li>
                    ))}
                </ul>
                {choices.length === 0 && <p className="no-choices-msg">No choices added yet.</p>}
            </div>
        </div>
    );
}

export default SpinningWheel;