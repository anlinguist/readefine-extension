/*global chrome*/
import React, { useContext, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import '../../MainViews/CD/CD.css';
import { RDFNContext } from '../../../RDFNContext';

function TDSelector({fetch_data}) {
  const { teamDictionaries, setTeamDictionaries, setUserTeam, user } = useContext(RDFNContext);
  const navigate = useNavigate();

  const toggleTD = async (e, dict) => {
    let cUDomains = teamDictionaries['enabled']
    if (e.target.checked) {
      cUDomains.push(dict)
    }
    else {
      cUDomains = cUDomains.filter(item => item !== dict);
    }
    let raw = JSON.stringify({
      "team": cUDomains
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
    chrome.runtime.sendMessage({action: "rereadefine_tabs"});

    if (enable_data['tds'] && enable_data.enabledTDs && enable_data.disabledTDs && enable_data.team && enable_data.team.team) {
      setTeamDictionaries({enabled: enable_data.enabledTDs, disabled: enable_data.disabledTDs})
      setUserTeam(enable_data.team.team)
    }
  },
  changedict = (e, val) => {
    if (e.target.classList.contains("addonenabler") || e.target.classList.contains("slider")) {}
    else {
      navigate(`/team-dictionaries/${val}`);
    }
  }

  useEffect(() => {
    if (!user || (!teamDictionaries['enabled'] && !teamDictionaries['disabled'])) {
      fetch_data()
    }
  }, [user, teamDictionaries, fetch_data])

  return (
    <div id="cds_list" className={'dictnotselected'}>
        <div id="user_enabled_cds">
            {
                teamDictionaries.enabled &&
                teamDictionaries.enabled.length > 0 &&
                teamDictionaries.enabled.map((item, index) => {
                    return (
                    <div key={index} onClick={((e) => changedict(e, item))} className={"user_enabled_cd cds "}>
                        <div className="cds_title">{item}</div>
                        <label className="switch">
                        <input className="addonenabler" checked={true} type="checkbox" onChange={(e) => toggleTD(e, item)}/>
                        <span className="slider round"></span>
                        </label>
                    </div>
                    )
                })
            }
        </div>
        <div id="user_disabled_cds">
            {
                teamDictionaries.disabled &&
                teamDictionaries.disabled.length > 0 &&
                teamDictionaries.disabled.map((item, index) => {
                    return (
                        <div onClick={((e) => changedict(e, item))} key={index} className={"user_disabled_cd cds "}>
                        <div className="cds_title">{item}</div>
                        <label className="switch">
                            <input className="addonenabler" checked={false} type="checkbox" onChange={(e) => toggleTD(e, item)}/>
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

export default TDSelector