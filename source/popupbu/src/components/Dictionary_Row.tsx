import React, { useContext, useState } from 'react'
// @ts-expect-error TS(6142): Module '../RDFNContext' was resolved to '/Users/an... Remove this comment to see the full error message
import { RDFNContext } from '../RDFNContext';

function DictionaryRow(props: any) {
  // @ts-expect-error TS(2339): Property 'dictionaryName' does not exist on type '... Remove this comment to see the full error message
  const { dictionaryName, dictionaryType, editable, setDictionaryContent, setDownloadLink, signUserOut, user, userTeam } = useContext(RDFNContext);
  const [saving, setSaving] = useState(false);

  const editItem = () => {
      let obj = {
        original: props.original,
        target: props.target,
        definition: props.definition,
        link: props.link
      }
      props.editReadefinition(obj)
    },
    deleteItem = async() => {
      setSaving(true);

      let requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'token': user,
          'version': '5'
        },
        redirect: 'follow'
      };

      let postObj = {
        [dictionaryType]: {
          readefinitions: {
            [props.original]: {
              "target": "placeholder"
            }
          }
        }
      }
      
      if (dictionaryType === "addon") {
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        postObj['addon']['addonName'] = dictionaryName;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        requestOptions['headers']['dictionary'] = dictionaryName;
      }
      else if (dictionaryType === "team") {
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        postObj['team']['team'] = userTeam;
        // @ts-expect-error TS(7015): Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        postObj['team']['dictionary'] = dictionaryName;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        requestOptions['headers']['dictionary'] = dictionaryName;
      }

      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      requestOptions['body'] = JSON.stringify(postObj);

      let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"

      // @ts-expect-error TS(2345): Argument of type '{ method: string; headers: { 'Co... Remove this comment to see the full error message
      const response = await fetch(url, requestOptions);
      if (response.status === 401) {
        await signUserOut();
        return;
      }

      const data = await response.json();
      if (!data['error']) {
          setSaving(false)
          data.sort((a: any, b: any) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
          setDictionaryContent(data)
          let output = '';
          for (let i in data) {
            output = output + data[i]['original'] + "\t" + data[i]['target'] + "\t" + (data[i]['definition'] ? data[i]['definition'] : '') + "\t" + (data[i]['link'] ? data[i]['link'] : '') + "\n"
          }
          setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));
      }
    }

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div style={{
        paddingTop: 10,
        paddingBottom: 10
      }} className={"dictionaryitem " + props.className} id={"dictionaryitem" + props.index}>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className="dictionarycontainer" id={"dictionarycontainer" + props.index}>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <span id={"name" + props.index} className={"dictionaryname"} suppressContentEditableWarning="true">
          {props.original}
        </span>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <span>
          &rarr;
        </span>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <span id={"replacement" + props.index} suppressContentEditableWarning="true">
          {props.target}
        </span>
      </div>
      {
        !saving &&
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className={"editcontainer" + (editable ? ' editable' : ' noneditable')}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div onClick={editItem} className="editdictionaryitem" id={"editdictionaryitem"+props.index}>
            &#xe254;
          </div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div onClick={deleteItem} className="deletedictionaryitem" id={"deletedictionaryitem" + props.index}>
            &#xe5cd;
          </div>
        </div>
      }
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className={'saving_loader' + (saving ? ' saving' : '')}></div>
    </div>
  )
}

export default DictionaryRow