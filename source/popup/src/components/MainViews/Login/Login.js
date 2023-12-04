/*global chrome*/
import React from 'react';
import './Login.css';

function Login() {
  return (
    <div id="main_login_body">
      <div id="rdfn_login_container">
        <div id="rdfn-splashscreen-logo">
          <svg class="mainlogo" width="300px" height="225px" viewBox="0 0 2000 1500" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>Readefine Logo</title>
              <g id="Base-Readefine-Logo" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <rect id="Rectangle" fill="#FFDE00" x="0" y="0" width="2000" height="1100" rx="85"></rect>
                  <polygon id="Triangle" fill="#FFDE00" transform="translate(1500.000000, 1198.000000) rotate(180.000000) translate(-1500.000000, -1198.000000) " points="1500 1068 1700 1328 1300 1328"></polygon>
                  <text class="rdfn-logo-letter" id="logo-r" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="261" y="695.666667">r</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-e-1" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="379.5" y="695.666667">e</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-a" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="570" y="695.666667">a</tspan>
                  </text>
                  <text class="rdfn-logo-letter" id="logo-d" font-family="Roboto-Regular, Roboto" font-size="360" font-weight="normal" fill="#000000">
                      <tspan x="766" y="695.666667">d</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-e-2" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="969" y="695.666667">e</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-f" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1155" y="695.666667">f</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-i" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1274.2" y="695.666667">i</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-n" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1359" y="695.666667">n</tspan>
                  </text>
                  <text class="rdfn-logo-letter-ub" id="logo-e-3" font-family="Roboto-Light, Roboto" font-size="360" font-weight="300" fill="#000000">
                      <tspan x="1552.65" y="695.666667">e</tspan>
                  </text>
              </g>
          </svg>
        </div>
        <div id="rdfn-splash-text">
            <h2 class="rdfn-splashscreen" id="rdfn-splashscreen-header">Reword the internet.</h2>
            <p class="rdfn-splashscreen" id="rdfn-splashscreen-paragraph">Using Readefine, you can reword the internet to suit your needs.</p>
        </div>
        <div id="rdfn-splashscreen-welcome-btn-container">
          <button id="rdfn-splashscreen-welcome-btn" onClick={((e) => {
            // create new chrome tab at https://app.readefine.ai/?modal=welcome
            chrome.tabs.create({url: "https://app.readefine.ai/?modal=welcome"});
          })}>Set up Readefine</button>
        </div>
      </div>
    </div>
  )
}

export default Login