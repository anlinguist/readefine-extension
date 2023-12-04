/*global chrome*/
import React from 'react';
import routes from '../components/MainViews/routes';
import { Route, Routes, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useContext, useEffect } from 'react';
import Modals from './Modals/Modals';
import { ToastContainer } from 'react-toastify';
import Header from './Header/Header';
import { RDFNContext } from '../RDFNContext';
import usePrevious from './usePrevious';

function ReadefineRoutes() {
  const { dictionaryType, proStatus, setAIPromptOptions, setDialect, setDictionaryContent, setDictLoading, setDomains, setDownloadLink, setHLRDFN, setMode, setShowModal, setModalName, setReadefineMarketingEmails, setReadefineMarketingEmailsSet, setShowedMarketingModal, setStatus, setTeamDictionaries, setUser, setUserCount, setUserName, setUserPhoto, setUserTeam, showedMarketingModal, signUserOut, teamDictionaries, setProStatus, user } = useContext(RDFNContext);
  const prevDictionaryType = usePrevious(dictionaryType)
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const fetch_data = async() => {
    console.log("fetching data...")
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
        'token': user,
        'version': '5'
      }
    }
    
    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/userDetails"
    try {
      let response = await fetch(url, postInfo)
      if (response.status === 401) {
        signUserOut();
        return;
      }
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

      if (data?.readefineAISubscription?.status === "Active" && data?.readefineAISubscription?.tier === "Pro") {
        setProStatus(true)
      } else {
        setProStatus(false)
      }
      if (data['readefineAIOptions']) {
        setAIPromptOptions(data['readefineAIOptions'])
      } else {
        setAIPromptOptions({})
      }

      if (data['readefineMarketingEmails'] === undefined) {
        if (!showedMarketingModal) {
          console.log("setShowedMarketingModal to true")
          setShowedMarketingModal(true)
          setShowModal(true)
          setModalName("marketing")
        }
      } else {
        setReadefineMarketingEmailsSet(true)
        setReadefineMarketingEmails(data['readefineMarketingEmails'])
      }

      setDomains({UDomains: data['readefineAddons'], NUDomains: data['disabledAddons']})

      if (data['tds'] && data.enabledTDs && data.disabledTDs && data.team && data.team.team) {
        setTeamDictionaries({enabled: data.enabledTDs, disabled: data.disabledTDs})
        setUserTeam(data.team.team)
      }
    }
    catch(err) {
      console.log(err)
      navigate("/error")
    }
  };
  const getStoredData = async() => {
    let { otp, gUserName, gUserPhoto, status, hl2rdfn } = await chrome.storage.local.get();
    if (otp) {
      if (gUserPhoto) {
        setUserPhoto(gUserPhoto)
      }
      if (gUserName) {
        setUserName(gUserName)
      }

      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });

      setUser(otp)
    }
    else {
      navigate("/login")
    }
    if (status) {
      setStatus(true)
    } else {
      setStatus(false)
    }
    if (hl2rdfn || typeof hl2rdfn === "undefined") {
      setHLRDFN(true)
    } else {
      setHLRDFN(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetch_data();
    } else {
      getStoredData();
    }
  }, [user]);
    
  useEffect(() => {
    if (prevDictionaryType !== '' && dictionaryType === 'user') {
      fetch_data();
    }
  }, [dictionaryType]);

  return (
    <>
      <Modals />
      <ToastContainer />
      {
        pathname !== "/login" &&
        <Header />
      }
      {
        user && pathname !== "/settings" &&
        <form id="dictionarychooser" class={"wrapper"}>
          <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/personal-dictionary">Personal</NavLink>
          <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/community-dictionaries">Community</NavLink>
          <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/pro">Pro</NavLink>
          {/* {
            teamDictionaries &&
            <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to="/team-dictionaries">Team</NavLink>
          } */}
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
              return (<Route key={index} path={path} element={ <Component /> } />)
            })
          }
      </Routes>
    </>
  )
}

export default ReadefineRoutes