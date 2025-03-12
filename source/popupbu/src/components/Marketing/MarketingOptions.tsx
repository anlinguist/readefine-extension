import React, { useContext } from 'react'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext';

function MarketingOptions({
  handleUserResponse
}: any) {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <p id="marketing-modal-description">Would you like to receive emails about Readefine products and features?</p>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div id="marketing-modal-buttons">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <button id="marketing-modal-no-button" onClick={() => handleUserResponse(false)}>No thanks</button>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <button id="marketing-modal-yes-button" onClick={() => handleUserResponse(true)}>Yes</button>
        </div>
    </>
  )
}

export default MarketingOptions