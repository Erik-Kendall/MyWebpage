import React, { useState } from 'react';
import './styles/GamingTools.css';

// Import your individual tool components
import DiceRoller from '../components/SimpleDiceRoller';
import CoinFlip from '../components/CoinFlip';
import SpinningWheel from '../components/SpinningWheel'; // Decision Wheel
import EnhancedCalculator from '../components/EnhancedCalculator';
import FancyTimer from '../components/FancyTimer';
import Counter from '../components/Counter';
import RandomGenerator from '../components/RandomGenerator';
import TimezoneTranslator from '../components/TimezoneTranslator';
import DiyStatsSheet from '../components/DIYStatsSheet';
import InitiativeTracker from '../components/InitiativeTracker';
import MySoundboard from '../components/MySoundboard'; // New MySoundboard

// NEW TOOL IMPORTS
import LoreGenerator from '../components/LoreGenerator';
import NameGenerator from '../components/NameGenerator.jsx'; // Corrected import path
import NpcArchetypeGenerator from '../components/NpcArchetypeGenerator';
import WeatherEnvironmentGenerator from '../components/WeatherEnvironmentGenerator';
import MiniAdventureGenerator from '../components/MiniAdventureGenerator';


const GamingTools = () => {
    const [activeTab, setActiveTab] = useState('randomizers');

    const renderActiveToolComponent = () => {
        switch (activeTab) {
            case 'randomizers':
                return (
                    // Wrapped randomizers in a grid container
                    <div className="game-management-grid">
                        <SpinningWheel />
                        <DiceRoller />
                        <CoinFlip />
                        <RandomGenerator />
                    </div>
                );
            case 'utilities':
                return (
                    // Wrapped utilities in a grid container
                    <div className="game-management-grid">
                        <EnhancedCalculator />
                        <FancyTimer />
                        <Counter />
                        <TimezoneTranslator />
                    </div>
                );
            case 'game-management':
                return (
                    <div className="game-management-grid">
                        {/* Added soundboard-full-row class to MySoundboard */}
                        <MySoundboard className="soundboard-full-row" />
                        <DiyStatsSheet />
                        <InitiativeTracker />
                    </div>
                );
            case 'creative-world-building': // NEW TAB CASE
                return (
                    // This already uses a grid container
                    <div className="creative-tools-grid">
                        <LoreGenerator />
                        <NameGenerator />
                        <NpcArchetypeGenerator />
                        <WeatherEnvironmentGenerator />
                        <MiniAdventureGenerator />
                    </div>
                );
            default:
                return <p>Select a tool category above.</p>;
        }
    };

    return (
        <div className="gaming-tools-container">
            <h1>Gaming Tools</h1>
            <div className="tool-navigation">
                <button
                    className={activeTab === 'randomizers' ? 'active' : ''}
                    onClick={() => setActiveTab('randomizers')}
                >
                    Randomizers
                </button>
                <button
                    className={activeTab === 'utilities' ? 'active' : ''}
                    onClick={() => setActiveTab('utilities')}
                >
                    Utilities
                </button>
                <button
                    className={activeTab === 'game-management' ? 'active' : ''}
                    onClick={() => setActiveTab('game-management')}
                >
                    Game Management
                </button>
                {/* NEW TAB BUTTON */}
                <button
                    className={activeTab === 'creative-world-building' ? 'active' : ''}
                    onClick={() => setActiveTab('creative-world-building')}
                >
                    Creative & World-Building
                </button>
            </div>
            <div className="tool-display-area">
                {renderActiveToolComponent()}
            </div>
        </div>
    );
};

export default GamingTools;