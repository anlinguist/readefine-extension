import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'

function UhOh() {
  return (
    <div id={"uhohmain"}>
        <FaExclamationTriangle />
        <p>Uh-oh! It looks like you're not connected to the internet.</p>
    </div>
  )
}

export default UhOh