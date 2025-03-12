/*global chrome*/
// @ts-expect-error TS(6142): Module '../../Buttons/Download' was resolved to '/... Remove this comment to see the full error message
import Download from "../../Buttons/Download";
import "./CD.css";
import { useState, useEffect, useContext } from "react";
// @ts-expect-error TS(6142): Module '../../Dictionary_Row' was resolved to '/Us... Remove this comment to see the full error message
import DictionaryRow from "../../Dictionary_Row";
import { Virtuoso } from 'react-virtuoso';
import { CgPlayListAdd } from 'react-icons/cg';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// @ts-expect-error TS(6142): Module '../../../RDFNContext' was resolved to '/Us... Remove this comment to see the full error message
import { RDFNContext } from "../../../RDFNContext";

function CD() {
  // @ts-expect-error TS(2339): Property 'dictionaryContent' does not exist on typ... Remove this comment to see the full error message
  const { dictionaryContent, dictLoading, domains, editable, setDictionaryContent, setDictionaryName, setDictionaryType, setDictLoading, setEditable, setModalName, setShowModal, setWordObj, signUserOut, user } = useContext(RDFNContext);
  const navigate = useNavigate();
  const { selectedCD } = useParams(),
  [downloadLink, setDownloadLink] = useState(''),
  [q, setQ] = useState(""),
  [searchParam] = useState(["original"]),
  [showClearSearch, setShowClearSearch] = useState('hidden');

const backtocdlist = () => {
    navigate(`/community-dictionaries`)
  },
  editReadefinition = async (obj: any) => {
    setWordObj(obj)
    setModalName("edit")
    setShowModal(true);
  },
  search = (items: any) => {
    let a = items.filter((item: any, index: any) => {
      return searchParam.some(function(newItem) {
        if (item[newItem].toLocaleLowerCase().indexOf(q.toLocaleLowerCase()) > -1) {
          items[index]['index'] = index
          return (items[index])
        }
        return false;
      });
    });
    return a
  },
  clearSearch = () => {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    document.getElementById("search-form").value = "";
    setQ("");
    setShowClearSearch('hidden');
    return;
  },
  addToCDContainer = (e: any) => {
    setModalName("add");
    setShowModal(true);
  },
  uploadToCDContainer = (e: any) => {
    setModalName("upload");
    setShowModal(true);
  };

useEffect(() => {
  const fetch_dictionary = async() => {
    if (selectedCD === '' || selectedCD === undefined) {
      return
    }
    setDictionaryType("addon");
    setDictionaryName(selectedCD);

    setEditable(false)
    setDictLoading(true)
    setDictionaryContent([])

    let postInfo = {
      method: 'GET',
      headers: {
        "dictionary": selectedCD,
        "token": user,
        'version': '5'
      }
    }

    let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/readefinition"
    const response = await fetch(url, postInfo);
    if (response.status === 401) {
      await signUserOut();
      return;
    }

    let data = await response.json();
    let readefineCommunityDictionary = data['readefinitions']
    if (readefineCommunityDictionary) {
      readefineCommunityDictionary.sort((a: any, b: any) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
      setDictionaryContent(readefineCommunityDictionary)
      let output = '';
      for (let i in readefineCommunityDictionary) {
        output = output + readefineCommunityDictionary[i]['original'] + "\t" + readefineCommunityDictionary[i]['target'] + "\t" + (readefineCommunityDictionary[i]['definition'] ? readefineCommunityDictionary[i]['definition'] : '') + "\t" + (readefineCommunityDictionary[i]['link'] ? readefineCommunityDictionary[i]['link'] : '') + "\n"
      }
      setDownloadLink("data:text/tab-separated-values," + encodeURIComponent(output));
      setDictLoading(false)
    }
    
    if (data['admin']) {
      setEditable(true)
    }
  }

  if (user && (domains['UDomains'] || domains['NUDomains'])) {
    fetch_dictionary().catch(console.error)

    const params = new Proxy(new URLSearchParams(window.location.search), {
      // @ts-expect-error TS(2345): Argument of type 'string | symbol' is not assignab... Remove this comment to see the full error message
      get: (searchParams, prop) => searchParams.get(prop),
    });
    // @ts-expect-error TS(2339): Property 'upload' does not exist on type 'URLSearc... Remove this comment to see the full error message
    if (params.upload === 'communityDictionary') {
      setModalName("upload")
      setShowModal(true);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70) || (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70) || (e.metaKey && e.keyCode === 70))) {
      e.preventDefault();
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      document.querySelector('#search-form').focus()
    }
  })
}, [user, domains, selectedCD]);

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div id="cd_view_container" className={'dictselected'}>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className={"side"} id="cd_add_container">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div id="lefttopbar">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div onClick={() => backtocdlist()} id="back_button" className={'dictselected'}>&#xe5c4;</div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Download permissionLevels={editable ? 'editable' : 'noneditable'} link={downloadLink} doc_title={encodeURI(selectedCD) + '_readefine_CD.tsv'}/>
          </div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div id="cd_add_btn_container" className={editable ? 'editable' : 'noneditable'} >
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="upload-container" className="addcd upload-icon custom-file-upload" onClick={((e) => uploadToCDContainer(e))}>&#xe2c6;</div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="add-to-cd-container" className="addcd" onClick={((e) => addToCDContainer(e))}>&#xe03b;</div>
          </div>
        </div>
        {/* main dictionary viewer */}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="main" id="cd_dictionary_container">
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div id="readefine_cd" className={"dictionary_container" + (dictLoading ? ' dict-loading' : '')}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="search-wrapper">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <textarea
                type="search"
                name="search-form"
                id="search-form"
                className="search-input"
                placeholder="Search"
                autoComplete="off"
                // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'number'.
                rows={"1"}
                value={q}
                onChange={function(e) {
                  if (e.target.value === "") {
                    setShowClearSearch('hidden')
                  }
                  else {
                    setShowClearSearch('')
                  }
                  setQ(e.target.value)
                }}
            />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="clear-search" className={showClearSearch} onClick={((e) => {clearSearch()})}>&#xe5cd;</div>
          </div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div id="cd_readefinitions_container">
            {
              dictionaryContent.length > 0 &&
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <Virtuoso
                data={search(dictionaryContent)}
                increaseViewportBy={200}
                itemContent={(index, item) => {
                  return (
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <DictionaryRow className={index % 2 === 0 ? "RowEven" : "RowOdd"} key={item.index} index={item.index} target={item.target} original={item.original} dict={selectedCD} definition={item['definition'] ? item['definition'] : ''} link={item['link'] ? item['link'] : ''} editReadefinition={editReadefinition}/>
                  )
                }}
              />
            }
            {
              dictionaryContent.length === 0 &&
              editable &&
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="emptyrdfndict" onClick={((e) => addToCDContainer(e))}>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <CgPlayListAdd className="emptyrdfndicticon"/>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className="emptyrdfndicttxt">This dictionary has no Readefinitions. Click here to add one!</div>
              </div>
            }
            {
              dictionaryContent.length === 0 &&
              !editable &&
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div className="emptyrdfndict noneditable">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <CgPlayListAdd className="emptyrdfndicticon"/>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className="emptyrdfndicttxt">This dictionary has no Readefinitions.</div>
              </div>
            }
          </div>
          </div>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div id="dictionary_loader" className={dictLoading ? 'dict-loading' : ''}><div className="loading"></div></div>
        </div>
      </div>
    </>
  );
}
export default CD;