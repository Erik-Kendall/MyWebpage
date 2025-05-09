import React, { useEffect } from 'react';
import '../Style/main.css';

function Home() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Home';
    }, []); // Empty dependency array ensures this runs only once after the initial render

    return (

        <main>
            <h1>Home</h1>
            <div className="card green-section">
                <section>
                    <p><i>My friend's name is Bruce. He lives in Seattle and works for an environmental non-profit, which is dedicated to preserving our planet’s resources.</i></p>
                </section>
                <section>
                    <h2>Our Mission</h2>
                    <p>We are committed to educating communities about global warming and sustainable practices. Our focus includes:</p>
                        <ul>
                            <li>Community Education</li>
                            <li>Organizing Rallies</li>
                            <li>Sharing Environmental News</li>
                            <li>Promoting Sustainable Initiatives</li>
                        </ul>
                </section>
                <section>
                    <h2>Our Story</h2>
                    <p>
                        In 2001, I organized a rally to protest the rising surface temperatures affecting our land. That day sparked my lifelong passion for environmental activism, and I’ve been working ever since to help people understand the impact of our actions on the planet.
                    </p>
                </section>
                <section>
                    <h2>Get Involved</h2>
                    <p>
                        Discover Oregon’s natural beauty, learn about the latest environmental news and events, and find out how you can support our cause. Contact us to join the movement!
                    </p>
                </section>
            </div>
        </main>
    );
}

    export default Home;


