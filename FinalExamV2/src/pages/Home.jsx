import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Style/main.css';

function Home() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Home';
    }, []);

    return (
        <main>
            <div className="page-title card">
                <h1>Home</h1>
            </div>

            <div className="card green-section">
                <section>
                    <p>
                        <i>
                            My friend’s name is Bruce. He lives in Seattle and works for an environmental
                            non-profit, a group deeply committed to preserving the planet’s natural resources.
                            Bruce spends his days coordinating local clean-up projects, mentoring youth in
                            environmental programs, and collaborating with city officials to promote green policies.
                            His work has taken him from rain-soaked community gardens to packed city council
                            meetings—all in the name of protecting the ecosystems we rely on. Bruce’s dedication
                            is a reminder that real change starts with everyday people who care enough to take
                            action.
                        </i>
                    </p>
                </section>

                <section>
                    <h2>Our Mission</h2>
                    <p>
                        We are committed to educating communities about global warming and sustainable practices
                        that protect our environment for generations to come. Our work revolves around empowering
                        people with knowledge and resources so they can live more consciously and advocate for
                        change. We host workshops and webinars on topics ranging from composting and renewable
                        energy to climate justice. We also collaborate with schools, businesses, and civic groups
                        to implement practical solutions that reduce carbon footprints. Whether it's through
                        grassroots events or digital outreach, our mission is to spark a widespread shift toward
                        sustainability.
                    </p>
                    <ul>
                        <li>Community Education: Providing learning opportunities that foster environmental literacy.</li>
                        <li>Organizing Rallies: Uniting people to demand action on pressing environmental issues.</li>
                        <li>Sharing Environmental News: Keeping the public informed with trustworthy, up-to-date information.</li>
                        <li>Promoting Sustainable Initiatives: Supporting programs that encourage green living and conservation.</li>
                    </ul>
                </section>

                <section>
                    <h2>Our Story</h2>
                    <p>
                        In 2001, I organized a rally to protest the rising surface temperatures affecting our
                        land. It started as a small gathering of concerned citizens but grew into a powerful show
                        of solidarity and purpose. That experience ignited a passion in me—a drive to protect what
                        we too often take for granted. Since then, I’ve committed my life to environmental advocacy,
                        working with others to spread awareness and demand accountability. Over the years, our
                        movement has grown, driven by a shared belief: that we all have a role to play in shaping a
                        healthier, more sustainable world.
                    </p>
                </section>

                <section>
                    <h2>Get Involved</h2>
                    <p>
                        Discover Oregon’s natural beauty, learn about the latest environmental news and events,
                        and find out how you can support our cause. Whether you want to volunteer, donate, or
                        participate in local clean-up days, your involvement makes a difference. We offer a
                        variety of programs and opportunities for individuals, families, and organizations to get
                        connected and contribute. Our work thrives on community support, and every person who
                        joins strengthens our ability to create positive change.
                    </p>
                    <Link to="/contact" className="cta-button">Contact Us</Link>
                </section>
            </div>
        </main>
    );
}

export default Home;
