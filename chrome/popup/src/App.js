/*global chrome*/
import './App.css';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { HashRouter as Router } from "react-router-dom";
import ReadefineRoutes from './components/ReadefineRoutes';
import { RDFNContextProvider } from './RDFNContext';

function App() {  
  return (
    <div className="App">
      <HelmetProvider>
        <Helmet>
          <title>Readefine</title>
          <link href={chrome.runtime.getURL("assets/a_roboto.woff2")} rel='stylesheet'></link>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
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