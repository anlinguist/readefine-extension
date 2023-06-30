/*global chrome*/
import React from 'react';
import routes from '../components/MainViews/routes';
import { Route, Routes, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useContext } from 'react';
import Modals from './Modals/Modals';
import Header from './Header/Header';
import { RDFNContext } from '../RDFNContext';

function ReadefineRoutes() {
  const { setDialect, setDictionaryContent, setDictLoading, setDomains, setDownloadLink, setHLRDFN, setMode, setStatus, setTeamDictionaries, setUser, setUserCount, setUserName, setUserPhoto, setUserTeam, teamDictionaries, user } = useContext(RDFNContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const fetch_data = useCallback(async() => {
    if (!user) {
      await getStoredData()
      return;
    }
    console.log("fetching data")
    setDictLoading(true)
    setDictionaryContent([])
    let postInfo = {
      method: 'GET',
      headers: {
        'uid': user,
      }
    }
    
    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/userDetails"
    try {
      let response = await fetch(url, postInfo)
      const data = await response.json();
      let readefinePersonalDictionary = data['readefinePersonalDictionaryV2']
      if (!Array.isArray(readefinePersonalDictionary)) {readefinePersonalDictionary = []}
      if (readefinePersonalDictionary) {
        readefinePersonalDictionary.sort((a, b) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
        setDictionaryContent(readefinePersonalDictionary)
        let output = '';
        for (let i in readefinePersonalDictionary) {
          output = output + readefinePersonalDictionary[i]['original'] + "\t" + readefinePersonalDictionary[i]['target'] + "\t" + (readefinePersonalDictionary[i]['definition'] ? readefinePersonalDictionary[i]['definition'] : '') + "\t" + (readefinePersonalDictionary[i]['link'] ? readefinePersonalDictionary[i]['link'] : '') + "\n"
        }
        setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));
        setDictLoading(false)
  
        // $("#download-container").hide()
        // $('#readefine_pd').append('<div style="font-size: 18px;margin: 100px;">You have no dictionary items</div>')
      }
      setUserCount(data['readefinedCount'])
      if (data['readefineDialects']) {
          setDialect(data['readefineDialects'])
      }
      // set mode
      if (data['readefineMode']) {
          setMode(data['readefineMode'])
      }
      setDomains({UDomains: data['readefineAddons'], NUDomains: data['disabledAddons']})

      if (data['tds'] && data.enabledTDs && data.disabledTDs && data.team && data.team.team) {
        setTeamDictionaries({enabled: data.enabledTDs, disabled: data.disabledTDs})
        setUserTeam(data.team.team)
      }
    }
    catch(err) {
      console.log(err)
      // navigate("/error")
    }
  }, [user]);
  const getStoredData = async() => {
    let { gUserID, gUserName, gUserPhoto, status, hl2rdfn } = await chrome.storage.local.get();
    if (gUserID) {
      if (gUserPhoto) {
        setUserPhoto(gUserPhoto)
      }
      if (gUserName) {
        setUserName(gUserName)
      }

      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });

      setUser(gUserID)
    }
    else {
      navigate("/login")
    }
    if (status || status === undefined) {
      setStatus(true)
    }
    if (hl2rdfn) {
      setHLRDFN(hl2rdfn)
    }
  }
    
  return (
    <>
      <Modals />
      <Header />
      {
        user && pathname !== "/settings" &&
        <form id="dictionarychooser" class={"wrapper"}>
          <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/personal-dictionary">Personal</NavLink>
          <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/community-dictionaries">Community</NavLink>
          {
            teamDictionaries &&
            <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/team-dictionaries">Team</NavLink>
          }
        </form>
      }
      <Routes>
          <Route
            path="/"
            element={
              <Navigate to={'/personal-dictionary'} replace />
            }
          />
          {
            routes.map(({path, Component}, index) => {
              return (<Route key={index} path={path} element={ <Component fetch_data={fetch_data} /> } />)
            })
          }
      </Routes>
    </>
  )
}

export default ReadefineRoutes