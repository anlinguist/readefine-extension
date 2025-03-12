/*global chrome*/
import React, { useState, useEffect, useRef, useContext } from 'react'
import { RDFNContext } from '../../RDFNContext'

function UploadToD() {
  // @ts-expect-error TS(2339): Property 'closeModal' does not exist on type 'unkn... Remove this comment to see the full error message
  const { closeModal, dictionaryName, dictionaryType, setDictionaryContent, setDownloadLink, signUserOut, user, userTeam } = useContext(RDFNContext);
  const [uploadItems, setUploadItems] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [showResponse, setShowResponse] = useState("hidden")
  const [showNotTsv, setShowNotTsv] = useState('hidden')
  const [showFileDictContainer, setShowFileDictContainer] = useState('hidden')
  const [showUploadDictBtn, setShowUploadDictBtn] = useState('')
  const [showUploadBtnLoader, setShowUploadBtnLoader] = useState('hidden')
  const [jsonObj, setJsonObj] = useState({});
  const [uploading, setUploading] = useState(false);
  const myRef = useRef(null);
  const fileUploadRef = useRef();
  const fileDragRef = useRef<any>();
  const uploadBtnRef = useRef<any>();
  const reader = useRef(new FileReader());

  const submitJsonObj = async() => {
    if (dictionaryName === "" && dictionaryType !== "user") {
      return
    }
    setShowUploadDictBtn('hidden')
    setShowUploadBtnLoader('')
    var radios = document.getElementsByName('dictionary_options');
    let selected_update_type;
    for (var i = 0, length = radios.length; i < length; i++) {
      // @ts-expect-error TS(2339): Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
      if (radios[i].checked) {
        // @ts-expect-error TS(2339): Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
        selected_update_type = radios[i].value;
        break;
      }
    }

    let sendObj = {
      [dictionaryType]: {
        readefinitions: jsonObj,
        updateType: selected_update_type
      }
    }
    if (dictionaryType === "addon") {
      // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
      sendObj['addon']['addonName'] = dictionaryName
    }
    else if (dictionaryType === "team") {
      // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
      sendObj['team']['team'] = userTeam
      // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
      sendObj['team']['dictionary'] = dictionaryName
    }

    let postInfo = {
      method: 'PUT',
      headers: {
        'token': user,
        'Content-Type': 'application/json',
        'version': '5'
      },
      body: JSON.stringify(sendObj)
    }

    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"

    let resp = await fetch(url, postInfo)
    if (resp.status === 401) {
      await signUserOut();
      return;
    }

    let data = await resp.json()
    if (!data['error']) {
      setShowUploadBtnLoader('hidden')
      setShowUploadDictBtn('')
      data.sort((a: any, b: any) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
      // tell user personal dictionary to update
      setDictionaryContent(data)
      let output = '';
      for (let i in data) {
        output = output + data[i]['original'] + "\t" + data[i]['target'] + "\t" + (data[i]['definition'] ? data[i]['definition'] : '') + "\t" + (data[i]['link'] ? data[i]['link'] : '') + "\n"
      }
      setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));

      chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" })
      closeModal();
    }
    else {
      console.log("You don't have permission to edit this dictionary.")
      // show user message: "You don't have permission to edit this
      // community dictionary."
      setShowUploadBtnLoader('hidden')
      setShowUploadDictBtn('')
    }
  }
  const createArrFromData = (data: any) => {
    try {
      let lines = data.split("\n");
      var arr = [];
      for (var i=0; i < lines.length; i++) {
        let c_obj = {};
        var currentline = lines[i].split("\t");
        if (currentline[0] !== "" && currentline[1] !== "") {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          c_obj['original'] = currentline[0].replace('\r', "");
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          c_obj['target'] = currentline[1].replace('\r', "");
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          c_obj['definition'] = currentline[2].replace('\r', "");
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          c_obj['link'] = currentline[3].replace('\r', "");
          arr.push(c_obj)
        }
      }
      return arr;
    }
    catch {
      return false
    }
  }
  const createObjFromData = (data: any) => {
    try {
      var lines=data.split("\n");
      var obj = {};
      for(var i=0; i<lines.length; i++) {
        var currentline=lines[i].split("\t");
        if (currentline[0] !== "" && currentline[1] !== "") {
          let curr_key = currentline[0].replace('\r', "")
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          obj[curr_key] = {
            target: currentline[1].replace('\r', "")
          }
          if (currentline.length > 2 && currentline[2].replace('\r', "") !== '') {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj[curr_key]['definition'] = currentline[2].replace('\r', "")
          }
          if (currentline.length > 3 && currentline[3].replace('\r', "") !== '') {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            obj[curr_key]['link'] = currentline[3].replace('\r', "")
          }
        }
      }
      return obj
    }
    catch {
      return false
    }
  }
  const reportErrorInFile = () => {
    // here we will show an error to the user, informing them that their
    // dictionary is malformed.
  }
  const fileSelectHandler = (e: any) => {
    e.preventDefault();
    // Fetch FileList object
    let files
    try {
      if (e.target.files[0]) {
        files = e.target.files[0]
      }
    }
    catch {
      try {
        if (e.dataTransfer.files['0']) {
          files = e.dataTransfer.files['0']
        }
      }
      catch {
        return
      }
    }

    // Process all File objects
    parseFile(files);
  }
  const parseFile = (file: any) => {
    setMessage(encodeURI(file.name));
    var imageName = file.name;
    var isGood = (((/\.(?=tsv)/gi))).test(imageName);
    if (isGood) {
      setShowResponse('')
      setShowNotTsv('hidden')
        
      reader.current.readAsText(file)
      setShowFileDictContainer('')
    }
    else {
      setShowFileDictContainer('hidden')
      setShowNotTsv('')
      setShowResponse('hidden')
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      fileUploadRef.current.value = ''; // Reset file input
    }
  }

  reader.current.onload = () => {
    setUploadItems([])
    let reader_data = reader.current.result;
    setJsonObj(createObjFromData(reader_data))
    let dictionary_arr = createArrFromData(reader_data)
    // @ts-expect-error TS(2339): Property 'length' does not exist on type 'false | ... Remove this comment to see the full error message
    if (dictionary_arr.length > 0) {
      setUploading(true)
      // @ts-expect-error TS(2345): Argument of type 'false | {}[]' is not assignable ... Remove this comment to see the full error message
      setUploadItems(dictionary_arr)
      setTimeout(() => {
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        myRef.current.scrollIntoView({behavior: 'smooth'});
      }, 10)
    }
    else {
      reportErrorInFile()
    }
  }

  return (
    <div id="upload-to-d" className={"modal-content" + (uploading ? ' uploading' : '')} onClick={((e) => {e.stopPropagation()})}>
        <div id="upload_title">{"Upload a .tsv Dictionary"}</div>
        <span id="upload-to-d-close" className="close"  onClick={((e) => {closeModal()})}>&times;</span>
        <div id="upload-file-ui">
            <form id="file-upload-form" className="uploader">
                <input id="file-upload" type="file" name="fileUpload" accept=".tsv" 
        // @ts-expect-error TS(2322): Type 'MutableRefObject<undefined>' is not assignab... Remove this comment to see the full error message
        ref={fileUploadRef} 
        onChange={fileSelectHandler} />
                <label htmlFor="file-upload" id="file-drag" className="uploaderLabel" ref={fileDragRef} onDrop={fileSelectHandler} onDragOver={(e) => e.preventDefault()} >
                  <div id="start">
                      <i className="fa fa-download" aria-hidden="true"></i>
                      <div>Select a .tsv file or drag here</div>
                      <div id="nottsv" className={showNotTsv}>Please select a .tsv</div>
                      <span id="file-upload-btn" className="btn btn-primary">Select a file</span>
                  </div>
                  <div id="response" className={showResponse}>
                      <div id="messages"><strong>{message}</strong></div>
                  </div>
                </label>
                <div id="file-dictionary-container" ref={myRef} className={showFileDictContainer}>
                    <h2 id="file-dictionary-title">Uploaded Dictionary</h2>
                    <div id="file-dictionary">
                        <div id="file-dictionary-scroll">
                            {uploadItems.map((item, index) => {
                                return(<div key={index}>{item.original}<span></span><span>&rarr;</span><span>{item.target}</span></div>)
                            })}
                        </div>
                    </div>
                    <div id="upload-dictionary-options">
                        <div>
                            <input id="weakmergeoption" type="radio" className="dictionaryOptionControls" name="dictionary_options" value="weak_merge" defaultChecked/>
                            <label htmlFor="weakmergeoption" className="dictionaryOptionControlsLabel">
                                <h2>Weak Merge</h2>
                                <p>Readefine will only add Readefinitions that aren't already in the dictionary.</p>
                            </label>
                        </div>
                        <div>
                            <input id="strongmergeoption" type="radio" className="dictionaryOptionControls" name="dictionary_options" value="strong_merge"/>
                            <label htmlFor="strongmergeoption" className="dictionaryOptionControlsLabel">
                                <h2>Strong Merge</h2>
                                <p>Readefine will add Readefinitions that aren't already in the dictionary <b>and</b> replace Readefinitions that are already in the dictionary.</p>
                            </label>
                        </div>
                        <div>
                            <input id="overwriteoption" type="radio" className="dictionaryOptionControls" name="dictionary_options" value="overwrite"/>
                            <label htmlFor="overwriteoption" className="dictionaryOptionControlsLabel">
                                <h2>Overwrite</h2>
                                <p>Readefine will replace the entire dictionary, regardless of what's currently in the dictionary.</p>
                            </label>
                        </div>
                    </div>
                    <div id="upload-dictionary-button" className={showUploadDictBtn} ref={uploadBtnRef} onClick={submitJsonObj}>Update Dictionary</div>
                    <div id="upload-button-loader" className={showUploadBtnLoader}>
                        <div id="sendingloadertwo" className="loader"></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
  )
}

export default UploadToD