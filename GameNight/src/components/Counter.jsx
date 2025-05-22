// src/components/Counter.jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    const [label, setLabel] = useState('HP');

    return (
        <div className="tool-card counter-card">
            <h3>{label} Counter</h3>
            <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="counter-label-input"
                placeholder="e.g., HP, Ammo, Gold"
            />
            <div className="counter-display">{count}</div>
            <div className="counter-controls">
                <button onClick={() => setCount(prev => prev - 1)}>-1</button>
                <button onClick={() => setCount(prev => prev + 1)}>+1</button>
                <button onClick={() => setCount(0)}>Reset</button>
            </div>
            <div className="counter-quick-adjust">
                <button onClick={() => setCount(prev => prev - 5)}>-5</button>
                <button onClick={() => setCount(prev => prev + 5)}>+5</button>
                <button onClick={() => setCount(prev => prev - 10)}>-10</button>
                <button onClick={() => setCount(prev => prev + 10)}>+10</button>
            </div>
        </div>
    );
}

export default Counter;