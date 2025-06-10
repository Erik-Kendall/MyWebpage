// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useColorblind } from '../contexts/ColorblindContext';
import DoNotPushButton from '../components/DoNotPushButton';
import PushMeButton from '../components/PushMeButton';
import GodAltarContent from '../components/GodAltarContent';
// MODIFIED: Import ALL_GOD_DATA and ALL_GOD_SOUND_PATHS
import { GOD_NAMES, ALL_GOD_DATA, ALL_GOD_SOUND_PATHS } from '../utils/godsData.jsx';
import useGameNightCountdown from '../hooks/useGameNightCountdown';
import useButtonGame from '../hooks/useButtonGame';
import { useSecrets } from '../contexts/SecretsContext';
import './styles/Home.css';

const Home = ({ setSiteShakeOn }) => {
    const [activeTab, setActiveTab] = useState('welcome');
    const { colorblindMode, toggleColorblindMode } = useColorblind();
    // Get unboundCurrentUnlocked from useSecrets
    const { incrementSecretsFound, isSecretFound, unboundCurrentUnlocked } = useSecrets();

    // Use custom hooks
    const timeLeft = useGameNightCountdown(); // timeLeft is defined here
    const {
        clickCount,
        jiggleOn,
        superJiggleOn,
        surpriseMessage,
        krillinAudioRef,
        handlePushMeClick,
        handleDoNotPushClick,
        handleKrillinClick,
        toggleJiggle,
        getJiggleButtonText,
        handleSurpriseButtonClick,
        handleMysteryButtonClick,
    } = useButtonGame(setSiteShakeOn);

    // State for the currently active god in the "Altar" tab
    const [activeGodName, setActiveGodName] = useState(null);

    // --- NEW ALAR SECRETS STATES ---
    const [altarClickCount, setAltarClickCount] = useState(0);
    // This tracks the god active when the current altarClickCount started accumulating
    const [altarClickCurrentGod, setAltarClickCurrentGod] = useState(null);
    const [playedGodSounds, setPlayedGodSounds] = useState(new Set()); // For "Divine Harmony"

    // --- MODIFICATION START ---
    // Memoized list of god names available for random selection on the altar
    // This is where "The Unbound Current" is conditionally included
    const displayableGodNames = useMemo(() => {
        // Start with all god names (excluding the secret one initially)
        const filteredNames = GOD_NAMES.filter(name => {
            const god = ALL_GOD_DATA[name];
            return !god.isSecretGod; // Exclude secret gods by default
        });

        // If unboundCurrentUnlocked is true, add 'The Unbound Current' to the list
        if (unboundCurrentUnlocked) {
            // Ensure 'The Unbound Current' is only added if it exists in ALL_GOD_DATA
            // and it's the specific secret god we are looking for.
            if (ALL_GOD_DATA["The Unbound Current"] && ALL_GOD_DATA["The Unbound Current"].isSecretGod) {
                filteredNames.push("The Unbound Current");
            }
        }
        return filteredNames;
    }, [unboundCurrentUnlocked]); // Recalculate if unboundCurrentUnlocked changes
    // --- MODIFICATION END ---


    // --- Secret #1: The Constant Flow (Hidden Text Click) ---
    const handleConstantFlowClick = () => {
        const secretId = 'secret-constant-flow';
        if (!isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
            console.log(`Secret Found! ID: ${secretId}`);
        }
    };

    // --- Secret #2: The Shifting Sands (Countdown Timer Interaction) ---
    const handleShiftingSandsClick = () => {
        const secretId = 'secret-shifting-sands';
        if (!isSecretFound(secretId)) {
            // Ensure timeLeft is a string before calling match
            const secondsMatch = (timeLeft || '').match(/(\d+)s$/);
            if (secondsMatch && secondsMatch[1]) {
                const seconds = parseInt(secondsMatch[1], 10);
                if (seconds % 2 !== 0) { // Condition: Seconds part is odd
                    incrementSecretsFound(secretId);
                    console.log(`Secret Found! ID: ${secretId}`);
                }
            }
        }
    };

    // --- Secret #8: The Ancient Tome (Blood God text clicks) ---
    const handleAncientTomeClick = (event) => {
        const secretId = 'secret-ancient-tome';
        if (isSecretFound(secretId)) return;

        // Check if the clicked element has the specific class for secret words
        if (event.target.classList.contains('secret-blood-god-word')) {
            incrementSecretsFound(secretId);
            console.log(`Secret Found! ID: ${secretId}. Clicked: ${event.target.dataset.secretWord}`);
        }
    };

    // --- Secret #9: The Divine Harmony (Play all God sounds) ---
    useEffect(() => {
        const handleAudioPlayback = () => {
            const godData = ALL_GOD_DATA[activeGodName];
            if (godData && godData.soundPath) {
                setPlayedGodSounds(prev => {
                    const newSet = new Set(prev);
                    if (godData.soundPath) {
                        newSet.add(godData.soundPath);
                    }
                    return newSet;
                });
            }
        };

        if (activeTab === 'altar' && activeGodName) {
            handleAudioPlayback();
        }

    }, [activeTab, activeGodName]);

    useEffect(() => {
        const secretId = 'secret-divine-harmony';
        if (!isSecretFound(secretId) && playedGodSounds.size > 0) {
            if (playedGodSounds.size === ALL_GOD_SOUND_PATHS.length) {
                incrementSecretsFound(secretId);
                console.log(`Secret Found! ID: ${secretId}. All God sounds played!`);
            }
        }
    }, [playedGodSounds, isSecretFound, incrementSecretsFound, ALL_GOD_SOUND_PATHS.length]);


    // --- Secret #10: The Unseen Hand (Altar clicks without changing God) ---
    const handleAltarClick = () => {
        if (activeGodName === altarClickCurrentGod) {
            setAltarClickCount(prev => prev + 1);
        } else {
            setAltarClickCount(1);
            setAltarClickCurrentGod(activeGodName);
        }
    };

    useEffect(() => {
        if (activeTab === 'altar') {
            if (activeGodName !== altarClickCurrentGod) {
                setAltarClickCount(0);
                setAltarClickCurrentGod(activeGodName);
            }
        } else {
            setAltarClickCount(0);
            setAltarClickCurrentGod(null);
        }
    }, [activeTab, activeGodName, altarClickCurrentGod]);

    useEffect(() => {
        const secretId = 'secret-unseen-hand';
        if (activeTab === 'altar' && activeGodName && altarClickCount === 15 && !isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
            console.log(`Secret Found! ID: ${secretId}. Altar clicked 15 times for ${activeGodName}!`);
            setAltarClickCount(0);
        }
    }, [altarClickCount, activeTab, activeGodName, isSecretFound, incrementSecretsFound]);


    return (
        <section
            className={`content ${jiggleOn ? 'jiggle-on' : ''} ${superJiggleOn ? 'super-jiggle-on' : ''}`}
        >
            <audio ref={krillinAudioRef} src="/server/sounds/krillin-voice.mp3" preload="auto" />

            <h1>Welcome to Game Night!</h1>

            {/* Bootstrap Tabs Navigation */}
            <ul className="nav nav-tabs justify-content-center mt-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'welcome' ? 'active' : ''}`}
                        onClick={() => setActiveTab('welcome')}
                    >
                        Welcome & Countdown
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'buttons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('buttons')}
                    >
                        Buttons to Play With
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'altar' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('altar');
                            // MODIFIED: Use displayableGodNames for random selection
                            // Ensure displayableGodNames is not empty before picking a random index
                            const selectedGodName = displayableGodNames.length > 0
                                ? displayableGodNames[Math.floor(Math.random() * displayableGodNames.length)]
                                : null; // Handle case where no gods are available
                            setActiveGodName(selectedGodName);
                            // IMPORTANT: Reset altar clicks when a new god is randomly chosen for the tab
                            setAltarClickCount(0);
                            setAltarClickCurrentGod(selectedGodName);
                        }}
                    >
                        Altar to the ? God
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content mt-3">
                {activeTab === 'welcome' && (
                    <div className="tab-pane fade show active">
                        <p className="intro-paragraph first-line-emphasis">
                            We meet every Friday at 5:00 <span
                            id="secret-constant-flow-pm"
                            className={isSecretFound('secret-constant-flow') ? '' : 'secret-pm-text'}
                            onClick={handleConstantFlowClick}
                            title={isSecretFound('secret-constant-flow') ? '' : 'Perpetual Motion.'}
                            style={{ cursor: 'pointer' }}
                        >PM.</span>
                        </p>
                        <p className="intro-paragraph">Looking for a game night? Explore the Schedule to find events,
                            manage your Games collection, and easily Find Users to expand your gaming circle and send
                            friend requests!</p>

                        <div className="welcome-small-buttons-container">
                            <button
                                onClick={toggleJiggle}
                                className={`jiggle-toggle-button ${jiggleOn || superJiggleOn ? 'active' : ''}`}
                            >
                                {getJiggleButtonText()}
                            </button>

                            <button
                                onClick={toggleColorblindMode}
                                className="colorblind-toggle-button"
                            >
                                {colorblindMode ? 'Disable Colorblind Mode' : 'Enable Colorblind Mode'}
                            </button>
                        </div>

                        <hr className="home-divider" />

                        <h2>Countdown to Next Game Night</h2>
                        <p className="countdown-timer">
                            {/* Secret #2: Shifting Sands */}
                            {/* MODIFIED: Add defensive check for timeLeft */}
                            {(timeLeft || '').split(' ').map((part, index, arr) => (
                                <span key={index}
                                      className={part.endsWith('s') && !isSecretFound('secret-shifting-sands') ? 'secret-seconds-part' : ''}
                                      onClick={part.endsWith('s') ? handleShiftingSandsClick : undefined}
                                      style={{ cursor: part.endsWith('s') ? 'pointer' : 'default' }}
                                      title={part.endsWith('s') && !isSecretFound('secret-shifting-sands') ? 'Observe the fleeting moment.' : ''}
                                >
                                    {part}
                                    {index < arr.length - 1 ? ' ' : ''}
                                </span>
                            ))}
                        </p>

                        <hr className="home-divider" />

                        <div className="welcome-info-grid">
                            <div className="info-card">
                                <h3>Featured Game of the Week: **Daggerheart, by Critical Role**</h3>
                                <p>This week, we're diving into the epic world of Daggerheart, the new fantasy TTRPG from Critical Role! Forge your destiny, face perilous challenges, and tell unforgettable stories in a world shaped by your choices.</p>
                                <p className="small-text">Learn more at: <a href="https://darringtonpress.com/daggerheart" target="_blank" rel="noopener noreferrer">Darrington Press</a></p>
                            </div>

                            <div className="info-card">
                                <h3>Did You Know?</h3>
                                <p>"The average board game player owns 16 games."</p>
                                <p className="small-text">Source: BoardGameGeek survey data (fictional for example)</p>
                            </div>

                            <div className="info-card">
                                <h3>Upcoming Themes & Events</h3>
                                <p><strong>June 7th:</strong> Co-op Chaos Night!</p>
                                <p><strong>June 14th:</strong> RPG One-Shot Night!</p>
                                <p>Stay tuned for more details on the Schedule page!</p>
                            </div>
                        </div>

                        <hr className="home-divider" />
                    </div>
                )}

                {activeTab === 'buttons' && (
                    <div className="tab-pane fade show active">
                        <h2>Krillin Owned Count</h2>
                        <button
                            onClick={handleKrillinClick}
                            className="krillin-button"
                        >
                            Click Me! (Clicked {clickCount} times)
                        </button>

                        <hr className="home-divider" />

                        <div className="do-not-push-and-push-me-group">
                            <DoNotPushButton onClick={handleDoNotPushClick} />
                            <PushMeButton
                                onClick={handlePushMeClick}
                                jiggleOn={jiggleOn}
                                superJiggleOn={superJiggleOn}
                            />
                        </div>

                        <hr className="home-divider" />

                        <div className="mystery-and-surprise-group">
                            <button className="mystery-button" onClick={handleMysteryButtonClick}>
                                The Mystery Button
                            </button>
                            <div className="surprise-button-group">
                                <button className="surprise-button" onClick={handleSurpriseButtonClick}>
                                    Surprise!
                                </button>
                                {surpriseMessage && <p className="surprise-message">{surpriseMessage}</p>}
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'altar' && (
                    <div className="tab-pane fade show active">
                        {activeGodName ? (
                            <GodAltarContent
                                godName={activeGodName}
                                onAltarClick={handleAltarClick} // Prop for Secret #10
                                onSecretTextClick={handleAncientTomeClick} // Prop for Secret #8
                            />
                        ) : (
                            // Fallback if no god is selected (e.g., displayableGodNames is empty)
                            <p>Click the "Altar to the ? God" tab to reveal its secrets!</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Home;