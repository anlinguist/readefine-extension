/*global chrome*/
import './App.css';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { HashRouter as Router } from "react-router-dom";
import ReadefineRoutes from './components/ReadefineRoutes';
import { RDFNContextProvider } from './RDFNContext';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const htmlElement = document.documentElement;
    if (isIOS && !htmlElement.classList.contains('isIos') && !htmlElement.classList.contains('contextContentScript')) {
      htmlElement.classList.add('isIos');
    }
  }, []);

  return (
    <div className="App">
      <HelmetProvider>
        <Helmet>
          <title>Readefine</title>
          <link href={chrome.runtime.getURL("assets/a_roboto.woff2")} rel='stylesheet'></link>
          <link rel="stylesheet" href={chrome.runtime.getURL(`assets/fa.min.css`)}></link>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        </Helmet>
        <RDFNContextProvider>
          <Router>
            <ReadefineRoutes />
          </Router>
        </RDFNContextProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;