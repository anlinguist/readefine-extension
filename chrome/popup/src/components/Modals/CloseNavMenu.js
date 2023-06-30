import React, { useContext } from 'react'
import { RDFNContext } from '../../RDFNContext'

function CloseNavMenu() {
  const { closeModal } = useContext(RDFNContext)
  return (
    <div id='closenavmenu' onClick={((e) => {
      closeModal()
    })}>&times;</div>
  )
}

export default CloseNavMenu