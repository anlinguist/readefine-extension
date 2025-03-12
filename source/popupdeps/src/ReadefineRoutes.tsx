// @ts-nocheck
// /*global browser*/
/*global chrome*/
import { useContext, useEffect } from 'react'
import routes from './routes';
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { RDFNContext } from './RDFNContext';
import Footer from './components/Footer/Footer';
import default_photo from './assets/def_prof_pic.jpeg'
import usePrevious from './components/usePrevious';
import { useAuth } from './contexts/AuthContext';
import { NavbarMinimal } from './components/Navigation/NavBarMinimal';
import { ModalsProvider } from "@mantine/modals";
import AddReadefinition from './components/Modals/AddReadefinition';
import NewDictionary from './components/Modals/NewDictionary';
import EditReadefinition from './components/Modals/EditReadefinition';
import MarketingModal from './components/Modals/MarketingModal';
import Settings from './components/Modals/Settings';
import UploadReadefinitions from './components/Modals/UploadReadefinitions';
import CreateNewAIStyle from './components/Modals/CreateNewAIStyle';
import CreateNewAITarget from './components/Modals/CreateNewAITarget';
import RequestConversion from './components/Modals/RequestConversion';

const ProtectedRoute = ({
  redirectPath = '/',
  children
}: any) => {
  // @ts-expect-error TS(2339): Property 'user' does not exist on type 'unknown'.
  const { user, loading } = useAuth();
  if (loading) {
    return
  }
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

function ReadefineRoutes() {
  // @ts-expect-error TS(2339): Property 'createDownloadLink' does not exist on ty... Remove this comment to see the full error message
  const { createDownloadLink, dictionaryType, isSuperAdmin, loadingUserData, setAIPromptOptions, setDictionaryContent, setDictLoading, setDomains, setProStatus, setIsSuperAdmin, setShowedMarketingModal, showedMarketingModal, setLoadingUserData, setModalName, setShowModal, setUserCount, setUserName, setUserPhoto, setReadefineMarketingEmailsSet, setReadefineMarketingEmails, setProPaymentSystem, status, setStatus, updateUserProfileData } = useContext(RDFNContext);
  const { user, loading, makeRdfnRequest } = useAuth();
  const prevDictionaryType = usePrevious(dictionaryType);
  const location = useLocation();
  const navigate = useNavigate();

  const fetch_data = async () => {
    setDictLoading(true)
    setDictionaryContent([])

    try {
      const path = '/user/details';
      const response = await makeRdfnRequest(path, 'GET', {}, null);
      if (!response.ok) {
        setLoadingUserData(false);
        return;
      }
      const data = await response.json();
      await updateUserProfileData(data);
      
    } catch (err) {
      console.log(err)
      setShowModal(false)
      setModalName("")
      setLoadingUserData(false);
      navigate("/error", { replace: true });
    }
  }

  useEffect(() => {
    if (loading) return;
    if (user) {
      setUserPhoto(user?.photoURL ? user?.photoURL : default_photo);
      setUserName(user?.displayName ? user?.displayName : user?.email);
      fetch_data();
    }
    else {
      const locationPath = location.pathname;
      setLoadingUserData(false);
      if (locationPath === '/welcome') {
        navigate(`/?modal=welcome`);
      }
      else {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (prevDictionaryType !== '' && dictionaryType === 'user') {
      fetch_data();
    }
  }, [dictionaryType]);

  useEffect(() => {
    const getStoredData = async () => {
      const { status = true } = await chrome.storage.local.get();
      if (status) {
        setStatus(true)
      } else {
        setStatus(false)
      }
    }
    getStoredData();
  }, []);

  return (
    <>
      {
        !loadingUserData &&
        <>
          {
            location.pathname !== '/' &&
            <NavbarMinimal />
          }
          <div id='routeContainer'>
            <Routes>
              {
                routes.map(({ path, Component, protectedRoute, superAdmin }, index) => {
                  const element = protectedRoute ? (
                    <ProtectedRoute>
                      <ModalsProvider
                        modals={{
                          "add-readefinition": AddReadefinition,
                          "new-dictionary": NewDictionary,
                          "edit-readefinition": EditReadefinition,
                          "marketing": MarketingModal,
                          "settings": Settings,
                          "upload-readefinitions": UploadReadefinitions,
                          "add-new-style": CreateNewAIStyle,
                          "add-new-target": CreateNewAITarget,
                          "request-conversion": RequestConversion
                        }}
                      >
                        <Component />
                      </ModalsProvider>
                    </ProtectedRoute>
                  ) : (<ModalsProvider
                    modals={{
                      "settings": Settings,
                      "marketing": MarketingModal,
                    }}
                  >
                    <Component />
                    </ModalsProvider>
                  );
                  return (
                    <Route key={index} path={`/${path}`} element={element} />
                  )
                })
              }
            </Routes>
            <Footer />
          </div>
        </>
      }
      {
        loadingUserData &&
        <div id='loadingUserData'>
          <div className="loading"></div>
        </div>
      }
    </>
  )
}

export default ReadefineRoutes