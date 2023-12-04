import React, { useContext } from 'react'
import { RDFNContext } from '../../RDFNContext';

function MarketingSettingsToggle({handleUserResponse}) {
  const { readefineMarketingEmails, setReadefineMarketingEmails } = useContext(RDFNContext);
  const updateMarketing = async (e) => {
    setReadefineMarketingEmails(e.target.checked)
    handleUserResponse(e.target.checked)
  }

  return (
    <>
        <div className='settingscontainer'>
          <div className='settingsname'>Readefine Product Updates</div>
          <label className="switch">
            <input className="addonenabler" checked={readefineMarketingEmails ? true : false} type="checkbox" onChange={(e) => updateMarketing(e)} />
            <span className="slider round"></span>
          </label>
        </div>
        <div className='rdfnmodeexplainer'>
          <div className='rdfnmodeexclamation'>&#xe88f;</div>
          {
            readefineMarketingEmails && <p>You're currently subscribed to get product and feature updates from us.</p>
          }
          {
            !readefineMarketingEmails && <p>You're not currently subscribed to get product and feature updates from us.</p>
          }
        </div>
    </>
  )
}

export default MarketingSettingsToggle