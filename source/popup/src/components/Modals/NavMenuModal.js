import { NavLink } from "react-router-dom";

function NavMenuModal() {
    return (
        <ul id="menu">
            <div><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/personal-dictionary">Personal</NavLink></div>
            <div><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/community-dictionaries">Community</NavLink></div>
            <div><NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/settings">Settings</NavLink></div>
        </ul>
    );
}

export default NavMenuModal;