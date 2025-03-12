import React from 'react'
// @ts-expect-error TS(6142): Module '../Marketing/MarketingSettings' was resolv... Remove this comment to see the full error message
import MarketingSettings from '../Marketing/MarketingSettings';

function MarketingModal() {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id="marketing-modal" className="modal-content" onClick={((e) => { e.stopPropagation() })}>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <h2 id="marketing-modal-title">Stay Updated!</h2>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <MarketingSettings />
    </div>
  )
}

export default MarketingModal