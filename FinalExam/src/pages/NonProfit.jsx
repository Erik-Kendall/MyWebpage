import React, { useEffect } from 'react';
import nonprofitImg from '../components/nonprofit.jpg';
import rallyImg from '../components/environmental_rally.jpg';

function NonProfit() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Non Profit';
    }, []);
    // noinspection JSRemoveUnnecessaryParentheses
    return (
        <main>
            <h1>Non Profit</h1>
            <div className="card green-section">
                <section>
                    <h2>What We Do</h2>
                    <p>Green Earth Seattle works tirelessly to protect natural spaces, advocate for policy changes, and educate our community.</p>
                    <img src={nonprofitImg} alt="Nonprofit in Action" className="header-image" alt="Volunteers working on a community garden" />
                </section>

                <section>
                    <h2>Events and Outreach</h2>
                    <p>We organize rallies, clean-up days, and speak at schools to inspire young environmental leaders.</p>
                    <img src={rallyImg} alt="Environmental Rally" className="rally-image" alt="Environmental rally with people holding signs"/>
                </section>

                <section>
                    <h2>Our Mission in Motion</h2>
                    <p>
                        From the shores of Puget Sound to the trails of our urban forests, Green Earth Seattle brings people together
                        to create lasting change. Whether it's planting native species, hosting town halls, or partnering with local
                        schools, we believe small actions—when multiplied—lead to big impact.
                    </p>
                </section>

                <section>
                    <h2>Join the Movement</h2>
                    <p>
                        Every voice matters, and every hand helps. Whether you’re ready to volunteer, donate, or simply learn more,
                        Green Earth Seattle welcomes you. Let’s build a greener, cleaner future—together.
                    </p>
                    <a href="/contact" className="cta-button">Get Involved</a>
                </section>
            </div>
        </main>
    );
}

export default NonProfit;
