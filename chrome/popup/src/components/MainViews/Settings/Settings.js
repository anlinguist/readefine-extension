/*global chrome*/
import React, { useContext } from 'react';
import './Settings.css';
import { RDFNContext } from '../../../RDFNContext';

function Settings() {
  const { dialect, setDialect, mode, pdfs, setMode, HLRDFN, setHLRDFN, setPDFs, user } = useContext(RDFNContext)

  const togglePDFs = async (e) => {
    setPDFs(e.target.checked)
    await chrome.storage.local.set({ pdfs: e.target.checked ? "enabled" : "disabled" })
  };
  const toggleHLRDFN = async (e) => {
    setHLRDFN(e.target.checked ? true : false)
    await chrome.storage.local.set({ hl2rdfn: e.target.checked ? true : false })
  };
  const toggleDialects = async (e) => {
    let raw = JSON.stringify({
      "readefineDialects": e.target.checked ? "US" : false
    });

    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/userDetails"
    let postInfo = {
      method: 'POST',
      headers: {
        'uid': user,
        "Content-Type": "application/json"
      },
      body: raw
    }
    let resp = await fetch(url, postInfo)
    let updatedata = await resp.json()
    chrome.runtime.sendMessage({ action: "rereadefine_tabs" })
    setDialect(updatedata['readefineDialects'])
  };
  const switchModes = async (e) => {
    const raw = JSON.stringify({
      "readefineMode": e.target.value
    });

    const url = "https://readefine-node-server-57discg22a-uc.a.run.app/userDetails";
    const postInfo = {
      method: 'POST',
      headers: {
        'uid': user,
        "Content-Type": "application/json"
      },
      body: raw
    };
    const resp = await fetch(url, postInfo);
    const updatedata = await resp.json();
    chrome.runtime.sendMessage({ action: "rereadefine_tabs" });
    setMode(updatedata['readefineMode']);
  };
  const switchDialects = async (e) => {
    const raw = JSON.stringify({
      "readefineDialects": e.target.value
    });

    const url = "https://readefine-node-server-57discg22a-uc.a.run.app/userDetails";
    const postInfo = {
      method: 'POST',
      headers: {
        'uid': user,
        "Content-Type": "application/json"
      },
      body: raw
    };
    const resp = await fetch(url, postInfo);
    const updatedata = await resp.json();
    chrome.runtime.sendMessage({ action: "rereadefine_tabs" });
    setDialect(updatedata['readefineDialects']);
  };

  return (
    <div id='rdfnsettings'>
      <div id='allsettingscontainer'>
        <div id='rdfnmodetitle'>User mode</div>
        <form id="rdfnmode" class="wrapper">
          <input type="radio" value="reading" name="select" id="option-1" checked={mode === "reading"} onChange={switchModes} />
          <input type="radio" value="learning" name="select" id="option-2" checked={mode === "learning"} onChange={switchModes} />
          <label for="option-1" class="option option-1">
            <div class="dot"></div>
            <span>Reading</span>
          </label>
          <label for="option-2" class="option option-2">
            <div class="dot"></div>
            <span>Learning</span>
          </label>
        </form>
        <div className='rdfnmodeexplainer'>
          <div className='rdfnmodeexclamation'>&#xe88f;</div>
          {
            mode === "reading" && <p>In reading mode, phrases are replaced with their Readefinitions. See the original by hovering over an underlined phrase.</p>
          }
          {
            mode === "learning" && <p>In learning mode, original phrases remain visible. You can see the Readefinition by hovering over an underlined phrase.</p>
          }
        </div>
        <div className='settingscontainer'>
          <div className='settingsname'>Dialects</div>
          <label className="switch">
            <input className="addonenabler" checked={dialect ? true : false} type="checkbox" onChange={(e) => toggleDialects(e)} />
            <span className="slider round"></span>
          </label>
        </div>
        <form id="locationchooser" class={"wrapper " + (dialect ? 'expanded' : 'collapsed')}>
          <input type="radio" value="US" name="locationselect" id="option-US" checked={dialect === "US"} onChange={switchDialects} />
          <input type="radio" value="UK" name="locationselect" id="option-UK" checked={dialect !== "US"} onChange={switchDialects} />
          <label for="option-US" class="option option-US">
            <div class="dot"></div>
            <span>US</span>
          </label>
          <label for="option-UK" class="option option-UK">
            <div class="dot"></div>
            <span>UK</span>
          </label>
        </form>
        <div className='settingscontainer'>
          <div className='settingsname'>Highlight to Readefine</div>
          <label className="switch">
            <input className="addonenabler" checked={HLRDFN ? true : false} type="checkbox" onChange={(e) => toggleHLRDFN(e)} />
            <span className="slider round"></span>
          </label>
        </div>
        <div className='rdfnmodeexplainer'>
          <div className='rdfnmodeexclamation'>&#xe88f;</div>
          <p>Highlight to Readefine allows you to easily add new words or phrases to your personal dictionary.</p>
        </div>
        <div className='settingscontainer'>
          <div className='settingsname'>PDFs</div>
          <label className="switch">
            <input className="addonenabler" checked={pdfs === "enabled" ? true : false} type="checkbox" onChange={(e) => togglePDFs(e)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings