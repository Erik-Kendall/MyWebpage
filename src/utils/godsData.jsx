// src/utils/godsData.jsx
// MODIFIED: No longer imports React or AltarOfKhorne here, as we're storing data, not JSX directly.

export const ALL_GOD_DATA = {
    "Blood God": {
        title: "Altar to the Blood God",
        chant: "SKULLS FOR THE SKULL THRONE! BLOOD FOR THE BLOOD GOD!",
        description1: "Make your offerings, spill your libations, and witness the raw power of unbridled rage!",
        description2: "This altar yearns for fury and sacrifice. What will you offer?",
        // NEW HINT: Alluding to the underlying chaotic flow.
        description3: "Yet, even fury must flow through the greater currents of existence.",
        backgroundColor: 'rgba(51, 0, 0, 0.9)',
        color: '#ffdddd',
        // If you have an audio, add path here. Added an example path.
        soundPath: "/audio/gods/khorn_chant.mp3", // <<< ASSUMPTION: Update path if different. If no audio, set to null.
        // NEW for Secret #8: The Ancient Tome
        secretWords: [
            { word: "SKULLS", className: "secret-blood-god-word" },
            { word: "BLOOD", className: "secret-blood-god-word" }
        ],
        // Additional styles from original JSX can be moved here if needed
        border: '3px solid #6b0000',
        boxShadow: '0 0 25px rgba(255, 0, 0, 0.4)',
    },
    "Weaver of Whispers": {
        title: "Altar to the Weaver of Whispers",
        chant: "Listen closely, for magic is not always loud.",
        description1: "This altar resonates with the subtle currents of instinctive magic and the secrets carried on the breeze. Offer your intuition and open your mind.",
        description2: "The Weaver guides those who perceive beyond the obvious.",
        // NEW HINT: Alluding to the fundamental nature of all secrets.
        description3: "Beyond these whispers, lies the silence that binds all truths.",
        backgroundColor: 'rgba(240, 248, 255, 0.9)',
        color: '#483d8b',
        imagePath: '/images/gods/weaver_whispers_figure.png',
        soundPath: "/audio/gods/whispers_ambient.mp3"
    },
    "Sentinel of Steel": {
        title: "Altar to the Sentinel of Steel",
        chant: "By hammer and anvil, strength is forged!",
        description1: "This altar honors the mastery of weaponry, the steadfastness of defense, and the enduring spirit of craftsmanship. Offer your dedication and skill.",
        description2: "The Sentinel protects those who stand firm and true.",
        // NEW HINT: Alluding to stability within a changing reality.
        description3: "Even the strongest steel rests upon a flowing foundation.",
        backgroundColor: 'rgba(68, 68, 68, 0.9)',
        color: '#dddddd',
        imagePath: '/images/gods/sentinel_armor.png',
        soundPath: "/audio/gods/anvil_strike.mp3",
        border: '2px solid #888'
    },
    "Swift-Footed Strategist": {
        title: "Altar to the Swift-Footed Strategist",
        chant: "Every step a purpose, every move a plan!",
        description1: "This altar celebrates swiftness, impeccable coordination, and brilliant tactical thinking. Offer your agility and foresight.",
        description2: "The Strategist favors those who outmaneuver their foes.",
        // NEW HINT: Alluding to the influence over fate/causality.
        description3: "But the grandest strategy flows from a single, unseen source.",
        backgroundColor: 'rgba(245, 245, 220, 0.9)',
        color: '#a0522d',
        imagePath: '/images/gods/strategist_leap.png',
        soundPath: "/audio/gods/swift_steps.mp3"
    },
    "Loremaster of Lumina": {
        title: "Altar to the Loremaster of Lumina",
        chant: "Knowledge is the brightest light!",
        description1: "This altar is dedicated to studied magic, ancient lore, and the pursuit of enlightenment. Offer your curiosity and thirst for understanding.",
        description2: "The Loremaster illuminates the path for seekers of truth.",
        // NEW HINT: Alluding to knowledge of the ultimate reality.
        description3: "All lore points to the singular truth, unbound by time.",
        backgroundColor: 'rgba(230, 230, 250, 0.9)',
        color: '#4682b4',
        imagePath: '/images/gods/loremaster_book.png',
        soundPath: "/audio/gods/parchment_rustle.mp3",
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    "Harmonious Voice": {
        title: "Altar to the Harmonious Voice",
        chant: "Words can build bridges or shatter walls!",
        description1: "This altar embodies charisma, social influence, and the power of unity. Offer your empathy and persuasive spirit.",
        description2: "The Voice inspires cooperation and understanding among all.",
        // NEW HINT: Alluding to a truth beyond all spoken words.
        description3: "Beyond all words, a deeper resonance dictates reality's song.",
        backgroundColor: 'rgba(255, 228, 225, 0.9)',
        color: '#ff69b4',
        imagePath: '/images/gods/harmony_waves.png',
        soundPath: "/audio/gods/vocal_harmony.mp3"
    },
    "Shadowed Veil": {
        title: "Altar to the Shadowed Veil",
        chant: "Secrets whisper in the dark.",
        description1: "This altar is for those who move unseen, who guard secrets, and who understand the power of the hidden. Offer your discretion and silent resolve.",
        description2: "The Veil conceals and reveals, as it wills.",
        // NEW HINT: Alluding to the ultimate hidden force.
        description3: "Yet, even the deepest shadows cannot hide the primal current.",
        backgroundColor: 'rgba(25, 25, 112, 0.9)',
        color: '#dda0dd',
        imagePath: '/images/gods/shadow_eye.png',
        soundPath: "/audio/gods/shadow_hum.mp3"
    },
    "Verdant Heart": {
        title: "Altar to the Verdant Heart",
        chant: "Life's cycle, eternally renewed!",
        description1: "This altar pulses with nature magic, the rhythm of growth, and the wisdom of the wild. Offer your connection to the living world.",
        description2: "The Heart sustains all that flourishes.",
        // NEW HINT: Alluding to the source of all cycles and renewal.
        description3: "Life itself flows from a deeper, unceasing wellspring.",
        backgroundColor: 'rgba(143, 188, 143, 0.9)',
        color: '#228b22',
        imagePath: '/images/gods/verdant_tree.png',
        soundPath: "/audio/gods/forest_ambience.mp3"
    },
    "Radiant Bloom": {
        title: "Altar to the Radiant Bloom",
        chant: "From a single seed, life blossoms!",
        description1: "This altar radiates with life magic, vibrant vitality, and the power of healing. Offer your hope and restorative touch.",
        description2: "The Bloom brings forth health and beauty.",
        // NEW HINT: Alluding to the fundamental energy that allows existence.
        description3: "This vibrant existence draws breath from an unbound pulse.",
        backgroundColor: 'rgba(255, 240, 245, 0.9)',
        color: '#ff1493',
        imagePath: '/images/gods/radiant_flower.png',
        soundPath: "/audio/gods/bloom_sound.mp3"
    },
    "Adamant Bulwark": {
        title: "Altar to the Adamant Bulwark",
        chant: "Against all odds, we stand!",
        description1: "This altar represents unwavering protection, steadfast defense, and unbreakable resolve. Offer your courage and loyalty.",
        description2: "The Bulwark shields the innocent and the just.",
        // NEW HINT: Alluding to the ultimate, unmoving constant beyond all defenses.
        description3: "Yet, all stands upon a foundation that shifts, unseen.",
        backgroundColor: 'rgba(211, 211, 211, 0.9)',
        color: '#696969',
        imagePath: '/images/gods/bulwark_shield.png',
        soundPath: "/audio/gods/heavy_impact.mp3",
        border: '3px solid #a9a9a9'
    },
    "Forgewright of Purpose": {
        title: "Altar to the Forgewright of Purpose",
        chant: "Every cog, every spring, serves a grand design!",
        description1: "This altar hums with mechanical ingenuity, the spirit of creation, and the shaping of destiny. Offer your innovation and precise craft.",
        description2: "The Forgewright guides hands that build and minds that invent.",
        // NEW HINT: Alluding to the ultimate architect of reality.
        description3: "Behind every design, an infinite mechanism endlessly turns.",
        backgroundColor: 'rgba(240, 255, 240, 0.9)',
        color: '#2f4f4f',
        imagePath: '/images/gods/gears_turning.png',
        soundPath: "/audio/gods/clockwork_ambience.mp3"
    },
    "Draconic Gale": {
        title: "Altar to the Draconic Gale",
        chant: "Feel the wind beneath mighty wings!",
        description1: "This altar resonates with elemental power, the freedom of the skies, and untamed might. Offer your untamed spirit and soaring ambitions.",
        description2: "The Gale carries those who dare to fly.",
        // NEW HINT: Alluding to the true source of all elemental forces.
        description3: "But all winds are born from the unbound, silent expanse.",
        backgroundColor: 'rgba(175, 238, 238, 0.9)',
        color: '#00ced1',
        imagePath: '/images/gods/draconic_storm.png',
        soundPath: "/audio/gods/strong_wind.mp3"
    },
    "The Unbound Current": { // Added The Unbound Current
        id: 'the-unbound-current',
        title: "Altar to The Unbound Current",
        chant: "Reality bends, causality shifts, the infinite flows!", // New chant for the Unbound Current
        description1: "This hidden altar is the source of all magical phenomena, governing causality, probability, and temporal flow. Offer your perception beyond the veil.",
        description2: "The Unbound Current reveals ultimate truths, ancient histories, and paths yet unseen.",
        backgroundColor: 'rgba(10, 0, 10, 0.9)', // Darker, deep purple/black background
        color: '#00FFFF', // Cyan text color
        imagePath: '/images/gods/unbound_current.png', // Placeholder for a unique image
        soundPath: "/audio/gods/unbound_current_ambient.mp3", // Placeholder for unique ambient sound
        border: '3px double #00FFFF', // Cyan double border
        boxShadow: '0 0 35px rgba(0, 255, 255, 0.6)', // Glowing cyan shadow
        isSecretGod: true, // Crucial flag for conditional rendering
    },
};

export const GOD_NAMES = Object.keys(ALL_GOD_DATA);

// NEW: Export a list of all sound paths for "The Divine Harmony" secret
export const ALL_GOD_SOUND_PATHS = Object.values(ALL_GOD_DATA)
    .map(god => god.soundPath)
    .filter(path => path); // Filter out any null paths