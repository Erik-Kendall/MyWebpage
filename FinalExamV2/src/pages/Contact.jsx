import React, { useState, useEffect } from 'react';
import '../style/main.css';

function Contact() {
    useEffect(() => {
        document.title = 'Green Earth Seattle - Contact';
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [submissionStatus, setSubmissionStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submissionStatus === 'submitting') return;
        setSubmissionStatus('submitting');
        setTimeout(() => {
            setSubmissionStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <main className="contact-page">
            <div className="page-title card">
                <h1>Contact</h1>
            </div>
            <div className="contact-card">
                <h2>Get In Touch</h2>
                <p>We'd love to hear from you! Send us a message using the form below.</p>
                {submissionStatus === 'success' && (
                    <div className="success-message" aria-live="polite">
                        Thank you for your message! We'll get back to you as soon as possible.
                    </div>
                )}
                {submissionStatus === 'error' && (
                    <div className="error-message" aria-live="polite">
                        Oops! Something went wrong. Please try again later.
                    </div>
                )}
                {submissionStatus !== 'success' && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                pattern="^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Subject:</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message:</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" disabled={submissionStatus === 'submitting'}>
                            {submissionStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
                <p>Follow us on social media</p>
            </div>
        </main>
    );
}

export default Contact;
