import { NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="top-menu">
            <div className="tab-list">
                <NavLink to="/" end className="tab" activeClassName="active-tab">Home</NavLink>
                <NavLink to="/nonprofit" className="tab" activeClassName="active-tab">Non Profit</NavLink>
                <NavLink to="/blog" className="tab" activeClassName="active-tab">Blog</NavLink>
                <NavLink to="/aboutme" className="tab" activeClassName="active-tab">About Me</NavLink>
                <NavLink to="/contact" className="tab" activeClassName="active-tab">Contact</NavLink>
            </div>
        </nav>
    );
}

export default NavBar;

