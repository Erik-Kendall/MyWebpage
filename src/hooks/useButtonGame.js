// src/hooks/useButtonGame.js
import { useState, useEffect, useRef } from 'react';
import { useSecrets } from '../contexts/SecretsContext';

const useButtonGame = (setSiteShakeOn) => {
    const [clickCount, setClickCount] = useState(0); // For Push Me/Krillin
    const [jiggleOn, setJiggleOn] = useState(false);
    const [superJiggleOn, setSuperJiggleOn] = useState(false);
    const [surpriseMessage, setSurpriseMessage] = useState('');
    const krillinAudioRef = useRef(null);

    // --- Secret-specific counters ---
    const [doNotPushClickCount, setDoNotPushClickCount] = useState(0); // For "The Anti-Presser"
    const [mysteryButtonClickCount, setMysteryButtonClickCount] = useState(0); // For "The Secret Message"
    const [surpriseButtonRevealCount, setSurpriseButtonRevealCount] = useState(0); // For "The Surprise Revealer"

    // Ref for "The Jiggling Anomaly"
    const jiggleStartTimeRef = useRef(0);
    const { incrementSecretsFound, isSecretFound } = useSecrets();

    // Helper function to handle shared click logic for Push Me and Krillin
    const handleGenericClick = () => {
        setClickCount(prev => prev + 1);
        if (krillinAudioRef.current) {
            krillinAudioRef.current.currentTime = 0;
            krillinAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
        if (setSiteShakeOn) setSiteShakeOn(true);

        if (clickCount + 1 >= 50) {
            setSuperJiggleOn(true);
        } else if (clickCount + 1 >= 10) {
            setJiggleOn(true);
        }
    }

    const handlePushMeClick = () => {
        handleGenericClick();
    };

    const handleDoNotPushClick = () => {
        setDoNotPushClickCount(prev => {
            const newCount = prev + 1;
            console.log("handleDoNotPushClick: Current doNotPushClickCount is now:", newCount); // <--- ADD THIS LINE
            return newCount;
        });
        setClickCount(0); // Reset main button count as per existing logic
        setJiggleOn(false);
        setSuperJiggleOn(false);
        if (setSiteShakeOn) setSiteShakeOn(false);
        setSurpriseMessage(''); // Clear surprise message on reset
    };

    const handleKrillinClick = () => {
        handleGenericClick();
    };

    const toggleJiggle = () => {
        const secretId = 'secret-jiggling-anomaly';

        if (!jiggleOn && !superJiggleOn) {
            setJiggleOn(true);
            setSuperJiggleOn(false);
            if(setSiteShakeOn) setSiteShakeOn(false);
            jiggleStartTimeRef.current = Date.now();

        } else if (jiggleOn && !superJiggleOn) {
            setJiggleOn(true);
            setSuperJiggleOn(true);
            if(setSiteShakeOn) setSiteShakeOn(false);

        } else {
            setJiggleOn(false);
            setSuperJiggleOn(false);

            if (jiggleStartTimeRef.current !== 0 && !isSecretFound(secretId)) {
                const duration = Date.now() - jiggleStartTimeRef.current;
                const RAPID_JIGGLE_THRESHOLD_MS = 2000;

                if (duration > 0 && duration <= RAPID_JIGGLE_THRESHOLD_MS) {
                    incrementSecretsFound(secretId);
                }
            }
            jiggleStartTimeRef.current = 0;

            if(setSiteShakeOn) {
                setSiteShakeOn(true);
                setTimeout(() => {
                    setSiteShakeOn(false);
                }, 5000);
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
        setSurpriseButtonRevealCount(prev => prev + 1);

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

    const handleMysteryButtonClick = () => {
        setMysteryButtonClickCount(prev => prev + 1);
        console.log("handleMysteryButtonClick: Mystery button clicked:", mysteryButtonClickCount + 1);
    };

    // --- useEffect hooks for triggering secrets based on state changes ---

    // Secret: The Over-Pusher
    useEffect(() => {
        const secretId = 'secret-over-pusher';
        if (clickCount === 100 && !isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
        }
    }, [clickCount, isSecretFound, incrementSecretsFound]);

    // Secret: The Anti-Presser
    useEffect(() => {
        const secretId = 'secret-anti-presser';
        console.log("Anti-Presser useEffect: Checking count:", doNotPushClickCount, "Secret found status:", isSecretFound(secretId)); // <--- ADD THIS LINE
        if (doNotPushClickCount === 5 && !isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
        }
    }, [doNotPushClickCount, isSecretFound, incrementSecretsFound]);

    // Secret: The Secret Message
    useEffect(() => {
        const secretId = 'secret-mystery-message';
        if (mysteryButtonClickCount === 7 && !isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
        }
    }, [mysteryButtonClickCount, isSecretFound, incrementSecretsFound]);

    // Secret: The Surprise Revealer
    useEffect(() => {
        const secretId = 'secret-surprise-revealer';
        if (surpriseButtonRevealCount === 10 && !isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
        }
    }, [surpriseButtonRevealCount, isSecretFound, incrementSecretsFound]);


    // Effect to stop site shake after a brief period from PushMeClick
    useEffect(() => {
        let timer;
        if (setSiteShakeOn && clickCount > 0) {
            timer = setTimeout(() => {
                setSiteShakeOn(false);
            }, 100);
        }
        return () => clearTimeout(timer);
    }, [clickCount, setSiteShakeOn]);


    return {
        clickCount,
        jiggleOn,
        superJiggleOn,
        surpriseMessage,
        krillinAudioRef,
        handlePushMeClick,
        handleDoNotPushClick,
        handleKrillinClick,
        toggleJiggle,
        getJiggleButtonText,
        handleSurpriseButtonClick,
        handleMysteryButtonClick,
    };
};

export default useButtonGame;