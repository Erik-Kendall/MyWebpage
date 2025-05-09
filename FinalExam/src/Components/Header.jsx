import React from 'react';
import { Link } from 'react-router-dom';
import '../style/main.css';
import logo from '../components/GreenEarthSeattle.png'; // Adjust path if using /assets

function Header() {
    return (
        <header className="main-header">
            <h1 className="site-title">Green Earth Seattle</h1>
            <nav className="top-menu">
                <ul className="tab-list">
                    <li><Link to="/" className="tab" activeClassName="active-tab">Home</Link></li>
                    <li><Link to="/nonprofit" className="tab" activeClassName="active-tab">Non Profit</Link></li>
                    <li><Link to="/blog" className="tab" activeClassName="active-tab">Blog</Link></li>
                    <li><Link to="/aboutme" className="tab" activeClassName="active-tab">About Me</Link></li>
                    <li><Link to="/contact" className="tab" activeClassName="active-tab">Contact</Link></li>
                </ul>
            </nav>
            <img src={logo} alt="Green Earth Seattle Logo" className="site-logo" />
        </header>
    );
}

export default Header;