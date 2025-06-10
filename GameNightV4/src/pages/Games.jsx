// src/pages/Games.jsx
import React, { useState, useEffect, useRef } from 'react';
import './styles/Games.css';
import { useColorblind } from '../contexts/ColorblindContext';
import { useSecrets } from '../contexts/SecretsContext';

// Import Material-UI Tabs components
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';

// Import ThemeProvider and createTheme for Material-UI theming
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Define the Konami Code sequence (using KeyboardEvent.key values)
// IMPORTANT: This KONAMI_CODE is for the DOOM secret. The new "The Unbound Current" Konami code will be in App.jsx
const KONAMI_CODE_DOOM = [
    'arrowup', 'arrowup',
    'arrowdown', 'arrowdown',
    'arrowleft', 'arrowright',
    'arrowleft', 'arrowright',
    'b', 'a', 'enter'
];

// Define a dark theme for Material-UI components to match your site's dark aesthetic
const gamesPageTheme = createTheme({
    palette: {
        mode: 'dark', // Set to dark mode for tabs
        primary: {
            main: '#90CAF9', // A light blue for primary elements in dark mode, or choose a color from your theme
        },
        secondary: {
            main: '#80CBC4', // A light teal for secondary elements
        },
        background: {
            default: '#2c2c2c', // Dark grey for the tab background
            paper: '#363636', // Slightly lighter dark grey for active tab and content areas
        },
        text: {
            primary: '#f0f0f0', // Light text for contrast
            secondary: '#a0a0a0', // Muted light text color
        },
    },
    components: {
        MuiTabs: {
            styleOverrides: {
                root: {
                    // Overall container for the tabs
                    backgroundColor: '#2c2c2c', // Dark grey background for the tab bar
                    borderRadius: '8px', // Rounded corners for the tab bar
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Darker shadow for dark mode
                    marginBottom: '20px', // Space below tabs
                    overflow: 'hidden', // Ensures shadow and border-radius apply correctly
                    // No borderBottom here, as the shadow defines the bottom edge
                },
                indicator: {
                    backgroundColor: 'var(--link-color)', // Use your theme's link color for the indicator
                    height: '3px',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: '#e0e0e0', // Light default tab text color
                    opacity: 1, // Full opacity for inactive tabs
                    fontWeight: 'normal', // Normal font weight for inactive tabs
                    textTransform: 'none', // Prevent uppercase by default for more flexibility
                    minWidth: 'unset',
                    padding: '12px 16px',
                    backgroundColor: '#3a3a3a', // Dark grey for inactive tab background
                    borderTopLeftRadius: '8px', // Match the parent container's radius
                    borderTopRightRadius: '8px',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    '&.Mui-selected': {
                        backgroundColor: '#4a4a4a', // Slightly lighter dark grey for active tab background
                        color: 'var(--link-color)', // Active tab text color from your theme
                        fontWeight: 'bold', // Bold for active tab
                    },
                    '&:hover': {
                        backgroundColor: '#5a5a5a', // Slightly lighter dark grey on hover for inactive tabs
                        color: '#ffffff', // White text on hover for inactive tabs
                        opacity: 1, // Keep full opacity on hover
                    },
                },
            },
        },
        MuiTabPanel: {
            styleOverrides: {
                root: {
                    padding: '0',
                    paddingTop: '20px',
                },
            },
        },
    },
});


export default function Games() {
    const { colorblindMode } = useColorblind();
    const { incrementSecretsFound, isSecretFound } = useSecrets();

    const [doomVisible, setDoomVisible] = useState(false);
    const [konamiSequenceDoom, setKonamiSequenceDoom] = useState([]);
    const [activeTab, setActiveTab] = useState('ttrpg'); // Default to TTRPG

    const doomMusic = useRef(new Audio('/server/sounds/doom-slayer.mp3'));

    const [currentAbridgedSound, setCurrentAbridgedSound] = useState(null);

    const dbzaOver9000 = useRef(new Audio('/server/sounds/abridged/dbza_over9000.mp3'));
    const dbzaVegetaScience = useRef(new Audio('/server/sounds/abridged/dbza_vegeta_science.mp3'));
    const dbzaVegetaPunch = useRef(new Audio('/server/sounds/abridged/dbza_vegeta_punch.mp3'));
    const dbzaPiccoloDaimao = useRef(new Audio('/server/sounds/abridged/dbza_piccolo_daimao.mp3'));
    const dbzaGokuStrong = useRef(new Audio('/server/sounds/abridged/dbza_goku_strong.mp3'));
    const dbzaKrillinOwned = useRef(new Audio('/server/sounds/abridged/dbza_krillin_owned.mp3'));


    const hellsingCannons = useRef(new Audio('/server/sounds/abridged/hellsing_cannons.mp3'));
    const hellsingPoliceGirl = useRef(new Audio('/server/sounds/abridged/hellsing_police_girl.mp3'));
    const hellsingAlucardBitch = useRef(new Audio('/server/sounds/abridged/hellsing_alucard_bitch.mp3'));
    const hellsingPipLongTime = useRef(new Audio('/server/sounds/abridged/hellsing_pip_long_time.mp3'));
    const hellsingWalterTea = useRef(new Audio('/server/sounds/abridged/hellsing_walter_tea.mp3'));


    const ff7maLimitBreak = useRef(new Audio('/server/sounds/abridged/ff7ma_limit_break.mp3'));
    const ff7maCloudExistential = useRef(new Audio('/server/sounds/abridged/ff7ma_cloud_existential.mp3'));
    const ff7maSephirothMommy = useRef(new Audio('/server/sounds/abridged/ff7ma_sephiroth_mommy.mp3'));
    const ff7maBarretLanguage = useRef(new Audio('/server/sounds/abridged/ff7ma_barret_language.mp3'));
    const ff7maAerithFlower = useRef(new Audio('/server/sounds/abridged/ff7ma_aerith_flower.mp3'));
    const ff7maTifaBar = useRef(new Audio('/server/sounds/abridged/ff7ma_tifa_bar.mp3'));


    useEffect(() => {
        const handleKeyDown = (event) => {
            const keyPressed = event.key.toLowerCase();

            if (KONAMI_CODE_DOOM.includes(keyPressed)) {
                if (keyPressed === KONAMI_CODE_DOOM[konamiSequenceDoom.length]) {
                    event.preventDefault();
                }
            }


            setKonamiSequenceDoom(prevSequence => {
                if (keyPressed === KONAMI_CODE_DOOM[prevSequence.length]) {
                    const newSequence = [...prevSequence, keyPressed];
                    if (newSequence.length === KONAMI_CODE_DOOM.length) {
                        setDoomVisible(true);
                        if (doomMusic.current) {
                            doomMusic.current.volume = 0.5;
                            doomMusic.current.loop = true;
                            doomMusic.current.play().catch(e => console.error("Failed to play audio:", e));
                        }
                    }
                    return newSequence;
                } else {
                    if (keyPressed === KONAMI_CODE_DOOM[0]) {
                        return [keyPressed];
                    } else {
                        return [];
                    }
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (doomMusic.current) {
                doomMusic.current.pause();
                doomMusic.current.currentTime = 0;
            }
            if (currentAbridgedSound) {
                currentAbridgedSound.pause();
                currentAbridgedSound.currentTime = 0;
            }
        };
    }, [currentAbridgedSound, konamiSequenceDoom]);


    useEffect(() => {
        if (!doomVisible && doomMusic.current && !doomMusic.current.paused) {
            doomMusic.current.pause();
            doomMusic.current.currentTime = 0;
        }
    }, [doomVisible]);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
        if (currentAbridgedSound) {
            currentAbridgedSound.pause();
            currentAbridgedSound.currentTime = 0;
            setCurrentAbridgedSound(null);
        }
    };

    const playAbridgedSound = (soundRef) => {
        if (currentAbridgedSound && currentAbridgedSound !== soundRef.current) {
            currentAbridgedSound.pause();
            currentAbridgedSound.currentTime = 0;
        }

        if (soundRef.current.paused) {
            soundRef.current.play().catch(e => console.error("Failed to play audio:", e));
            setCurrentAbridgedSound(soundRef.current);
        } else {
            soundRef.current.pause();
            soundRef.current.currentTime = 0;
            setCurrentAbridgedSound(null);
        }
    };

    // --- Secret #11: The Hidden Character ---
    // This function is no longer called in Games.jsx as per user's request to remove the element.
    // Kept here in case it's used elsewhere or for future re-implementation.
    const handleHiddenCharacterClick = () => {
        const secretId = 'secret-hidden-character';
        if (!isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
            console.log(`Secret Found! ID: ${secretId}`);
        }
    };

    // --- Secret #12: Clickable Object for "The Unbound Current" ---
    const handleUnboundCurrentClick = () => {
        const secretId = 'secret-unbound-current-click'; // A new unique ID for this specific clickable secret
        if (!isSecretFound(secretId)) {
            incrementSecretsFound(secretId);
            console.log(`Secret Found! ID: ${secretId}`);
            // You might want to add a visual cue here, e.g., a toast notification
        }
    };


    return (
        <ThemeProvider theme={gamesPageTheme}>
            <section className="games-page">
                <h1>Games</h1>
                <p className="hint-message">
                    {!doomVisible
                        ? "*There's a secret hidden here for those who know the code...*"
                        : "*Congratulations! You found the secret! Scroll down for your surprise 😜.*"
                    }
                </p>

                <Box sx={{
                    width: '100%',
                    typography: 'body1',
                    margin: '0 auto',
                }}>
                    <TabContext value={activeTab}>
                        <Box>
                            <Tabs
                                value={activeTab}
                                onChange={handleChange}
                                aria-label="Game categories tabs"
                                centered
                            >
                                <Tab label="Tabletop RPGs" value="ttrpg" />
                                <Tab label="Board Games" value="boardgames" />
                                <Tab label="Card Games" value="cardgames" />
                                <Tab label="Abridged Series" value="abridged" />
                            </Tabs>
                        </Box>

                        <TabPanel value="ttrpg">
                            <div className="ttrpg-section">
                                <h2>Tabletop Role-Playing Games</h2>
                                <div className="game-list">
                                    <div className="game-item">
                                        <h3>Fools Gold (D&D 5e Module/World)</h3>
                                        <p>Venture into the Bellowing Wilds of Fools Gold, a unique D&D 5th Edition
                                            campaign setting brought to life by a passionate YouTube group and funded
                                            on Kickstarter. This world diverges from typical D&D settings, offering
                                            its own distinct lore, intriguing locations, and potentially modified rules
                                            to enhance the gameplay experience. The system is designed to play through
                                            an action movie-style story in which the action sequences become increasingly
                                            more outlandish. Just try not to lose your pants, or your sanity, in the process.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Anima: Beyond Fantasy</h3>
                                        <p>Experience the intricate and anime-inspired world of Anima: Beyond
                                            Fantasy, a tabletop RPG with a system all its own, though often noted
                                            for its depth akin to Pathfinder. Immerse yourself in the richly
                                            detailed world of Gaïa, where magic and psychic powers are potent
                                            forces. Create highly customizable characters through a vast array of
                                            classes and skills, and engage in tactical combat where
                                            <span onClick={handleUnboundCurrentClick} style={{ cursor: 'pointer' }} title="There's more to discover here!">
                                                 Ki abilities &#x2728;</span> and strategic maneuvers are key. If you enjoy
                                            deep character customization and epic, story-driven campaigns with a touch of
                                            Japanese RPG flair, Anima offers a compelling experience. Warning: May cause
                                            excessive hair-flipping and dramatic poses.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Never Stop Blowing Up (Dimension 20)</h3>
                                        <p>From the mind of Brennan Lee Mulligan and featured on Dimension 20,
                                            <em>Never Stop Blowing Up</em> is a TTRPG inspired by <em>Kids on Bikes</em>,
                                            designed to emulate the over-the-top action of 80s and 90s action movies.
                                            This rules-light system focuses on collaborative storytelling, where players
                                            take on the roles of unlikely action heroes. A key mechanic involves
                                            'blowing up' your stats to increase their dice size, leading to increasingly
                                            ridiculous and powerful abilities. Expect a fast-paced, comedic, and explosive
                                            experience where players might even get to take over the GM seat for short
                                            bursts of time. Just remember, if it's not exploding, you're not doing it right!</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Rogue Trader (Warhammer 40,000)</h3>
                                        <p>Journey to the grim darkness of the far future with Rogue Trader, the
                                            original tabletop role-playing game that first defined the Warhammer
                                            40,000 universe. Take on the role of a charismatic Rogue Trader and their
                                            diverse retinue as they venture into the uncharted void beyond the Imperium.
                                            Explore new worlds, engage in interstellar trade and diplomacy (or conflict!),
                                            and manage your powerful voidship. Expect grand-scale adventures filled with
                                            exploration, danger, and the unique blend of science fiction and gothic
                                            horror that defines the 40k setting. Just don't accidentally declare war
                                            on a sentient rock because you misread the star charts.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Dungeons & Dragons 5th Edition</h3>
                                        <p>Dungeons & Dragons 5th Edition is a tabletop role-playing game where
                                            players create characters and embark on epic fantasy adventures. One player,
                                            the Dungeon Master, narrates the story and controls the world and its inhabitants,
                                            while the others embody heroes like fighters, wizards, and rogues. Through dice
                                            rolls and collaborative storytelling, players explore dungeons, battle monsters,
                                            solve puzzles, and interact with a rich fantasy setting, driven by imagination
                                            and a core set of rules. Warning: Side effects may include spontaneous goblin
                                            slaying and an unhealthy obsession with shiny dice.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Pathfinder 2nd Edition</h3>
                                        <p>Pathfinder 2nd Edition is a fantasy tabletop role-playing game known for
                                            its robust and detailed rules system, offering extensive character
                                            customization. Players create diverse heroes and embark on adventures in
                                            the world of Golarion, facing challenges, overcoming foes, and developing
                                            their characters through a vast array of feats, ancestries, and classes.
                                            It's a game that emphasizes tactical combat, strategic character building,
                                            and deep lore, appealing to players who enjoy a more intricate rule set
                                            than some other TTRPGs. Prepare for more numbers than a tax audit, but way
                                            more dragons.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Call of Cthulhu</h3>
                                        <p>Call of Cthulhu is a horror tabletop role-playing game based on the works
                                            of H.P. Lovecraft and the Cthulhu Mythos. Players take on the roles of
                                            ordinary people who uncover dark secrets and face cosmic horrors that
                                            threaten their sanity. Unlike many fantasy RPGs, the game emphasizes
                                            investigation, mystery, and survival, with characters often succumbing
                                            to madness or gruesome ends. The focus is on psychological horror and
                                            the fragility of the human mind in the face of incomprehensible evils.
                                            Don't worry, your character's sanity is entirely optional, and probably
                                            temporary.</p>
                                    </div>

                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel value="boardgames">
                            <div className="board-games-section">
                                <h2>Board Games</h2>
                                <div className="game-list">
                                    <div className="game-item">
                                        <h3>Hero Quest</h3>
                                        <p>HeroQuest is a fantasy adventure board game where players take on the
                                            roles of iconic heroes – the Barbarian, Dwarf, Elf, and Wizard – to
                                            face perilous quests. Guided by a Dungeon Master, the heroes explore
                                            a labyrinthine dungeon, battle monstrous foes, discover powerful
                                            treasures, and complete objectives. Featuring detailed miniatures,
                                            dice-based combat, and a modular board, HeroQuest offers a classic
                                            dungeon-crawling experience with a focus on tactical combat and
                                            heroic storytelling. Perfect for when you want to feel like a hero,
                                            but also maybe just want to roll some dice and pretend to kill goblins.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Pandemic</h3>
                                        <p>In Pandemic, players work together as a team of disease-fighting specialists
                                            to stop four deadly diseases from spreading across the globe. As outbreaks
                                            occur and infections rage, players must strategically use their unique
                                            character abilities, collect sets of city cards to discover cures, and
                                            coordinate travel to contain the diseases before they wipe out humanity.
                                            It's a cooperative board game known for its challenging gameplay, requiring
                                            intense planning and teamwork to overcome the escalating threats. You'll
                                            either save the world or realize how quickly it could all go wrong, no pressure!</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Sheriff of Nottingham</h3>
                                        <p>Sheriff of Nottingham is a game of bluffing, negotiation, and strategy
                                            where players take on the roles of merchants attempting to bring goods
                                            into the city. One player acts as the Sheriff, inspecting goods and trying
                                            to catch smugglers, while merchants try to get their legal goods through,
                                            or sneak in contraband, often by bribing the Sheriff. The game revolves
                                            around social deduction and trying to outwit your opponents to make the
                                            most profit. Just try not to look too guilty when you're caught with a
                                            bag full of illegal chicken.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Betrayal at House on the Hill</h3>
                                        <p>Betrayal at House on the Hill is a cooperative horror board game where
                                            players explore a haunted mansion, building the game board as they go.
                                            As they discover new rooms and trigger events, one player will eventually
                                            betray the others, and the game shifts into a "haunt" scenario. Each haunt
                                            is unique, leading to a new story with specific objectives for both the
                                            traitor and the remaining survivors, making every playthrough a suspenseful
                                            and unpredictable experience. Because who doesn't love exploring a creepy
                                            house where your best friend might suddenly turn into a bloodthirsty vampire?</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>The Red Dragon Inn</h3>
                                        <p>The Red Dragon Inn is a lighthearted card game where players are adventurers
                                            who have just returned from a perilous quest and are celebrating at the
                                            eponymous tavern. The goal is to be the last adventurer conscious and solvent.
                                            Players use cards to drink, gamble, and roughhouse with their companions,
                                            managing their Fortitude, Alcohol Content, and Gold to outlast everyone else
                                            in a lively night of revelry. Prepare to lose all your gold, your dignity,
                                            and possibly your liver.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Bullet*</h3>
                                        <p>Bullet* is a fast-paced, real-time puzzle-bullet-hell game where players
                                            embody heroines battling through waves of incoming bullet patterns. The goal
                                            is to clear your screen of 'bullets' (tokens) before they reach the bottom,
                                            while simultaneously attacking your opponent. Each heroine has unique abilities
                                            and powers, offering a wide array of playstyles and challenging puzzles.
                                            It's a high-energy, competitive experience that combines quick thinking with
                                            tactical decision-making. If you thought dodging traffic was hard, wait until
                                            you try dodging a screen full of glowing tokens.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>King of Tokyo</h3>
                                        <p>King of Tokyo is a dice-rolling game where players take on the role of
                                            gigantic monsters, rampaging through Tokyo and battling each other to
                                            become the one true King. Roll dice to gain energy, heal, attack other
                                            monsters, or score victory points. Decide whether to stay in Tokyo (and
                                            earn more points but take more damage) or flee. It's a fun, chaotic, and
                                            accessible game of monster mayhem, perfect for quick and entertaining
                                            showdowns. Finally, a game where you're encouraged to smash things and
                                            look good doing it.</p>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel value="cardgames">
                            <div className="card-games-section">
                                <h2>Card Games</h2>
                                <div className="game-list">
                                    <div className="game-item">
                                        <h3>Exploding Kittens</h3>
                                        <p>Exploding Kittens is a highly strategic, kitty-powered version of
                                            Russian Roulette. Players draw cards until someone draws an Exploding
                                            Kitten, at which point they are out of the game unless they have a
                                            Defuse card. The deck is filled with other cards that allow players
                                            to move, mitigate, or avoid Exploding Kittens. The game is known for
                                            its darkly humorous artwork and quick, unpredictable gameplay, making
                                            it suitable for casual play. Because nothing says "fun night" like
                                            trying to avoid a feline-induced explosion.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Epic Spell Wars of the Battle Wizards: Duel at Mt. Skullzfyre</h3>
                                        <p>Epic Spell Wars is a game of over-the-top, combative card-slaying where
                                            players take on the roles of battle wizards vying to be the last one
                                            standing. Players create ridiculous and powerful spells by combining
                                            "Source," "Quality," and "Delivery" cards, unleashing devastating attacks,
                                            bizarre effects, and grotesque magical mayhem. The game emphasizes humor,
                                            chaotic interactions, and a "last wizard standing" mentality, with plenty
                                            of bloody imagery and ridiculous outcomes. Forget dignity, just try to
                                            conjure a 'Sparklehoof Unicorn Missile' before your opponent casts
                                            'Fist of Glorious Flatulence'.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Joking Hazard</h3>
                                        <p>From the creators of Cyanide & Happiness, Joking Hazard is an offensive
                                            card game where players complete hilarious and often inappropriate comic
                                            strips. Following a simple rule, players draw a panel to create a
                                            three-panel comic, aiming for the funniest (or most shocking) outcome.
                                            The game thrives on dark humor, unexpected twists, and the collective
                                            twisted minds of the players, making for highly replayable and laugh-out-loud
                                            moments, often best suited for mature audiences. If your therapist tells
                                            you to express yourself, this is probably not what they meant.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Magic: The Gathering</h3>
                                        <p>Magic: The Gathering is the original collectible card game (CCG) where
                                            players assume the role of powerful Planeswalkers, casting spells and
                                            summoning creatures to defeat their opponents. Players construct unique
                                            decks from a vast array of available cards, each with its own abilities,
                                            lore, and strategic implications. Combat revolves around mana resources,
                                            creature attacks, and a wide variety of sorceries, instants, and
                                            enchantments, leading to deep strategic play and endless deck-building
                                            possibilities. Just try to explain to your non-gamer friends why your
                                            collection of cardboard rectangles is worth more than their car.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Uno</h3>
                                        <p>Uno is a classic card game where players aim to be the first to empty
                                            their hand of cards. Players take turns matching the top card of the
                                            discard pile by color or number. Special action cards like Skip, Reverse,
                                            and Draw Two add strategic twists, while the Wild card allows a player
                                            to change the active color. Don't forget to yell "UNO!" when you're down
                                            to one card! The ultimate test of friendships, especially when that
                                            Draw Four comes out.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Cards Against Humanity</h3>
                                        <p>Cards Against Humanity is an adult party game where players fill in the
                                            blank on black "question" cards with humorous, often offensive or
                                            politically incorrect, white "answer" cards. One player, the Card Czar,
                                            chooses the funniest answer, awarding a point to the player who submitted
                                            it. The game is known for its irreverent humor and encourages outrageous
                                            combinations of cards. Warning: May cause uncontrollable laughter, awkward
                                            silences, and possibly questioning your friends' life choices.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Fluxx</h3>
                                        <p>Fluxx is a card game where the rules are constantly changing! Players start
                                            with a simple rule (Draw 1, Play 1), but as cards are played, new rules are
                                            introduced, goals shift, and even the core mechanics can be altered.
                                            It's a game of delightful chaos, surprising twists, and adapting on the fly,
                                            ensuring no two games are ever quite the same. Perfect for players who enjoy
                                            unpredictability and lighthearted fun. If you hate rules, this is your game.
                                            If you love rules, this is your existential crisis.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>The Mind</h3>
                                        <p>The Mind is a cooperative card game where players must work together
                                            without speaking a single word. The objective is to play numbered cards
                                            from their hands into a central pile in ascending order. Players must
                                            rely solely on intuition, subtle cues, and shared understanding to determine
                                            when to play their cards. It's an intensely focused, surprisingly engaging,
                                            and often astonishing experience that truly tests the non-verbal synergy
                                            of a group. Turns out, telepathy is harder than it looks when you're just
                                            trying to play a 7.</p>
                                    </div>

                                    <div className="game-item">
                                        <h3>Love Letter</h3>
                                        <p>Love Letter is a quick, deductive card game of risk, deduction, and luck.
                                            Players aim to deliver their love letter to the Princess while preventing
                                            other players' letters from reaching her. With only 16 cards in the deck,
                                            each with a unique character and ability, players use their limited hand
                                            to eliminate opponents, protect their own card, and deduce what cards others
                                            hold. It's simple to learn, highly strategic, and perfect for quick,
                                            engaging rounds. Just try not to get caught giving your love letter to
                                            the Guard... again.</p>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel value="abridged">
                            <div className="abridged-series-section">
                                <h2>Team Four Star Abridged Series</h2>
                                <div className="game-list">
                                    <div className="game-item">
                                        <h3>Dragon Ball Z Abridged (DBZA)</h3>
                                        <p>Team Four Star's most iconic and beloved series, DBZA is a comedic,
                                            satirical parody of the Dragon Ball Z anime. Known for its sharp writing,
                                            memorable quotes, and hilarious re-interpretations of characters like Vegeta
                                            , Goku, and Piccolo, DBZA is widely regarded as the gold standard for
                                            abridged series. It deconstructs and lovingly pokes fun at the original
                                            anime's tropes while delivering surprisingly heartfelt character development
                                            and action. Prepare for a power level that's over 9000... jokes per minute!</p>
                                        <div className="abridged-buttons">
                                            <button onClick={() => playAbridgedSound(dbzaOver9000)}>It's Over 9000!</button>
                                            <button onClick={() => playAbridgedSound(dbzaVegetaScience)}>My B*tch and My Science</button>
                                            <button onClick={() => playAbridgedSound(dbzaVegetaPunch)}>Punching for Dummies</button>
                                            <button onClick={() => playAbridgedSound(dbzaPiccoloDaimao)}>Piccolo Daimao</button>
                                            <button onClick={() => playAbridgedSound(dbzaGokuStrong)}>I'm The Strongest There Is!</button>
                                            <button onClick={() => playAbridgedSound(dbzaKrillinOwned)}>Krillin Owned Count</button>
                                        </div>
                                    </div>
                                    <div className="game-item">
                                        <h3>Hellsing Ultimate Abridged</h3>
                                        <p>A fast-paced and intensely humorous parody of the Hellsing Ultimate OVA
                                            series. This abridged version maintains the dark and violent aesthetic of
                                            the original while infusing it with Team Four Star's signature wit, turning
                                            dramatic moments into comedic gold. Expect over-the-top action, incredibly
                                            quotable lines, and a healthy dose of irreverence. Warning: May cause
                                            spontaneous urges to yell "BITCHES LOVE CANNONS!" at inappropriate times.</p>
                                        <div className="abridged-buttons">
                                            <button onClick={() => playAbridgedSound(hellsingCannons)}>Bitches Love Cannons</button>
                                            <button onClick={() => playAbridgedSound(hellsingPoliceGirl)}>Police Girl</button>
                                            <button onClick={() => playAbridgedSound(hellsingAlucardBitch)}>I'm A Vampire, B*tch</button>
                                            <button onClick={() => playAbridgedSound(hellsingPipLongTime)}>Long Time No See</button>
                                            <button onClick={() => playAbridgedSound(hellsingWalterTea)}>Tea Time</button>
                                        </div>
                                    </div>
                                    <div className="game-item">
                                        <h3>Final Fantasy 7: Machinabridged (FF7MA)</h3>
                                        <p>TFS's take on the classic RPG, Final Fantasy 7, using in-game footage and
                                            custom animations. FF7MA brings the world of Midgar to life with a comedic
                                            twist, focusing on the absurdity of the original game's plot and characters.
                                            It's a must-watch for fans of the game looking for a fresh, humorous
                                            perspective. Come for the epic story, stay for Cloud's existential dread
                                            and Tifa's surprisingly effective bar brawls.</p>
                                        <div className="abridged-buttons">
                                            <button onClick={() => playAbridgedSound(ff7maLimitBreak)}>Limit Break!</button>
                                            <button onClick={() => playAbridgedSound(ff7maCloudExistential)}>Existential Dread</button>
                                            <button onClick={() => playAbridgedSound(ff7maSephirothMommy)}>Mommy?</button>
                                            <button onClick={() => playAbridgedSound(ff7maBarretLanguage)}>Language!</button>
                                            <button onClick={() => playAbridgedSound(ff7maAerithFlower)}>Flower Girl</button>
                                            <button onClick={() => playAbridgedSound(ff7maTifaBar)}>Tifa's Bar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabContext>
                </Box>

                {doomVisible && (
                    <>
                        <hr style={{ margin: '3rem 0', borderColor: '#444' }} />
                        <div className="doom-embed-container">
                            <h2>Play The Ultimate Doom</h2>
                            <p>Blast your way through classic demon-infested levels right in your browser!</p>
                            <iframe
                                src="https://thedoggybrad.github.io/doom_on_js-dos/"
                                style={{ border: 'none' }}
                                title="Doom in Browser"
                                allowFullScreen
                            />
                        </div>
                    </>
                )}

            </section>
        </ThemeProvider>
    );
}