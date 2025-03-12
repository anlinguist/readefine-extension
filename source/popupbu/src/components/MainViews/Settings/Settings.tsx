/*global chrome*/
import React, { useContext, useState } from 'react';
import './Settings.css';
import { RDFNContext } from '../../../RDFNContext';
import MarketingSettings from '../../Marketing/MarketingSettings';

function Settings() {
  // @ts-expect-error TS(2339): Property 'aiPromptOptions' does not exist on type ... Remove this comment to see the full error message
  const { aiPromptOptions, mode, setMode, HLRDFN, readefineMarketingEmailsSet, setAIPromptOptions, proStatus, setHLRDFN, showToastMessage, signUserOut, user } = useContext(RDFNContext)
  
  const toggleHLRDFN = async (e: any) => {
    setHLRDFN(e.target.checked ? true : false)
    await chrome.storage.local.set({ hl2rdfn: e.target.checked ? true : false })
    chrome.runtime.sendMessage({ swaction: "UPDATE_READEFINE_AI", val: e.target.checked ? true : false });
  };
  const switchModes = async (e: any) => {
    const raw = JSON.stringify({
      "readefineMode": e.target.value
    });

    const url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/userDetails";
    const postInfo = {
      method: 'POST',
      headers: {
        'token': user,
        "Content-Type": "application/json",
        'version': '5'
      },
      body: raw
    };
    const resp = await fetch(url, postInfo);
    if (resp.status === 401) {
      await signUserOut();
      return;
    }

    const updatedata = await resp.json();
    chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" });
    setMode(updatedata['readefineMode']);
  };
    
  return (
    <div id='rdfnsettings'>
      <div id='allsettingscontainer'>
        <div id='rdfnmodetitle'>User mode</div>
        <form id="rdfnmode" className="wrapper">
          <input type="radio" value="reading" name="select" id="option-1" checked={mode === "reading"} onChange={switchModes} />
          <input type="radio" value="learning" name="select" id="option-2" checked={mode === "learning"} onChange={switchModes} />
          <label htmlFor="option-1" className="option option-1">
            <div className="dot"></div>
            <span>Reading</span>
          </label>
          <label htmlFor="option-2" className="option option-2">
            <div className="dot"></div>
            <span>Learning</span>
          </label>
        </form>
        <div id={readefineMarketingEmailsSet ? "" : "marketingsettingscontainer"}>
          <MarketingSettings />
        </div>
        <div className='settingscontainer'>
          <div className='settingsname'>Readefine AI</div>
          <label className="switch">
            <input className="addonenabler" checked={HLRDFN ? true : false} type="checkbox" onChange={(e) => toggleHLRDFN(e)} />
            <span className="slider round"></span>
          </label>
        </div>
        <div className='rdfnmodeexplainer'>
          <div className='rdfnmodeexclamation'>&#xe88f;</div>
          <p>Readefine AI allows you to select text and reword it using AI.</p>
        </div>
        <button id='account-settings-btn' onClick={((e)=> {
          e.preventDefault();
          chrome.runtime.sendMessage({ swaction: "OPEN_ACCOUNT_URL" });
        })}>Account</button>
      </div>
    </div>
  )
}

export default Settings