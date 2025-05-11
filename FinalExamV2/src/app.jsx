import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header.jsx';
import Footer from './Components/Footer.jsx';
import Home from './pages/Home.jsx';
import NonProfit from './pages/NonProfit.jsx';
import Blog from './pages/Blog.jsx';
import AboutMe from './pages/AboutMe.jsx';
import Contact from './pages/Contact.jsx';

import './Style/main.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/nonprofit" element={<NonProfit />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/aboutme" element={<AboutMe />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;