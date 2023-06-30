import React from 'react'

function Download(props) {
  return (
    <a className={props.permissionLevels} href={props.link} download={props.doc_title} id="download-container"><label className="pd-download"><span className="download-icon">&#xe2c4;</span></label></a>
  )
}

export default Download