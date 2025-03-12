/*global chrome*/
import './App.css';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { HashRouter as Router } from "react-router-dom";
// @ts-expect-error TS(6142): Module './components/ReadefineRoutes' was resolved... Remove this comment to see the full error message
import ReadefineRoutes from './components/ReadefineRoutes';
// @ts-expect-error TS(6142): Module './RDFNContext' was resolved to '/Users/and... Remove this comment to see the full error message
import { RDFNContextProvider } from './RDFNContext';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    // @ts-expect-error TS(2339): Property 'MSStream' does not exist on type 'Window... Remove this comment to see the full error message
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const htmlElement = document.documentElement;
    if (isIOS && !htmlElement.classList.contains('isIos') && !htmlElement.classList.contains('contextContentScript')) {
      htmlElement.classList.add('isIos');
    }
  }, []);

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className="App">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <HelmetProvider>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Helmet>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <title>Readefine</title>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <link href={chrome.runtime.getURL("assets/a_roboto.woff2")} rel='stylesheet'></link>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <link rel="stylesheet" href={chrome.runtime.getURL(`assets/fa.min.css`)}></link>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        </Helmet>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <RDFNContextProvider>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <Router>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <ReadefineRoutes />
          </Router>
        </RDFNContextProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;