import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import nonprofitImg from '../components/nonprofit.jpg';
import rallyImg from '../components/environmental_rally.jpg';

function NonProfit() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Non Profit';
    }, []);

    return (
        <main>
            <div className="page-title card">
                <h1>Non-Profit</h1>
            </div>
            <div className="card green-section">
                <section>
                    <h2>What We Do</h2>
                    <p>Green Earth Seattle works tirelessly to protect natural spaces, advocate for policy changes, and educate our community. Our team engages in hands-on conservation projects that preserve the ecosystems we all depend on. From lobbying for stronger environmental protections to organizing workshops on sustainable living, our work touches every corner of the Seattle area. We empower residents with the tools and knowledge they need to make environmentally responsible choices in their everyday lives. By combining grassroots action with strategic advocacy, we aim to create a city that thrives in harmony with the natural world.</p>
                    <img src={nonprofitImg} alt="Volunteers working on a community garden" className="header-image" />
                </section>
                <section>
                    <h2>Events and Outreach</h2>
                    <p>We organize rallies, clean-up days, and speak at schools to inspire young environmental leaders. These events are more than just gatherings—they're opportunities to spark lasting change and connect people who care about the planet. Our team partners with local organizations to amplify voices, mobilize volunteers, and create a sense of shared purpose. Whether we’re handing out reusable bags at a farmers market or coordinating a shoreline cleanup, every event is a chance to lead by example. Outreach is how we grow the movement—one conversation, one action, one event at a time.</p>
                    <img src={rallyImg} alt="Environmental rally with people holding signs" className="rally-image" />
                </section>
                <section>
                    <h2>Our Mission in Motion</h2>
                    <p>From the shores of Puget Sound to the trails of our urban forests, Green Earth Seattle brings people together to create lasting change. Our mission comes alive when volunteers plant native species that restore biodiversity and combat erosion. We host town halls that bridge the gap between citizens and policymakers, ensuring the environment stays at the top of the agenda. Educational programs in local schools encourage the next generation to become stewards of the Earth. Through these efforts and more, we turn environmental concern into environmental action.</p>
                </section>
                <section>
                    <h2>Join the Movement</h2>
                    <p>Every voice matters, and every hand helps. Whether you’re ready to volunteer, donate, or simply learn more, Green Earth Seattle welcomes you with open arms. Getting involved is easy, and the impact is real—your time or support directly fuels programs that protect our shared future. We believe that sustainable change is only possible when communities unite around a common cause. Let’s build a greener, cleaner future—together, one step at a time.</p>
                    <Link to="/contact" className="cta-button">Contact Us</Link>
                </section>
            </div>
        </main>
    );
}

export default NonProfit;
