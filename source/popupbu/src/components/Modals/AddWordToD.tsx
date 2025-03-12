/*global chrome*/
import React, { useContext, useState } from 'react'
import { RDFNContext } from '../../RDFNContext';

function AddWordToD() {
  // @ts-expect-error TS(2339): Property 'closeModal' does not exist on type 'unkn... Remove this comment to see the full error message
  const { closeModal, dictionaryType, dictionaryName, setDictionaryContent, setDownloadLink, signUserOut, user, userTeam } = useContext(RDFNContext);
  
  const [original, setOriginal] = useState('');
  const [target, setTarget] = useState('');
  const [definition, setDefinition] = useState('');
  const [link, setLink] = useState('');

  const submitNewReadefinition = async (e: any) => {
    e.preventDefault()

    if (original === "" || target === "") {
      return;
    }

    let add = {
      [dictionaryType]: {
        readefinitions: {
          [original]: {
            target: target
          }
        }
      }
    };

    if (dictionaryType === 'team') {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      add[dictionaryType]['team'] = userTeam;
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      add[dictionaryType]['dictionary'] = dictionaryName;
    }
    else if (dictionaryType === 'addon') {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      add[dictionaryType]['addonName'] = dictionaryName;
    }

    if (definition !== '') {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      add[dictionaryType]['readefinitions'][original]['definition'] = definition;
    }
    if (link !== '') {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      add[dictionaryType]['readefinitions'][original]['link'] = link;
    }

    let requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'token': user,
            'version': '5'
        },
        body: JSON.stringify(add),
        redirect: 'follow'
    };
    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"

    // @ts-expect-error TS(2345): Argument of type '{ method: string; headers: { 'Co... Remove this comment to see the full error message
    let response = await fetch(url, requestOptions);
    if (response.status === 401) {
      await signUserOut();
      return;
    }

    let data = await response.json();
    data.sort((a: any, b: any) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))

    setDictionaryContent(data)
    let output = '';
    for (let i in data) {
      output = output + data[i]['original'] + "\t" + data[i]['target'] + "\t" + (data[i]['definition'] ? data[i]['definition'] : '') + "\t" + (data[i]['link'] ? data[i]['link'] : '') + "\n"
    }
    setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));

    chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" })
    closeModal()
  }

  return (
    <div id="addwordtod" className="modal-content" onClick={((e) => {e.stopPropagation()})}>
      <span id="addwordtod-close" className="close" onClick={((e) => {closeModal()})}>&times;</span>
      <div id="addwordtod-desc">Add a Readefinition</div>
      <form onSubmit={submitNewReadefinition} id="addwordtod-form">
        <input value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="Original*" id="addwordtod-original" className="addwordtod-form-inputs" required />
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target*" id="addwordtod-target" className="addwordtod-form-inputs" required />
        <textarea value={definition} onChange={(e) => setDefinition(e.target.value)} id="addwordtod-definition" className="addwordtod-form-inputs" placeholder="Definition"></textarea>
        <input value={link} onChange={(e) => setLink(e.target.value)} id="addwordtod-link" className="addwordtod-form-inputs" placeholder="Link"/>
        <input value="Add" id="addwordtod-form-add" type="submit"></input>
      </form>
    </div>
  )
}

export default AddWordToD