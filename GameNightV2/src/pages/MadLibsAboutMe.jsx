// src/pages/MadLibsAboutMe.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useColorblind } from '../contexts/ColorblindContext';
import '../App.css'; // Keep this import for MadLibs-specific styles
// REMOVED: import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext'; // Using useAuth context

const MadLibsAboutMe = ({ onStorySaved, initialMadLibStory }) => {
    const { colorblindMode } = useColorblind();
    const { token } = useAuth(); // Use useAuth to get token

    const [placeholders, setPlaceholders] = useState({
        noun1: '',
        adjective1: '',
        verb1: '',
        pluralNoun1: '',
        adverb1: '',
        animal: '',
        verbEndingInIng: '',
        adjective2: '',
        personName: '',
        noun2: '',
        emotion: '',
        number: '',
    });

    const [storyGenerated, setStoryGenerated] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialMadLibStory) {
            setStoryGenerated(true);
            setError('');
        } else {
            setPlaceholders({
                noun1: '', adjective1: '', verb1: '', pluralNoun1: '',
                adverb1: '', animal: '', verbEndingInIng: '', adjective2: '',
                personName: '', noun2: '', emotion: '', number: '',
            });
            setStoryGenerated(false);
        }
    }, [initialMadLibStory]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaceholders(prev => ({ ...prev, [name]: value }));
        setStoryGenerated(false);
        setSuccess('');
        setError('');
    };

    const generateStory = () => {
        const allFilled = Object.values(placeholders).every(value => value.trim() !== '');
        if (allFilled) {
            setStoryGenerated(true);
            setSuccess('');
            setError('');
        } else {
            setError('Please fill in all the blanks to generate your story!');
            setSuccess('');
            setStoryGenerated(false);
        }
    };

    const resetForm = () => {
        setPlaceholders({
            noun1: '',
            adjective1: '',
            verb1: '',
            pluralNoun1: '',
            adverb1: '',
            animal: '',
            verbEndingInIng: '',
            adjective2: '',
            personName: '',
            noun2: '',
            emotion: '',
            number: '',
        });
        setStoryGenerated(false);
        setSuccess('');
        setError('');
    };

    const currentStory = initialMadLibStory && storyGenerated ? initialMadLibStory : `
        Hello there! My name is ${placeholders.personName || '[Your Name]'} and I'm a total ${placeholders.adjective1 || '[Adjective]'} ${placeholders.noun1 || '[Noun]'} enthusiast.
        My typical day involves ${placeholders.verbEndingInIng || '[Verb Ending in -ing]'} around, usually with a ${placeholders.animal || '[Animal]'} by my side.
        I love to ${placeholders.verb1 || '[Verb]'} ${placeholders.adverb1 || '[Adverb]'} and explore new ${placeholders.pluralNoun1 || '[Plural Noun]'}.
        Sometimes, I feel incredibly ${placeholders.emotion || '[Emotion]'} when I think about how many ${placeholders.noun2 || '[Noun]'} there are in the world.
        I've been gaming for over ${placeholders.number || '[Number]'} years, and I'm always looking for a new, ${placeholders.adjective2 || '[Adjective]'} adventure!
    `.trim();

    const handlePostToProfile = async () => {
        if (!storyGenerated) {
            setError('Please generate the Mad Lib story before posting.');
            setSuccess('');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/profile/madlib', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use token from useAuth
                },
                body: JSON.stringify({ madLibStory: currentStory }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || 'Mad Lib story posted to your profile!');
                setError('');
                if (onStorySaved) {
                    onStorySaved(currentStory);
                }
            } else {
                setError(data.message || 'Failed to post Mad Lib story.');
                setSuccess('');
            }
        } catch (err) {
            console.error('Error posting Mad Lib to profile:', err);
            setError('Network error posting Mad Lib story.');
            setSuccess('');
        }
    };

    const handleClearMadLib = async () => {
        try {
            const response = await fetch('http://localhost:3001/profile/madlib', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ madLibStory: '' }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message || 'Mad Lib story cleared from your profile!');
                setError('');
                setStoryGenerated(false);
                resetForm();
                if (onStorySaved) {
                    onStorySaved(null);
                }
            } else {
                setError(data.message || 'Failed to clear Mad Lib story.');
                setSuccess('');
            }
        } catch (err) {
            console.error('Error clearing Mad Lib from profile:', err);
            setError('Network error clearing Mad Lib story.');
            setSuccess('');
        }
    };

    return (
        <section className={`content madlibs-about-me ${colorblindMode ? 'colorblind-mode' : ''}`}>
            {/* Left Junimo Banner - Individual Junimos */}
            <div className="junimo-banner left">
                <img src="/images/blue_junimo.gif" alt="Blue Junimo" className="junimo-side-sprite" />
                <img src="/images/golden_junimo.gif" alt="Golden Junimo" className="junimo-side-sprite" />
                <img src="/images/green_junimo.gif" alt="Green Junimo" className="junimo-side-sprite" />
            </div>

            <h1 className="madlibs-title">
                {/* Soot Sprite near the title */}
                <img src="/images/soot_sprite.gif" alt="Soot Sprite" className="soot-sprite-left" />
                About Me - The Mad Libs Edition!
                <img src="/images/soot_sprite.gif" alt="Soot Sprite" className="soot-sprite-right" />
            </h1>
            <p className="madlibs-instruction">Fill in the blanks and hit "Generate Story" to discover a fun "About Me"!</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!storyGenerated || (initialMadLibStory && !Object.values(placeholders).every(value => value.trim() !== '')) ? (
                <div className="madlibs-form-grid">
                    <div className="madlibs-input-group">
                        <label htmlFor="personName">Your Name:</label>
                        <input type="text" id="personName" name="personName" value={placeholders.personName} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="adjective1">Adjective:</label>
                        <input type="text" id="adjective1" name="adjective1" value={placeholders.adjective1} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="noun1">Noun:</label>
                        <input type="text" id="noun1" name="noun1" value={placeholders.noun1} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="verbEndingInIng">Verb ending in -ing:</label>
                        <input type="text" id="verbEndingInIng" name="verbEndingInIng" value={placeholders.verbEndingInIng} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="animal">Animal:</label>
                        <input type="text" id="animal" name="animal" value={placeholders.animal} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="verb1">Verb:</label>
                        <input type="text" id="verb1" name="verb1" value={placeholders.verb1} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="adverb1">Adverb:</label>
                        <input type="text" id="adverb1" name="adverb1" value={placeholders.adverb1} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="pluralNoun1">Plural Noun:</label>
                        <input type="text" id="pluralNoun1" name="pluralNoun1" value={placeholders.pluralNoun1} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="emotion">Emotion:</label>
                        <input type="text" id="emotion" name="emotion" value={placeholders.emotion} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="noun2">Another Noun:</label>
                        <input type="text" id="noun2" name="noun2" value={placeholders.noun2} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="number">Number:</label>
                        <input type="number" id="number" name="number" value={placeholders.number} onChange={handleChange} />
                    </div>
                    <div className="madlibs-input-group">
                        <label htmlFor="adjective2">Another Adjective:</label>
                        <input type="text" id="adjective2" name="adjective2" value={placeholders.adjective2} onChange={handleChange} />
                    </div>
                    <div className="madlibs-buttons">
                        <button onClick={generateStory}>Generate Story</button>
                    </div>
                    <img src="/images/junimo.gif" alt="Junimo" className="junimo-bottom" />
                </div>
            ) : (
                <div className="madlibs-story">
                    <p>{currentStory}</p>
                    <div className="madlibs-buttons">
                        <button onClick={resetForm}>Start Over</button>
                        <button onClick={handlePostToProfile}>Post to Profile</button>
                        {initialMadLibStory && (
                            <button onClick={handleClearMadLib}>Clear Story from Profile</button>
                        )}
                    </div>
                    <img src="/images/junimo.gif" alt="Junimo" className="junimo-bottom" />
                </div>
            )}

            {/* Right Junimo Banner - Individual Junimos */}
            <div className="junimo-banner right">
                <img src="/images/pale_junimo.gif" alt="Pale Junimo" className="junimo-side-sprite" />
                <img src="/images/purple_junimo.gif" alt="Purple Junimo" className="junimo-side-sprite" />
                <img src="/images/blue_junimo.gif" alt="Blue Junimo" className="junimo-side-sprite" />
            </div>
        </section>
    );
};

export default MadLibsAboutMe;