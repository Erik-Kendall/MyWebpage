// src/components/DoNotPushButton.jsx
import React, { useState } from 'react';

function DoNotPushButton() {
    // `buttonText` will hold the message displayed *on* the button
    const [buttonText, setButtonText] = useState("DO NOT PUSH");
    // `pushCount` will track the total number of times the button has been clicked
    const [pushCount, setPushCount] = useState(0);

    const handlePush = () => {
        const newPushCount = pushCount + 1; // Increment the count
        setPushCount(newPushCount); // Update the state

        let newMessage = "Okay, you really like pushing buttons, don't you?"; // Default message

        // Logic to determine the message based on the push count
        if (newPushCount === 1) {
            newMessage = "Seriously, don't.";
        } else if (newPushCount === 2) {
            newMessage = "I warned you. This is your last chance!";
        } else if (newPushCount === 3) {
            newMessage = "Aha! You pushed it! Nothing happened. You rebel.";
        } else if (newPushCount === 10) { // New message at 10 pushes
            newMessage = "Okay, this is getting ridiculous. 10 pushes?!";
        } else if (newPushCount === 20) { // New message at 20 pushes
            newMessage = "20 pushes? Are you trying to break the internet?";
        } else if (newPushCount === 100) { // New message at 100 pushes
            newMessage = "ONE HUNDRED PUSHES?! You've officially achieved button-mashing nirvana.";
        } else if (newPushCount === 1000) { // New message at 1000 pushes
            newMessage = "A THOUSAND PUSHES?! My finger hurts just thinking about it. You're a legend!";
        }
        // If `newPushCount` doesn't match any of the specific `if` conditions,
        // it will fall back to the `newMessage` defined at the beginning of the function.

        setButtonText(newMessage); // Update the message displayed on the button
    };

    return (
        <div className="do-not-push-container">
            <button
                className="do-not-push-button"
                onClick={handlePush}
            >
                {buttonText} {/* The text on the button comes from the state */}
            </button>
            {/* This message will appear below the button, showing the current count.
                It starts showing after the 3rd push (when the initial "rebel" message appears). */}
            {pushCount >= 3 && <p className="push-message">You've pushed it {pushCount} times!</p>}
        </div>
    );
}

export default DoNotPushButton;