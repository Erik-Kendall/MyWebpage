import React, { useState, useEffect } from 'react';
import '../Style/main.css'; // Import CSS for styling

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
        setSubmissionStatus('submitting');

        // In a real application, you would send this data to a server
        // For this example, we'll simulate a successful submission after a short delay
        setTimeout(() => {
            setSubmissionStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Clear the form
        }, 1500);

        // Or simulate an error
        // setTimeout(() => {
        //     setSubmissionStatus('error');
        // }, 1500);
    };

    return (
        <main className="contact-page">
            <h1>Contact</h1>
            <div className="contact-card">
                <h2>Get In Touch</h2>
                <p>We'd love to hear from you! Send us a message using the form below.</p>

                {submissionStatus === 'success' && (
                    <div className="success-message">
                        Thank you for your message! We'll get back to you as soon as possible.
                    </div>
                )}

                {submissionStatus === 'error' && (
                    <div className="error-message">
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
                <h2>Contact Us</h2>
                <p>Email: <a href="mailto:contact@greenearthseattle.org">contact@greenearthseattle.org</a></p>
                <p>Phone: (206) 555-0123</p>
                <p>Follow us on social media or use the form below to get in touch!</p>
            </div>
        </main>
    );
}

export default Contact;