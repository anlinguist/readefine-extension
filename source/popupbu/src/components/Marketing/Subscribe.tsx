import React from 'react'

function Subscribe({
  handleUserResponse
}: any) {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='subscription-container'>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <p className={'subscription-description'}>You're not currently subscribed to get product and feature updates from us.</p>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <button id="marketing-modal-yes-button" onClick={() => handleUserResponse(true)}>Subscribe</button>
    </div>
  )
}

export default Subscribe