import React, { useContext } from 'react'
import { RDFNContext } from '../../RDFNContext';

function MarketingOptions({handleUserResponse}) {
  return (
    <>
        <p id="marketing-modal-description">Would you like to receive emails about Readefine products and features?</p>
        <div id="marketing-modal-buttons">
            <button id="marketing-modal-no-button" onClick={() => handleUserResponse(false)}>No thanks</button>
            <button id="marketing-modal-yes-button" onClick={() => handleUserResponse(true)}>Yes</button>
        </div>
    </>
  )
}

export default MarketingOptions