import React, { useContext } from 'react'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext';

function MarketingSettingsToggle({
  handleUserResponse
}: any) {
  // @ts-expect-error TS(2339): Property 'readefineMarketingEmails' does not exist... Remove this comment to see the full error message
  const { readefineMarketingEmails, setReadefineMarketingEmails } = useContext(RDFNContext);
  const updateMarketing = async (e: any) => {
    setReadefineMarketingEmails(e.target.checked)
    handleUserResponse(e.target.checked)
  }

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className='settingscontainer'>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className='settingsname'>Readefine Product Updates</div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <label className="switch">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <input className="addonenabler" checked={readefineMarketingEmails ? true : false} type="checkbox" onChange={(e) => updateMarketing(e)} />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <span className="slider round"></span>
          </label>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className='rdfnmodeexplainer'>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className='rdfnmodeexclamation'>&#xe88f;</div>
          {
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            readefineMarketingEmails && <p>You're currently subscribed to get product and feature updates from us.</p>
          }
          {
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            !readefineMarketingEmails && <p>You're not currently subscribed to get product and feature updates from us.</p>
          }
        </div>
    </>
  )
}

export default MarketingSettingsToggle