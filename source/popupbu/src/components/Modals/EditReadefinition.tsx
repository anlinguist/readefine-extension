/*global chrome*/
import React, { useContext, useState } from 'react'
import { RDFNContext } from '../../RDFNContext';

function EditReadefinition() {
  // @ts-expect-error TS(2339): Property 'closeModal' does not exist on type 'unkn... Remove this comment to see the full error message
  const { closeModal, dictionaryName, dictionaryType, setDictionaryContent, setDownloadLink, signUserOut, user, userTeam, wordObj } = useContext(RDFNContext)
  const [original, setOriginal] = useState(wordObj?.original || '');
  const [target, setTarget] = useState(wordObj?.target || '');
  const [definition, setDefinition] = useState(wordObj?.definition || '');
  const [link, setLink] = useState(wordObj?.link || '');

  const submitNewReadefinition = async (e: any) => {
    e.preventDefault()
    let newOriginal = original.trim();
    let newTarget = target.trim();
    let newDefinition = definition.trim();
    let newLink = link.trim();

    if (newOriginal === "" || newTarget === "") {
      return
    }
    else {
      let originalOriginal = wordObj && wordObj['original'] ? wordObj['original'] : ''
      let originalTarget = wordObj && wordObj['target'] ? wordObj['target'] : ''
      let originalDefinition = wordObj && wordObj['definition'] ? wordObj['definition'] : ''
      let originalLink = wordObj && wordObj['link'] ? wordObj['link'] : ''

      if (newOriginal === originalOriginal && newTarget === originalTarget && newDefinition === originalDefinition && newLink === originalLink) {
        return
      }
      
      if (newOriginal !== originalOriginal) {
        let deleteBody = {
          [dictionaryType]: {
            readefinitions: {
              [originalOriginal]: {
                target: "placeholder"
              }
            }
          }
        }
        if (dictionaryType === "addon") {
          // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
          deleteBody['addon']['addonName'] = dictionaryName
        }
        else if (dictionaryType === "team") {
          // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
          deleteBody['team']['team'] = userTeam
          // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
          deleteBody['team']['dictionary'] = dictionaryName
        }
  
        var deleteRequestOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'token': user,
            'version': '5'
          },
          body: JSON.stringify(deleteBody),
          redirect: 'follow'
        };

        if (dictionaryType !== 'personal') {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          deleteRequestOptions['headers']['dictionary'] = dictionaryName
        }
        let deleteUrl = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"
  
        // @ts-expect-error TS(2345): Argument of type '{ method: string; headers: { 'Co... Remove this comment to see the full error message
        const response = await fetch(deleteUrl, deleteRequestOptions);
        if (response.status === 401) {
          await signUserOut();
          return;
        }
  
        await response.json();
      }

      let addBody = {
        [dictionaryType]: {
          readefinitions: {
            [newOriginal]: {
              target: newTarget
            }
          }
        }
      }
      if (newDefinition !== '') {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        addBody[dictionaryType]['readefinitions'][newOriginal]['definition'] = newDefinition
      }
      else {
        if (originalDefinition !== '') {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          addBody[dictionaryType]['readefinitions'][newOriginal]['definition'] = newDefinition
        }
      }
      if (newLink !== '') {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        addBody[dictionaryType]['readefinitions'][newOriginal]['link'] = newLink
      }
      else {
        if (originalLink !== '') {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          addBody[dictionaryType]['readefinitions'][newOriginal]['link'] = newLink
        }
      }

      if (dictionaryType === 'addon') {
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        addBody['addon']['addonName'] = dictionaryName
      }
      else if (dictionaryType === 'team') {
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        addBody['team']['team'] = userTeam
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        addBody['team']['dictionary'] = dictionaryName
      }

      let addRequestOptions = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'token': user,
            'version': '5'
          },
          body: JSON.stringify(addBody),
          redirect: 'follow'
      };
      let addUrl = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"
  
      // @ts-expect-error TS(2345): Argument of type '{ method: string; headers: { 'Co... Remove this comment to see the full error message
      const add_response = await fetch(addUrl, addRequestOptions);
      if (add_response.status === 401) {
        await signUserOut();
        return;
      }

      const add_data = await add_response.json();
      add_data.sort((a: any, b: any) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
      setDictionaryContent(add_data)
      let output = '';
      for (let i in add_data) {
        output = output + add_data[i]['original'] + "\t" + add_data[i]['target'] + "\t" + (add_data[i]['definition'] ? add_data[i]['definition'] : '') + "\t" + (add_data[i]['link'] ? add_data[i]['link'] : '') + "\n"
      }
      setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));

      chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" })
      closeModal()
    }
  }

  return (
    <div id="addwordtod" className="modal-content" onClick={((e) => {e.stopPropagation()})}>
      <span id="addwordtod-close" className="close"  onClick={((e) => {closeModal()})}>&times;</span>
      <div id="addwordtod-desc">Edit this Readefinition</div>
      <form onSubmit={submitNewReadefinition} id="addwordtod-form">
        <input placeholder="Original*" id="addwordtod-original" className="addwordtod-form-inputs" required value={original} onChange={(e) => setOriginal(e.target.value)} />
        <input placeholder="Target*" id="addwordtod-target" className="addwordtod-form-inputs" required value={target} onChange={(e) => setTarget(e.target.value)} />
        <textarea id="addwordtod-definition" className="addwordtod-form-inputs" placeholder="Definition" value={definition} onChange={(e) => setDefinition(e.target.value)}></textarea>
        <input id="addwordtod-link" className="addwordtod-form-inputs" placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)}/>
        <input value="Update" id="addwordtod-form-add" type="submit"></input>
      </form>
    </div>
  )
}

export default EditReadefinition