/*global chrome*/
import React, { useState, createContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const RDFNContext = createContext();

const RDFNContextProvider = ({ children }) => {
  const [aiPromptOptions, setAIPromptOptions] = useState({});
  const [chosenAIStyle, setChosenAIStyle] = useState('');
  const [dialect, setDialect] = useState(false);
  const [dictionaryContent, setDictionaryContent] = useState([]);
  const [dictionaryName, setDictionaryName] = useState('');
  const [dictionaryType, setDictionaryType] = useState('');
  const [dictLoading, setDictLoading] = useState(true);
  const [domains, setDomains] = useState({});
  const [downloadLink, setDownloadLink] = useState('');
  const [editable, setEditable] = useState(false);
  const [HLRDFN, setHLRDFN] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [modalName, setModalName] = useState('');
  const [mode, setMode] = useState('reading');
  const [pdfs, setPdfs] = useState(false);
  const [proStatus, setProStatus] = useState(false);
  const [readefineMarketingEmails, setReadefineMarketingEmails] = useState(undefined);
  const [readefineMarketingEmailsSet, setReadefineMarketingEmailsSet] = useState(false);
  const [showedMarketingModal, setShowedMarketingModal] = useState(false);
  const [showModal, setShowModal] = useState(undefined);
  const [status, setStatus] = useState(false);
  const [teamDictionaries, setTeamDictionaries] = useState(false);
  const [user, setUser] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [userTeam, setUserTeam] = useState('');
  const [wordObj, setWordObj] = useState({});
  const closeModal = () => {
    setModalName("")
    setShowModal(false)
  };
  const signUserOut = async () => {
    await chrome.storage.local.clear()
    chrome.tabs.create({ url: 'https://app.readefine.ai/?modal=welcome' });
  }
  const prefersDarkMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  const showToastMessage = (msg, status) => {
    const theme = prefersDarkMode() ? "dark" : "light";
    if (status === 'success') {
      toast.success(msg, {
        position: toast.POSITION.TOP_RIGHT,
        theme: theme
      });
    } else if (status === 'error') {
      toast.error(msg, {
        position: toast.POSITION.TOP_RIGHT,
        theme: theme
      });
    }
  };
  const contextValues = {
    aiPromptOptions,
    chosenAIStyle,
    closeModal,
    dialect,
    dictionaryContent,
    dictionaryName,
    dictionaryType,
    dictLoading,
    domains,
    downloadLink,
    editable,
    HLRDFN,
    loadingFailed,
    modalName,
    mode,
    pdfs,
    proStatus,
    readefineMarketingEmails,
    readefineMarketingEmailsSet,
    setAIPromptOptions,
    setChosenAIStyle,
    setDialect,
    setDictionaryContent,
    setDictionaryName,
    setDictionaryType,
    setDictLoading,
    setDomains,
    setDownloadLink,
    setEditable,
    setHLRDFN,
    setLoadingFailed,
    setModalName,
    setMode,
    setPdfs,
    setProStatus,
    setShowModal,
    setStatus,
    setTeamDictionaries,
    setUser,
    setUserCount,
    setUserName,
    setUserPhoto,
    setUserTeam,
    setWordObj,
    setReadefineMarketingEmails,
    setReadefineMarketingEmailsSet,
    setShowedMarketingModal,
    showedMarketingModal,
    showModal,
    showToastMessage,
    signUserOut,
    status,
    teamDictionaries,
    user,
    userCount,
    userName,
    userPhoto,
    userTeam,
    wordObj
  }

  return (
    <RDFNContext.Provider value={contextValues}>
      {children}
    </RDFNContext.Provider>
  );
};

export { RDFNContext, RDFNContextProvider };