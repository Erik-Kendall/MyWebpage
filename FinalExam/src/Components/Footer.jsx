import React from 'react';
import '../style/main.css';
import twitter from '../components/twitter_icon.png';
import facebook from '../components/facebook_icon.png';
import instagram from '../components/instagram_icon.png';
import linkedin from '../components/linkedin_icon.png';
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

function Footer() {
    const handleDonate = () => {
        Swal.fire({
            title: "Thank You!",
            text: "Thanks for Donating!",
            icon: "success",
            confirmButtonText: "OK"
        });
    };

    return (
        <footer className="site-footer">
            <div className="footer-left">
                &copy; 2025 Green Earth Seattle
            </div>

            <div className="footer-middle">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <img src={twitter} alt="Twitter" className="social-icon" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src={facebook} alt="Facebook" className="social-icon" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src={instagram} alt="Instagram" className="social-icon" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <img src={linkedin} alt="LinkedIn" className="social-icon" />
                </a>
            </div>

            <div className="footer-right">
                <button onClick={handleDonate}>Donate</button>
            </div>
        </footer>
    );
}

export default Footer;
