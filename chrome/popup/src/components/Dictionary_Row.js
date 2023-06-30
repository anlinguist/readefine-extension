import React, { useContext, useState } from 'react'
import { RDFNContext } from '../RDFNContext';

function DictionaryRow(props) {
  const { dictionaryName, dictionaryType, editable, setDictionaryContent, setDownloadLink, user, userTeam } = useContext(RDFNContext);
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
          'uid': user
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
        postObj['addon']['addonName'] = dictionaryName;
        requestOptions['headers']['dictionary'] = dictionaryName;
      }
      else if (dictionaryType === "team") {
        postObj['team']['team'] = userTeam;
        postObj['team']['dictionary'] = dictionaryName;
        requestOptions['headers']['dictionary'] = dictionaryName;
      }

      requestOptions['body'] = JSON.stringify(postObj);

      let url = "https://readefine-node-server-57discg22a-uc.a.run.app/readefinition"

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      if (!data['error']) {
          setSaving(false)
          data.sort((a, b) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
          setDictionaryContent(data)
          let output = '';
          for (let i in data) {
            output = output + data[i]['original'] + "\t" + data[i]['target'] + "\t" + (data[i]['definition'] ? data[i]['definition'] : '') + "\t" + (data[i]['link'] ? data[i]['link'] : '') + "\n"
          }
          setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));
      }
    }

  return (
    <div style={{
        paddingTop: 10,
        paddingBottom: 10
      }} className={"dictionaryitem " + props.className} id={"dictionaryitem" + props.index}>
      <div className="dictionarycontainer" id={"dictionarycontainer" + props.index}>
        <span id={"name" + props.index} className={"dictionaryname"} suppressContentEditableWarning="true">
          {props.original}
        </span>
        <span>
          &rarr;
        </span>
        <span id={"replacement" + props.index} suppressContentEditableWarning="true">
          {props.target}
        </span>
      </div>
      {
        !saving &&
        <div className={"editcontainer " + " " + (editable ? 'editable' : 'noneditable')}>
          <div onClick={editItem} className="editdictionaryitem" id={"editdictionaryitem"+props.index}>
            &#xe254;
          </div>
          <div onClick={deleteItem} className="deletedictionaryitem" id={"deletedictionaryitem" + props.index}>
            &#xe5cd;
          </div>
        </div>
      }
      <div className={'saving_loader' + (saving ? ' saving' : '')}></div>
    </div>
  )
}

export default DictionaryRow