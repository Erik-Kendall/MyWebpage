// src/pages/GamingTools.jsx
import React, { useState } from 'react';
import '../App.css'; // Keep this if your styles are in App.css

// Import all the new components from the components directory
import EnhancedCalculator from '../components/EnhancedCalculator';
import FancyTimer from '../components/FancyTimer';
import Counter from '../components/Counter';
import SimpleDiceRoller from '../components/SimpleDiceRoller';
import CoinFlip from '../components/CoinFlip';
import SpinningWheel from '../components/SpinningWheel';
import RandomGenerator from '../components/RandomGenerator';
import Soundboard from '../components/Soundboard';
import InitiativeTracker from '../components/InitiativeTracker'; // <--- NEW IMPORT for Initiative Tracker


// --- Main GamingTools Page ---

function GamingTools() {
    const [activeTool, setActiveTool] = useState('diceRoller'); // Default to Dice Roller

    const renderTool = () => {
        switch (activeTool) {
            case 'calculator':
                return <EnhancedCalculator />;
            case 'timer':
                return <FancyTimer />;
            case 'counter':
                return <Counter />;
            case 'diceRoller':
                return <SimpleDiceRoller />;
            case 'coinFlip':
                return <CoinFlip />;
            case 'spinningWheel':
                return <SpinningWheel />;
            case 'generator':
                return <RandomGenerator />;
            case 'soundboard':
                return <Soundboard />;
            case 'initiativeTracker': // <--- NEW CASE for Initiative Tracker
                return <InitiativeTracker />;
            default:
                return <p>Select a tool from the menu.</p>;
        }
    };

    return (
        <div className="gaming-tools-container">
            <h1>Gaming Tools</h1>

            <nav className="tool-navigation">
                <button
                    className={activeTool === 'diceRoller' ? 'active' : ''}
                    onClick={() => setActiveTool('diceRoller')}
                >
                    Dice Roller
                </button>
                <button
                    className={activeTool === 'coinFlip' ? 'active' : ''}
                    onClick={() => setActiveTool('coinFlip')}
                >
                    Coin Flip
                </button>
                <button
                    className={activeTool === 'spinningWheel' ? 'active' : ''}
                    onClick={() => setActiveTool('spinningWheel')}
                >
                    Spinning Wheel
                </button>
                <button
                    className={activeTool === 'soundboard' ? 'active' : ''}
                    onClick={() => setActiveTool('soundboard')}
                >
                    Soundboard
                </button>
                {/* NEW BUTTON for Initiative Tracker */}
                <button
                    className={activeTool === 'initiativeTracker' ? 'active' : ''}
                    onClick={() => setActiveTool('initiativeTracker')}
                >
                    Initiative Tracker
                </button>
                <button
                    className={activeTool === 'calculator' ? 'active' : ''}
                    onClick={() => setActiveTool('calculator')}
                >
                    Calculator
                </button>
                <button
                    className={activeTool === 'timer' ? 'active' : ''}
                    onClick={() => setActiveTool('timer')}
                >
                    Timer
                </button>
                <button
                    className={activeTool === 'counter' ? 'active' : ''}
                    onClick={() => setActiveTool('counter')}
                >
                    Counter
                </button>
                <button
                    className={activeTool === 'generator' ? 'active' : ''}
                    onClick={() => setActiveTool('generator')}
                >
                    Idea Generator
                </button>
                {/* Add more buttons for other tools here */}
            </nav>

            <div className="tool-display-area">
                {renderTool()}
            </div>
        </div>
    );
}

export default GamingTools;