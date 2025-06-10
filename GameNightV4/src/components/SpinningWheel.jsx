import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles/SpinningWheel.css';

const SpinningWheel = () => {
    const [choices, setChoices] = useState([
        'Player 1', 'Player 2', 'Player 3', 'Player 4',
        'Player 5', 'Player 6', 'Player 7', 'Player 8'
    ]);
    const [newChoice, setNewChoice] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinDegree, setSpinDegree] = useState(0); // This will still control the canvas rotation
    const [winningChoice, setWinningChoice] = useState(null);

    const canvasRef = useRef(null); // Reference to the canvas element
    const animationFrameId = useRef(null); // To store animation frame ID for cleanup

    // Colors for the segments, extending if needed
    const segmentColors = [
        '#6A0572', // Deep purple
        '#333333', // Dark grey
        '#8E24AA', // Lighter purple
        '#555555', // Medium grey
        '#A020F0', // Another purple shade
        '#444444', // Another dark grey
        '#C0C0C0', // Light grey
        '#7D26CD', // Another purple
        '#9932CC', // Orchid
        '#483D8B', // Dark slate blue
        '#6A5ACD', // Slate blue
        '#4B0082', // Indigo
    ];

    // Function to draw the wheel on the canvas
    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10; // Slightly smaller to account for border/padding

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing

        if (choices.length === 0) {
            // Draw placeholder text if no choices
            ctx.fillStyle = '#A0A0A0';
            ctx.font = '1.1em Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Add choices to spin!', centerX, centerY);
            return;
        }

        const degreesPerSegment = 360 / choices.length;

        choices.forEach((choice, index) => {
            const startAngle = (index * degreesPerSegment) * (Math.PI / 180);
            const endAngle = ((index + 1) * degreesPerSegment) * (Math.PI / 180);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Set fill style for segment
            ctx.fillStyle = segmentColors[index % segmentColors.length];
            ctx.fill();

            // Draw text
            ctx.save(); // Save the current state of the canvas context

            ctx.translate(centerX, centerY); // Move origin to center of wheel
            ctx.rotate(startAngle + (degreesPerSegment / 2) * (Math.PI / 180)); // Rotate to the center of the segment

            ctx.fillStyle = 'white';
            ctx.font = choices.length > 8 ? '0.65em Arial' : '0.8em Arial';
            ctx.textAlign = 'center'; // Center text on the radial line
            ctx.textBaseline = 'middle';

            // Position text outwards. Adjust 'radius * 0.7' for how far from center text appears
            ctx.fillText(choice, radius * 0.65, 0); // X-coord is radial distance, Y-coord is 0 because we rotated

            ctx.restore(); // Restore context to its original state
        });

        // Draw center circle (optional, if you want a hub)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI); // Small inner circle
        ctx.fillStyle = '#1a1a2e'; // Dark center
        ctx.fill();
        ctx.strokeStyle = '#00C4CC'; // Teal border
        ctx.lineWidth = 3;
        ctx.stroke();

    }, [choices, segmentColors]); // Redraw when choices or colors change

    useEffect(() => {
        drawWheel(); // Initial draw and redraw on choice changes
    }, [choices, drawWheel]);

    useEffect(() => {
        // Cleanup animation frame on component unmount
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    const addChoice = () => {
        if (newChoice.trim() !== '') {
            setChoices([...choices, newChoice.trim()]);
            setNewChoice('');
        }
    };

    const removeChoice = (indexToRemove) => {
        setChoices(choices.filter((_, index) => index !== indexToRemove));
    };

    const calculateSpin = () => {
        if (choices.length === 0) {
            alert('Please add some choices first!');
            return;
        }

        setIsSpinning(true);
        setWinningChoice(null);

        const numSegments = choices.length;
        const degreesPerSegment = 360 / numSegments;

        const randomIndex = Math.floor(Math.random() * numSegments);
        const selectedChoice = choices[randomIndex];

        const minFullSpins = 5;
        const maxFullSpins = 10;

        // Target angle for the center of the winning segment to align with the pointer (top/270 degrees)
        // The segments are drawn starting from the right (0 degrees clockwise from horizontal).
        // The canvas `rotate` function rotates the *entire* canvas.
        // So, if we want segment `randomIndex` to land at 270 degrees (top),
        // its current starting angle is `randomIndex * degreesPerSegment`.
        // Its center is at `randomIndex * degreesPerSegment + degreesPerSegment / 2`.
        // We want this center to align with 270 degrees.
        // So, final rotation = (270 - (randomIndex * degreesPerSegment + degreesPerSegment / 2)).
        const targetSegmentCenterAngle = (randomIndex * degreesPerSegment) + (degreesPerSegment / 2);
        const wobble = Math.random() * (degreesPerSegment * 0.8) - (degreesPerSegment * 0.4);
        const targetRotation = (270 - targetSegmentCenterAngle + wobble); // Base target in 0-360 range

        // Add multiple full rotations for a good spin effect
        const totalSpin = targetRotation + (Math.floor(Math.random() * (maxFullSpins - minFullSpins + 1)) + minFullSpins) * 360;

        setSpinDegree(totalSpin); // This will be applied to the canvas's transform style

        setTimeout(() => {
            setIsSpinning(false);
            setWinningChoice(selectedChoice);
        }, 4000); // Match CSS transition duration
    };

    return (
        <div className="tool-card spinning-wheel-card">
            <h2>Decision Wheel</h2>
            <p className="spinning-wheel-subtitle">Spin to find out!</p>

            <div className="wheel-container">
                <div className="wheel-pointer"></div>
                {/* The canvas element for drawing the wheel */}
                <canvas
                    ref={canvasRef}
                    width="300" // Should match wheel-container width
                    height="300" // Should match wheel-container height
                    className="wheel"
                    style={{ transform: `rotate(${spinDegree}deg)` }}
                    onTransitionEnd={() => {
                        if (winningChoice) {
                            const numSegments = choices.length;
                            const degreesPerSegment = 360 / numSegments;
                            const winningIndex = choices.indexOf(winningChoice);
                            const targetSegmentCenterAngle = (winningIndex * degreesPerSegment) + (degreesPerSegment / 2);
                            const snappedDegree = (270 - targetSegmentCenterAngle);
                            setSpinDegree(snappedDegree % 360); // Snap to a clean angle within 0-359
                        }
                    }}
                >
                    Your browser does not support the canvas element.
                </canvas>
            </div>

            <button onClick={calculateSpin} className="primary-button spinning-wheel-spin-button" disabled={isSpinning || choices.length === 0}>
                {isSpinning ? 'Spinning...' : 'Spin!'}
            </button>

            {winningChoice && (
                <p className="result-text spinning-wheel-result">The winner is: {winningChoice}!</p>
            )}

            <h3 className="section-heading">Manage Choices</h3>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Add a choice"
                    value={newChoice}
                    onChange={(e) => setNewChoice(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') addChoice(); }}
                    className="text-input"
                />
                <button onClick={addChoice} className="secondary-button">Add</button>
            </div>

            <ul className="choice-list">
                {choices.map((choice, index) => (
                    <li key={index} className="choice-item">
                        <span className="bullet"></span> {choice}
                        <button onClick={() => removeChoice(index)} className="delete-button">X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SpinningWheel;