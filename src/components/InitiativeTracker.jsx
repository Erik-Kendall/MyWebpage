import React, { useState } from 'react';
import './styles/InitiativeTracker.css'; // Dedicated CSS for Initiative Tracker

const InitiativeTracker = () => {
    const [combatants, setCombatants] = useState([]);
    const [combatantName, setCombatantName] = useState('');
    const [initiativeScore, setInitiativeScore] = useState('');
    const [currentTurnIndex, setCurrentTurnIndex] = useState(-1); // -1 for no turn active

    const handleAddCombatant = () => {
        if (combatantName.trim() === '' || initiativeScore === '') {
            alert('Please enter both a name and an initiative score.');
            return;
        }

        const newCombatant = {
            id: Date.now(), // Simple unique ID
            name: combatantName.trim(),
            score: parseInt(initiativeScore),
        };

        setCombatants(prevCombatants => [...prevCombatants, newCombatant]);
        setCombatantName('');
        setInitiativeScore('');
    };

    const handleSortInitiative = () => {
        const sortedCombatants = [...combatants].sort((a, b) => b.score - a.score); // Descending order
        setCombatants(sortedCombatants);
        setCurrentTurnIndex(0); // Set first combatant as current turn after sorting
    };

    const handleNextTurn = () => {
        if (combatants.length === 0) return;

        setCurrentTurnIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % combatants.length;
            return nextIndex;
        });
    };

    const handleResetTracker = () => {
        setCombatants([]);
        setCombatantName('');
        setInitiativeScore('');
        setCurrentTurnIndex(-1);
    };

    const handleDeleteCombatant = (id) => {
        setCombatants(prevCombatants => prevCombatants.filter(c => c.id !== id));
        // Adjust current turn if the deleted combatant was the current one or before it
        if (currentTurnIndex !== -1) {
            if (combatants[currentTurnIndex] && combatants[currentTurnIndex].id === id) {
                // If current turn was deleted, move to next or reset if last one
                if (combatants.length - 1 === 0) { // If it was the only one left
                    setCurrentTurnIndex(-1);
                } else {
                    setCurrentTurnIndex(prevIndex => prevIndex % (combatants.length - 1));
                }
            } else if (currentTurnIndex > 0 && combatants.findIndex(c => c.id === id) < currentTurnIndex) {
                // If a combatant before the current one was deleted, shift index back
                setCurrentTurnIndex(prevIndex => prevIndex - 1);
            }
        }
    };


    return (
        <div className="tool-card initiative-tracker-card">
            <h2>Initiative Tracker</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Combatant Name"
                    value={combatantName}
                    onChange={(e) => setCombatantName(e.target.value)}
                    className="combatant-input"
                />
                <input
                    type="number"
                    placeholder="Initiative Score"
                    value={initiativeScore}
                    onChange={(e) => setInitiativeScore(e.target.value)}
                    className="initiative-input"
                />
                <button onClick={handleAddCombatant} className="add-button">Add Combatant</button>
            </div>

            <div className="tracker-controls">
                <button onClick={handleSortInitiative} className="sort-button" disabled={combatants.length === 0}>Sort Initiative</button>
                <button onClick={handleNextTurn} className="next-turn-button" disabled={combatants.length === 0}>Next Turn</button>
                <button onClick={handleResetTracker} className="reset-button" disabled={combatants.length === 0}>Reset Tracker</button>
            </div>

            <div className="combatant-list">
                {combatants.length === 0 ? (
                    <p className="empty-message">No combatants added yet. Add some above!</p>
                ) : (
                    <ul>
                        {combatants.map((combatant, index) => (
                            <li key={combatant.id} className={index === currentTurnIndex ? 'current-turn' : ''}>
                                <span className="combatant-details">
                                    {combatant.name} ({combatant.score})
                                </span>
                                <button
                                    onClick={() => handleDeleteCombatant(combatant.id)}
                                    className="delete-combatant-button"
                                >
                                    &times; {/* HTML entity for a multiplication sign / 'x' */}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default InitiativeTracker;