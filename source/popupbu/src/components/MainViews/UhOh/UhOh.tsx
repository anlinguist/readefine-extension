import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'

function UhOh() {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id={"uhohmain"}>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <FaExclamationTriangle />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <p>Uh-oh! It looks like you need to connect to the internet.</p>
    </div>
  )
}

export default UhOh