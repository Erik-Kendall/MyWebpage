// src/pages/MadLibsAboutMe.jsx
import React, { useState } from 'react';
import { useColorblind } from '../contexts/ColorblindContext'; // Keep this if you use it for styling

const MadLibsAboutMe = () => {
    const { colorblindMode } = useColorblind(); // Use colorblindMode if needed for styles

    // Define the placeholders and initial values
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaceholders(prev => ({ ...prev, [name]: value }));
    };

    const generateStory = () => {
        // Simple check to ensure all fields are filled
        const allFilled = Object.values(placeholders).every(value => value.trim() !== '');
        if (allFilled) {
            setStoryGenerated(true);
        } else {
            alert('Please fill in all the blanks to generate your story!');
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
    };

    const story = `
        Hello there! My name is ${placeholders.personName || '[Your Name]'} and I'm a total ${placeholders.adjective1 || '[Adjective]'} ${placeholders.noun1 || '[Noun]'} enthusiast.
        My typical day involves ${placeholders.verbEndingInIng || '[Verb Ending in -ing]'} around, usually with a ${placeholders.animal || '[Animal]'} by my side.
        I love to ${placeholders.verb1 || '[Verb]'} ${placeholders.adverb1 || '[Adverb]'} and explore new ${placeholders.pluralNoun1 || '[Plural Noun]'}.
        Sometimes, I feel incredibly ${placeholders.emotion || '[Emotion]'} when I think about how many ${placeholders.noun2 || '[Noun]'} there are in the world.
        I've been gaming for over ${placeholders.number || '[Number]'} years, and I'm always looking for a new, ${placeholders.adjective2 || '[Adjective]'} adventure!
    `;

    return (
        <section className="content madlibs-about-me">
            <h1 className="madlibs-title">About Me - The Mad Libs Edition!</h1>
            <p className="madlibs-instruction">Fill in the blanks and hit "Generate Story" to discover a fun "About Me"!</p>

            {!storyGenerated ? (
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
                </div>
            ) : (
                <div className="madlibs-story">
                    <p>{story}</p>
                    <button onClick={resetForm}>Start Over</button>
                </div>
            )}
        </section>
    );
};

export default MadLibsAboutMe;