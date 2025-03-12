import React, { useContext } from 'react'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext'

function CloseNavMenu() {
  // @ts-expect-error TS(2339): Property 'closeModal' does not exist on type 'unkn... Remove this comment to see the full error message
  const { closeModal, modalName, setModalName } = useContext(RDFNContext)
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='closenavmenu' onClick={((e) => {
      closeModal()
    })}>&times;</div>
  )
}

export default CloseNavMenu