/*global chrome*/
import React, { useContext, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import "./CD.css";
import { RDFNContext } from '../../../RDFNContext';

function CDSelector() {
  // @ts-expect-error TS(2339): Property 'domains' does not exist on type 'unknown... Remove this comment to see the full error message
  const { domains, setDomains, signUserOut, user } = useContext(RDFNContext);
  const navigate = useNavigate();

  const toggleCD = async (e: any, dict: any) => {
    let cUDomains = domains['UDomains']
    if (e.target.checked) {
      cUDomains.push(dict)
    }
    else {
      cUDomains = cUDomains.filter((item: any) => item !== dict);
    }
    let raw = JSON.stringify({
      "readefineAddons": cUDomains
    })

    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/userDetails"
    let postInfo = {
      method: 'POST',
      headers: {
        'token': user,
        'Content-Type': 'application/json',
        'version': '5'
      },
      body: raw
    }

    const enable_response = await fetch(url, postInfo);
    if (enable_response.status === 401) {
      await signUserOut();
      return;
    }

    const enable_data = await enable_response.json();
    chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" })
    setDomains({ UDomains: enable_data['readefineAddons'], NUDomains: enable_data['disabledAddons'] })
  },
    changedict = (e: any, val: any) => {
      if (e.target.classList.contains("addonenabler") || e.target.classList.contains("slider")) { }
      else {
        navigate(`/community-dictionaries/${val}`);
      }
    }

  return (
    <div id="cds_list" className={'dictnotselected'}>
      <div id="user_enabled_cds">
        {
          domains.UDomains &&
          domains.UDomains.length > 0 &&
          domains.UDomains.map((item: any, index: any) => {
            return (
              <div key={index} onClick={((e) => changedict(e, item))} className={"user_enabled_cd cds "}>
                <div className="cds_title">{item}</div>
                <label className="switch">
                  <input className="addonenabler" checked={true} type="checkbox" onChange={(e) => toggleCD(e, item)} />
                  <span className="slider round"></span>
                </label>
              </div>
            )
          })
        }
      </div>
      <div id="user_disabled_cds">
        {
          domains.NUDomains &&
          domains.NUDomains.length > 0 &&
          domains.NUDomains.map((item: any, index: any) => {
            return (
              <div onClick={((e) => changedict(e, item))} key={index} className={"user_disabled_cd cds "}>
                <div className="cds_title">{item}</div>
                <label className="switch">
                  <input className="addonenabler" checked={false} type="checkbox" onChange={(e) => toggleCD(e, item)} />
                  <span className="slider round"></span>
                </label>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

export default CDSelector