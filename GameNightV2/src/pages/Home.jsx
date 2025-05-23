// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useColorblind } from '../contexts/ColorblindContext';
import DoNotPushButton from '../components/DoNotPushButton';
import PushMeButton from '../components/PushMeButton';
import AltarOfKhorne from '../components/AltarOfKhorne';

// Accept setSiteShakeOn as a prop here
const Home = ({ setSiteShakeOn }) => { // <--- ADD THIS PROP
    const [clickCount, setClickCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');
    const [jiggleOn, setJiggleOn] = useState(false);
    const [superJiggleOn, setSuperJiggleOn] = useState(false);
    // Remove the local siteShakeOn state, as it's now managed in App.jsx
    // const [siteShakeOn, setSiteShakeOn] = useState(false); // <--- DELETE THIS LINE
    const krillinAudioRef = useRef(null);
    const [activeTab, setActiveTab] = useState('welcome');

    const { colorblindMode, toggleColorblindMode } = useColorblind();

    const [surpriseMessage, setSurpriseMessage] = useState('');

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
            if(setSiteShakeOn) setSiteShakeOn(false); // Ensure site shake is off when starting jiggle
        } else if (jiggleOn && !superJiggleOn) {
            setJiggleOn(true);
            setSuperJiggleOn(true);
            if(setSiteShakeOn) setSiteShakeOn(false); // Ensure site shake is off when going to super jiggle
        } else { // This is the "Stop Jiggle Physics" case
            setJiggleOn(false);
            setSuperJiggleOn(false);
            if(setSiteShakeOn) { // <--- ACTIVATE SITE SHAKE VIA PROP
                setSiteShakeOn(true);
                // Set a timeout to turn off the site shake after 5 seconds
                setTimeout(() => {
                    setSiteShakeOn(false);
                }, 5000); // 5000 milliseconds = 5 seconds
            }
        }
    };


    const getJiggleButtonText = () => {
        if (superJiggleOn) {
            return 'Stop Jiggle Physics';
        } else if (jiggleOn) {
            return 'More Jiggle Physics!';
        }
        return 'Start Jiggle Physics';
    };

    const handleSurpriseButtonClick = () => {
        const surpriseMessages = [
            "Surprise! You're awesome!",
            "A wild message appeared! It's super effective!",
            "You just earned 100 points for being curious!",
            "Boop! That's the sound of a happy button.",
            "This button thanks you for your attention!"
        ];
        const randomSurprise = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
        setSurpriseMessage(randomSurprise);
    };

    return (
        <section
            className="content"
            style={{
                maxWidth: '1000px',
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
                                marginTop: '1.5rem',
                            }}
                        >
                            {getJiggleButtonText()}
                        </button>

                        {/* Moved Colorblind Mode Button */}
                        <button
                            onClick={toggleColorblindMode}
                            style={{
                                marginTop: '1.5rem',
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
                        <audio ref={krillinAudioRef} src="/audio/krillin-voice.mp3" preload="auto" />

                        <hr style={{ margin: '1.5rem 0' }} />

                        {/* Wrapper for the DoNotPush and PushMe buttons */}
                        <div className="special-buttons-container">
                            <DoNotPushButton />
                            <PushMeButton />
                        </div>

                        <hr style={{ margin: '1.5rem 0' }} />

                        <div className="new-extra-buttons-section">
                            <button className="mystery-button">
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
                    list-style-type: none;
                }
            `}</style>
        </section>
    );
};

export default Home;