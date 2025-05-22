// src/pages/QuickLinks.jsx
import React from 'react';
import { useColorblind } from '../contexts/ColorblindContext';

const QuickLinks = () => {
    const { colorblindMode } = useColorblind();
    const links = [
        { name: 'Jackbox.tv', url: 'https://jackbox.tv' },
        {
            name: 'How to find your Jackbox Galleries',
            url: 'https://support.jackboxgames.com/hc/en-us/articles/15794749416471-How-do-I-view-my-gallery-from-a-past-game-session-for-shirts-or-social-media-sharing'
        },
        { name: 'Discord', url: 'https://discord.com' },
        // Add more links here as needed
    ];

    return (
        <section className="content quick-links-silly-style">
            <h1>Quick Links</h1>
            <ul>
                {links.map(({ name, url }) => (
                    <li key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default QuickLinks;