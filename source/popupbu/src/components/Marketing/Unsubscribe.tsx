import React from 'react'

function Unsubscribe({
  handleUserResponse
}: any) {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='subscription-container'>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <p className={'subscription-description'}>You're currently subscribed to get product and feature updates from us.</p>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <button id="marketing-modal-no-button" onClick={() => handleUserResponse(false)}>Unsubscribe</button>
    </div>
  )
}

export default Unsubscribe