import React, { useState } from 'react';
import './styles/DIYStatsSheet.css'; // Import the dedicated CSS for this component

const DiyStatsSheet = () => {
    const [sheetTitle, setSheetTitle] = useState('');
    const [stats, setStats] = useState([{ name: '', value: '' }]);

    const handleAddStat = () => {
        setStats([...stats, { name: '', value: '' }]);
    };

    const handleStatChange = (index, field, value) => {
        const newStats = [...stats];
        newStats[index][field] = value;
        setStats(newStats);
    };

    const handleGeneratePdf = () => {
        // This is where you would implement the PDF generation logic.
        // For now, let's just log the data.
        console.log("Generating PDF for:", {
            title: sheetTitle,
            stats: stats
        });
        alert('PDF generation logic would go here! Check console for data.');
    };

    return (
        <div className="tool-card diy-stats-sheet-tool">
            <h3>DIY Stats Sheet</h3>

            <input
                type="text"
                className="sheet-title-input"
                placeholder="Sheet Title (e.g., Character Name)"
                value={sheetTitle}
                onChange={(e) => setSheetTitle(e.target.value)}
            />

            {stats.map((stat, index) => (
                <div key={index} className="stat-input-row">
                    <input
                        type="text"
                        placeholder="Stat Name (e.g., Strength, HP)"
                        value={stat.name}
                        onChange={(e) => handleStatChange(index, 'name', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Stat Value (e.g., 18, 100)"
                        value={stat.value}
                        onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                    />
                    {/* You might add a remove button for stats here later */}
                </div>
            ))}

            <button className="add-stat-button" onClick={handleAddStat}>
                Add Stat
            </button>
            <button className="generate-pdf-button" onClick={handleGeneratePdf}>
                Generate PDF
            </button>

            <p className="calc-tip">
                *Build your own custom character or item stat sheets.
            </p>
        </div>
    );
};

export default DiyStatsSheet;