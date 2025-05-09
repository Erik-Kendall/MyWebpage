import React, { useEffect } from 'react';
import '../style/main.css';

function Blog() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Blog';
    }, []);

    return (
        <main className="blog-page">
            <h1>Blog</h1>
            <div className="blog-categories card">
                <h1>Categories:</h1>
            </div>
            <div className="blog-box-container">
                <div className="blog-category-section">
                    <h1>Sustainability and Green Living:</h1>
                    <div className="horizontal-cards-container">
                        <article className="horizontal-card card">
                            <h2>5 Easy Ways to Reduce Your Carbon Footprint</h2>
                            <time dateTime="2025-03-11">March 11, 2025</time>
                            <p>Living sustainably doesn't have to be difficult. Simple changes like using reusable bags, conserving water, and choosing energy-efficient appliances can make a big impact.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>How to Start Composting at Home</h2>
                            <time dateTime="2025-03-10">March 10, 2025</time>
                            <p>Composting is an excellent way to reduce waste and enrich your soil naturally. Learn the basics of setting up a composting system that fits your space and lifestyle.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>The Benefits of Solar Energy for Your Home</h2>
                            <time dateTime="2025-03-09">March 9, 2025</time>
                            <p>Solar power is a renewable energy source that helps reduce electricity bills while benefiting the environment. Discover how you can make the switch to solar.</p>
                        </article>
                    </div>
                </div>

                <div className="blog-category-section">
                    <h1>Community Projects and Volunteering:</h1>
                    <div className="horizontal-cards-container">
                        <article className="horizontal-card card">
                            <h2>How to Get Involved in Local Volunteer Work</h2>
                            <time dateTime="2025-03-11">March 11, 2025</time>
                            <p>Giving back to your community is easier than you think. Whether it's helping at food banks, tutoring students, or cleaning up parks, there are many ways to contribute.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>Success Stories: Community Projects That Made a Difference</h2>
                            <time dateTime="2025-03-10">March 10, 2025</time>
                            <p>From building homes to launching mentorship programs, these inspiring projects show how communities can come together to create positive change.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>Top Skills You Can Gain from Volunteering</h2>
                            <time dateTime="2025-03-09">March 9, 2025</time>
                            <p>Volunteering not only helps others but also allows you to develop leadership, teamwork, and communication skills that are valuable in any career.</p>
                        </article>
                    </div>
                </div>

                <div className="blog-category-section">
                    <h1>Wildlife and Conservation:</h1>
                    <div className="horizontal-cards-container">
                        <article className="horizontal-card card">
                            <h2>The Importance of Protecting Endangered Species</h2>
                            <time dateTime="2025-03-11">March 11, 2025</time>
                            <p>With habitat loss and climate change threatening wildlife, conservation efforts are more crucial than ever. Learn how you can help protect endangered species.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>How National Parks Preserve Biodiversity</h2>
                            <time dateTime="2025-03-10">March 10, 2025</time>
                            <p>National parks serve as vital refuges for wildlife. Discover the role these protected areas play in maintaining healthy ecosystems.</p>
                        </article>

                        <article className="horizontal-card card">
                            <h2>Simple Ways to Support Wildlife Conservation</h2>
                            <time dateTime="2025-03-09">March 9, 2025</time>
                            <p>From reducing plastic waste to supporting ethical tourism, there are many ways to contribute to the protection of wildlife in your daily life.</p>
                        </article>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Blog;