/*global chrome*/
import React, { useContext, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import "./CD.css";
import { RDFNContext } from '../../../RDFNContext';

function CDSelector({fetch_data}) {
  const { domains, setDomains, user } = useContext(RDFNContext);
  const navigate = useNavigate();

  const toggleCD = async (e, dict) => {
    let cUDomains = domains['UDomains']
    if (e.target.checked) {
      cUDomains.push(dict)
    }
    else {
      cUDomains = cUDomains.filter(item => item !== dict);
    }
    let raw = JSON.stringify({
      "readefineAddons": cUDomains
    })
    
    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/userDetails"
    let postInfo = {
        method: 'POST',
        headers: {
            'uid': user,
            'Content-Type': 'application/json'
        },
        body: raw
    }

    const enable_response = await fetch(url, postInfo);
    const enable_data = await enable_response.json();
    chrome.runtime.sendMessage({action: "rereadefine_tabs"})
    setDomains({UDomains: enable_data['readefineAddons'], NUDomains: enable_data['disabledAddons']})
  },
  changedict = (e, val) => {
    if (e.target.classList.contains("addonenabler") || e.target.classList.contains("slider")) {}
    else {
      navigate(`/community-dictionaries/${val}`);
    }
  }

  useEffect(() => {
    if (!user || (!domains.UDomains && !domains.NUDomains)) {
      fetch_data()
    }
  }, [user, domains, fetch_data])

  return (
    <div id="cds_list" className={'dictnotselected'}>
        <div id="user_enabled_cds">
            {
                domains.UDomains &&
                domains.UDomains.length > 0 &&
                domains.UDomains.map((item, index) => {
                    return (
                    <div key={index} onClick={((e) => changedict(e, item))} className={"user_enabled_cd cds "}>
                        <div className="cds_title">{item}</div>
                        <label className="switch">
                        <input className="addonenabler" checked={true} type="checkbox" onChange={(e) => toggleCD(e, item)}/>
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
                domains.NUDomains.map((item, index) => {
                    return (
                        <div onClick={((e) => changedict(e, item))} key={index} className={"user_disabled_cd cds "}>
                        <div className="cds_title">{item}</div>
                        <label className="switch">
                            <input className="addonenabler" checked={false} type="checkbox" onChange={(e) => toggleCD(e, item)}/>
                            <span className="slider round"></span>
                        </label>
                        </div>
                    )
                })
            }
        </div>
    </div>
  )
}

export default CDSelector