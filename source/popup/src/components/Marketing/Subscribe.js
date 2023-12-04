import React from 'react'

function Subscribe({handleUserResponse}) {
  return (
    <div id='subscription-container'>
        <p className={'subscription-description'}>You're not currently subscribed to get product and feature updates from us.</p>
        <button id="marketing-modal-yes-button" onClick={() => handleUserResponse(true)}>Subscribe</button>
    </div>
  )
}

export default Subscribe