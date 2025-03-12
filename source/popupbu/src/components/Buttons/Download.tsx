import React, { useContext } from 'react'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext'

function Download(props: any) {
  // @ts-expect-error TS(2339): Property 'downloadLink' does not exist on type 'un... Remove this comment to see the full error message
  const { downloadLink } = useContext(RDFNContext)
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <a className={props.permissionLevels} href={downloadLink} download={props.doc_title} id="download-container"><label className="pd-download"><span className="download-icon">&#xe2c4;</span></label></a>
  )
}

export default Download