// src/components/AltarOfKhorne.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- NEW IMPORT: useNavigate

function AltarOfKhorne() {
    // We no longer need donationLink if these buttons are just for Khorne's laughs
    // const donationLink = "https://example.com/your-donation-page";

    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleButtonClick = () => { // Renamed from handleDonationClick for clarity
        navigate('/khorne-laughs'); // <--- MODIFIED: Navigate directly to Khorne's laugh page
    };

    return (
        <div className="altar-of-khorne-container">
            <h2>The Altar to the Blood God</h2>
            <img
                src="/khorne_skull_icon.png" // Your image path here
                alt="Skull Icon for Khorne, the Blood God"
                className="khorne-icon"
            />
            <p>
                Offerings of blood, skulls, or even a small monetary tribute are always appreciated by Khorne.
                Glory to the Skull Throne!
            </p>
            {/* MODIFIED: Both buttons now call handleButtonClick */}
            <button className="khorne-button" onClick={handleButtonClick}>
                Blood for the Blood God!
            </button>
            <button className="khorne-button" onClick={handleButtonClick} style={{ marginLeft: '10px' }}>
                Skulls for the Skull Throne!
            </button>

            {/* REMOVED: The separate "Hear Khorne's Approval!" link is gone */}
        </div>
    );
}

export default AltarOfKhorne;