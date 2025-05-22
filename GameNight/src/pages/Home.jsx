import React, { useState, useEffect, useRef } from 'react';
import { useColorblind } from '../contexts/ColorblindContext';
import DoNotPushButton from '../components/DoNotPushButton';
import PushMeButton from '../components/PushMeButton';
import AltarOfKhorne from '../components/AltarOfKhorne';

const Home = () => {
    const [clickCount, setClickCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');
    const [jiggleOn, setJiggleOn] = useState(false);
    const [superJiggleOn, setSuperJiggleOn] = useState(false);
    const krillinAudioRef = useRef(null);
    const [activeTab, setActiveTab] = useState('welcome'); // State for active tab

    const { colorblindMode, toggleColorblindMode } = useColorblind();

    useEffect(() => {
        function getNextFridayFivePm() {
            const now = new Date();
            const dayOfWeek = now.getDay();
            let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
            if (daysUntilFriday === 0 && now.getHours() >= 17) {
                daysUntilFriday = 7;
            }
            const nextFriday = new Date(now);
            nextFriday.setDate(now.getDate() + daysUntilFriday);
            nextFriday.setHours(17, 0, 0, 0);
            return nextFriday;
        }

        function updateTimer() {
            const now = new Date();
            const nextFriday = getNextFridayFivePm();
            const diffMs = nextFriday - now;

            if (diffMs <= 0) {
                setTimeLeft('Game Night is on now!');
                return;
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }

        updateTimer();
        const timerId = setInterval(updateTimer, 60000);
        return () => clearInterval(timerId);
    }, []);

    const handleKrillinClick = () => {
        setClickCount(clickCount + 1);
        if (krillinAudioRef.current) {
            krillinAudioRef.current.currentTime = 0;
            krillinAudioRef.current.play();
        }
    };

    const toggleJiggle = () => {
        if (!jiggleOn && !superJiggleOn) {
            setJiggleOn(true);
            setSuperJiggleOn(false);
        } else if (jiggleOn && !superJiggleOn) {
            setJiggleOn(true);
            setSuperJiggleOn(true);
        } else {
            setJiggleOn(false);
            setSuperJiggleOn(false);
        }
    };

    const getJiggleButtonText = () => {
        if (superJiggleOn) {
            return 'Stop Jiggle Physics';
        } else if (jiggleOn) {
            return 'More Jiggle Physics!';
        } else {
            return 'Start Jiggle Physics';
        }
    };

    return (
        <section
            className="content"
            style={{
                maxWidth: '800px', // Increased max-width for tabs
                margin: '1rem auto',
                padding: '1rem',
                border: '2px solid #444',
                borderRadius: '8px',
                textAlign: 'center',
                animation: superJiggleOn ? 'super-jiggle 0.2s infinite' :
                    jiggleOn ? 'jiggle 0.3s infinite' : 'none',
                backgroundColor: colorblindMode ? '#000' : '#fff',
                color: colorblindMode ? '#FFD700' : '#000',
            }}
        >
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
                        onClick={() => setActiveTab('altar')}
                    >
                        Altar to the Blood God
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content mt-3">
                {activeTab === 'welcome' && (
                    <div className="tab-pane fade show active">
                        <p>We meet every Friday at 5:00 PM.</p>
                        <p>Looking for a game night? Explore the Schedule to find events, manage your Games
                            collection, and easily Find Users to expand your gaming circle and send friend
                            requests!</p>

                        <hr style={{ margin: '1.5rem 0' }} />

                        <h2>Countdown to Next Game Night</h2>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{timeLeft}</p>

                        {/* Moved Jiggle Physics Button */}
                        <button
                            onClick={toggleJiggle}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                backgroundColor: (jiggleOn || superJiggleOn) ? '#ff6b6b' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                marginTop: '1.5rem', // Added margin for spacing
                            }}
                        >
                            {getJiggleButtonText()}
                        </button>

                        {/* Moved Colorblind Mode Button */}
                        <button
                            onClick={toggleColorblindMode}
                            style={{
                                marginTop: '1.5rem', // Adjusted margin for spacing
                                marginLeft: '1rem',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                backgroundColor: colorblindMode ? '#FFD700' : '#333',
                                color: colorblindMode ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                            }}
                        >
                            {colorblindMode ? 'Disable Colorblind Mode' : 'Enable Colorblind Mode'}
                        </button>
                    </div>
                )}

                {activeTab === 'buttons' && (
                    <div className="tab-pane fade show active">
                        <h2>Krillin Owned Count</h2>
                        <button
                            onClick={handleKrillinClick}
                            style={{
                                fontSize: '1.2rem',
                                padding: '0.6rem 1.2rem',
                                cursor: 'pointer',
                                marginBottom: '1rem',
                            }}
                        >
                            Click Me! (Clicked {clickCount} times)
                        </button>
                        <audio ref={krillinAudioRef} src="/krillin-voice.mp3" preload="auto" />

                        <hr style={{ margin: '1.5rem 0' }} />

                        {/* Do Not Push Button */}
                        <DoNotPushButton />

                        {/* Push Me Button */}
                        <PushMeButton />
                    </div>
                )}

                {activeTab === 'altar' && (
                    <div className="tab-pane fade show active">
                        {/* Altar of Khorne Component */}
                        <AltarOfKhorne />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes jiggle {
                    0% { transform: rotate(0deg) translate(0, 0); }
                    25% { transform: rotate(1deg) translate(1px, -1px); }
                    50% { transform: rotate(0deg) translate(0, 0); }
                    75% { transform: rotate(-1deg) translate(-1px, 1px); }
                    100% { transform: rotate(0deg) translate(0, 0); }
                }

                @keyframes super-jiggle {
                    0% { transform: rotate(0deg) translate(0, 0); }
                    25% { transform: rotate(3deg) translate(3px, -3px); }
                    50% { transform: rotate(0deg) translate(0, 0); }
                    75% { transform: rotate(-3deg) translate(-3px, 3px); }
                    100% { transform: rotate(0deg) translate(0, 0); }
                }

                /* NEW CSS TO REMOVE BLACK DOTS */
                .nav-tabs .nav-item {
                    list-style-type: none; /* Removes the default bullet point */
                }
            `}</style>
        </section>
    );
};

export default Home;