/*global chrome*/
import React, { useContext } from 'react';
import { NavLink } from "react-router-dom";
import './NavBar.css'
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavMenu from './NavMenu';
import { RDFNContext } from '../../RDFNContext';

// this navbar should change if user is signed in
function NavBar() {
    const navigate = useNavigate();
    const { user, userName, status, setStatus, setUserName, teamDictionaries } = useContext(RDFNContext)

    const toggleRDFN = async (e) => {
      setStatus(e.target.checked)
      await chrome.storage.local.set({status: e.target.checked})
      await chrome.runtime.sendMessage({action: "rereadefine_tabs"})
  }
  
    useEffect(() => {
      if (user) {
        let user_name = userName ? userName : 'Friend'
        setUserName(user_name)
      }
    }, [user, navigate]);

    return (
        <div id="signed-in-nav-content">
          <div className="enablerdfntoggle-container">
                <label className="switch">
                    <input className="addonenabler" checked={status} type="checkbox" onChange={(e) => toggleRDFN(e)}/>
                    <span className="slider round"></span>
                </label>
            </div>
            <div id='nav-options'>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/personal-dictionary">Personal</NavLink>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/community-dictionaries">Community</NavLink>
                {/* {
                  teamDictionaries &&
                  <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/team-dictionaries">Team</NavLink>
                } */}
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/settings">Settings</NavLink>
            </div>
            <NavMenu />
        </div>
    );
}

export default NavBar;