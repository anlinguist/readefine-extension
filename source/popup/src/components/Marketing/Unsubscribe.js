import React from 'react'

function Unsubscribe({handleUserResponse}) {
  return (
    <div id='subscription-container'>
        <p className={'subscription-description'}>You're currently subscribed to get product and feature updates from us.</p>
        <button id="marketing-modal-no-button" onClick={() => handleUserResponse(false)}>Unsubscribe</button>
    </div>
  )
}

export default Unsubscribe