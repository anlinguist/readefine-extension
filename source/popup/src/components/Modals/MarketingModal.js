import React from 'react'
import MarketingSettings from '../Marketing/MarketingSettings';

function MarketingModal() {
  return (
    <div id="marketing-modal" className="modal-content" onClick={((e) => { e.stopPropagation() })}>
        <h2 id="marketing-modal-title">Stay Updated!</h2>
        <MarketingSettings />
    </div>
  )
}

export default MarketingModal