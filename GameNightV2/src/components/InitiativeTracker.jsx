// src/components/InitiativeTracker.jsx
import React, { useState } from 'react';

function InitiativeTracker() {
    const [combatants, setCombatants] = useState([]);
    const [newCombatantName, setNewCombatantName] = useState('');
    const [newCombatantInitiative, setNewCombatantInitiative] = useState('');
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

    const handleAddCombatant = (e) => {
        e.preventDefault(); // Prevent page reload on form submit
        if (newCombatantName.trim() === '' || newCombatantInitiative === '') {
            alert('Please enter both name and initiative.');
            return;
        }

        const newCombatant = {
            id: Date.now(), // Simple unique ID
            name: newCombatantName.trim(),
            initiative: parseInt(newCombatantInitiative, 10),
        };

        setCombatants((prevCombatants) => {
            const updatedCombatants = [...prevCombatants, newCombatant];
            // Automatically sort when a new combatant is added if there are existing ones
            if (updatedCombatants.length > 1) {
                updatedCombatants.sort((a, b) => b.initiative - a.initiative);
                // Reset turn index after sorting to avoid pointing to wrong combatant
                setCurrentTurnIndex(0);
            }
            return updatedCombatants;
        });

        setNewCombatantName('');
        setNewCombatantInitiative('');
    };

    const handleSortInitiative = () => {
        setCombatants((prevCombatants) => {
            const sorted = [...prevCombatants].sort((a, b) => b.initiative - a.initiative);
            return sorted;
        });
        setCurrentTurnIndex(0); // Reset turn to the top after sorting
    };

    const handleNextTurn = () => {
        if (combatants.length === 0) return;

        setCurrentTurnIndex((prevIndex) => {
            return (prevIndex + 1) % combatants.length;
        });
    };

    const handleRemoveCombatant = (idToRemove) => {
        setCombatants((prevCombatants) => {
            const filtered = prevCombatants.filter((c) => c.id !== idToRemove);
            // Adjust currentTurnIndex if the removed combatant was the current one
            // or if we're at the end of the list
            if (currentTurnIndex >= filtered.length && filtered.length > 0) {
                setCurrentTurnIndex(filtered.length - 1);
            } else if (filtered.length === 0) {
                setCurrentTurnIndex(0);
            }
            return filtered;
        });
    };

    const handleResetTracker = () => {
        setCombatants([]);
        setCurrentTurnIndex(0);
        setNewCombatantName('');
        setNewCombatantInitiative('');
    };

    return (
        <div className="initiative-tracker-container">
            <h2>Initiative Tracker</h2>

            <form onSubmit={handleAddCombatant} className="add-combatant-form">
                <input
                    type="text"
                    placeholder="Combatant Name"
                    value={newCombatantName}
                    onChange={(e) => setNewCombatantName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Initiative Score"
                    value={newCombatantInitiative}
                    onChange={(e) => setNewCombatantInitiative(e.target.value)}
                    required
                />
                <button type="submit" className="add-button">Add Combatant</button>
            </form>

            <div className="tracker-controls">
                <button onClick={handleSortInitiative} className="sort-button" disabled={combatants.length < 2}>Sort Initiative</button>
                <button onClick={handleNextTurn} className="next-turn-button" disabled={combatants.length === 0}>Next Turn</button>
                <button onClick={handleResetTracker} className="reset-button" disabled={combatants.length === 0}>Reset Tracker</button>
            </div>

            {combatants.length > 0 ? (
                <ol className="combatant-list">
                    {combatants.map((combatant, index) => (
                        <li key={combatant.id} className={index === currentTurnIndex ? 'current-turn' : ''}>
                            <span className="combatant-info">
                                {combatant.name} ({combatant.initiative})
                            </span>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveCombatant(combatant.id)}
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="no-combatants-message">No combatants added yet. Add some above!</p>
            )}
        </div>
    );
}

export default InitiativeTracker;