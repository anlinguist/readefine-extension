import React, { useContext } from 'react'
import { RDFNContext } from '../../RDFNContext'

function CloseNavMenu() {
  const { closeModal, modalName, setModalName } = useContext(RDFNContext)
  return (
    <div id='closenavmenu' onClick={((e) => {
      closeModal()
    })}>&times;</div>
  )
}

export default CloseNavMenu