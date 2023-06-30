import React, { useState, createContext } from 'react';
import { useSearchParams } from 'react-router-dom';

const RDFNContext = createContext();

const RDFNContextProvider = ({ children }) => {
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
  const contextValues = { 
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
    setShowModal,
    setStatus,
    setTeamDictionaries,
    setUser,
    setUserCount,
    setUserName,
    setUserPhoto,
    setUserTeam,
    setWordObj,
    showModal,
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