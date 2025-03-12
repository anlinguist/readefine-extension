import { NavLink } from "react-router-dom";

function NavMenuModal() {
    return (
        // @ts-expect-error TS(2304): Cannot find name 'ul'.
        <ul id="menu">
            // @ts-expect-error TS(2304): Cannot find name 'div'.
            <div><NavLink className={({
                isActive
            // @ts-expect-error TS(2304): Cannot find name 'to'.
            }: any) => "nav-link" + (isActive ? " active" : "")} to="/personal-dictionary">Personal</NavLink></div>
            // @ts-expect-error TS(2304): Cannot find name 'div'.
            <div><NavLink className={({
                isActive
            // @ts-expect-error TS(2304): Cannot find name 'to'.
            }: any) => "nav-link" + (isActive ? " active" : "")} to="/community-dictionaries">Community</NavLink></div>
            // @ts-expect-error TS(2304): Cannot find name 'div'.
            <div><NavLink className={({
                isActive
            // @ts-expect-error TS(2304): Cannot find name 'to'.
            }: any) => "nav-link" + (isActive ? " active" : "")} to="/settings">Settings</NavLink></div>
        </ul>
    );
}

export default NavMenuModal;