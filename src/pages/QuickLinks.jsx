import React from 'react';
import { useColorblind } from '../contexts/ColorblindContext';
import './styles/QuickLinks.css'; // Import the QuickLinks.css

const QuickLinks = () => {
    const { colorblindMode } = useColorblind();

    const generalLinks = [
        { name: 'Jackbox.tv', url: 'https://jackbox.tv' },
        {
            name: 'How to find your Jackbox Galleries',
            url: 'https://support.jackboxgames.com/hc/en-us/articles/15794749416471-How-do-I-view-my-gallery-from-a-past-game-session-for-shirts-or-social-media-sharing'
        },
        { name: 'Discord', url: 'https://discord.com' },
        { name: 'BoardGameGeek', url: 'https://boardgamegeek.com/' },
        { name: 'Dicebreaker', url: 'https://www.dicebreaker.com/' },
        { name: 'Warhammer Community', url: 'https://www.warhammer-community.com/' },
        { name: 'Lexicanum (Rogue Trader - Warhammer 40k Wiki)', url: 'https://wh40k.lexicanum.com/wiki/Rogue_Trader' },
        { name: 'Dimension 20', url: 'https://www.dropout.tv/dimension-20' },
    ];

    const animaLinks = [
        { name: 'Anima Project Official Website', url: 'https://www.animaproject.com/' },
        // IMPORTANT: This Discord link is for a specific message and might not work for all users.
        // Consider replacing with a general Discord server invite link if available.
        { name: 'Anima Discord Channel (Specific Message)', url: 'https://discord.com/channels/1138970730034376808/1368061489092497490/1370977369443143780' }
    ];

    return (
        <section className="content quick-links-silly-style">
            <h1>Quick Links</h1>
            <ul>
                {generalLinks.map(({ name, url }) => (
                    <li key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                    </li>
                ))}
            </ul>

            {/* New box for Anima Links - applying a class for potential styling */}
            <h2 className="section-heading" style={{ marginTop: '2em' }}>Anima: Beyond Fantasy Resources</h2>
            <ul>
                {animaLinks.map(({ name, url }) => (
                    <li key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default QuickLinks;