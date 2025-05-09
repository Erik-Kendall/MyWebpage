import React, { useEffect } from 'react';
import '../style/main.css';

function AboutMe() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - About Me';
    }, []);

    return (
        <main className="about-me-page">
            <h1>About Me</h1>
            <div className="aboutme-biography card green-section">
                <section>
                <h2>Protecting our planet, one action at a time!</h2>
                </section>
                <section>
                        <h3>Bio:</h3>
                        <p>🌿 I have dedicated my life to protecting and restoring the planet. Born and raised in Seattle, I developed a deep appreciation for nature while hiking the Pacific Northwest’s lush forests. After earning a degree in Environmental Science, I worked on sustainability initiatives, urban reforestation projects, and clean energy advocacy. I now lead community-driven programs that focus on conservation, waste reduction, and educating others about sustainable living.</p>
                </section>
                <section>
                        <h3>Skills and Interests:</h3>

                        <h4>🛠️ Skills:</h4>
                        <ul>
                            <li>Expert in urban reforestation and ecosystem restoration</li>
                            <li>Skilled in composting and zero-waste living</li>
                            <li>Public speaker on sustainability and climate action</li>
                            <li>Proficient in renewable energy solutions and policy advocacy</li>
                        </ul>

                        <h4>🎯 Interests:</h4>
                        <ul>
                            <li>Hiking and exploring national parks</li>
                            <li>Building eco-friendly tiny homes</li>
                            <li>Volunteering at wildlife rehabilitation centers</li>
                            <li>Experimenting with plant-based recipes</li>
                        </ul>
                </section>
                <section>
                        <h3>Fun Facts:</h3>
                        <ul>
                            <li>😂 Once built a fully functional treehouse powered by solar panels.</li>
                            <li>🌎 Has planted over 10,000 trees through various restoration projects.</li>
                            <li>🚴 Sold his car years ago and commutes exclusively by bike.</li>
                            <li>🐝 Talks to bees while tending to his backyard pollinator garden (and swears they understand him).</li>
                        </ul>
                </section>
            </div>
        </main>
    );
}

export default AboutMe;
