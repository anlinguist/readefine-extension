/*global chrome*/
import Download from "../../Buttons/Download";
import "./CD.css";
import { useState, useEffect, useContext } from "react";
import DictionaryRow from "../../Dictionary_Row";
import { Virtuoso } from 'react-virtuoso';
import { CgPlayListAdd } from 'react-icons/cg';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { RDFNContext } from "../../../RDFNContext";

function CD() {
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
  editReadefinition = async(obj) => {
    setWordObj(obj)
    setModalName("edit")
    setShowModal(true);
  },
  search = (items) => {
    let a = items.filter((item, index) => {
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
    document.getElementById("search-form").value = "";
    setQ("");
    setShowClearSearch('hidden');
    return;
  },
  addToCDContainer = (e) => {
    setModalName("add");
    setShowModal(true);
  },
  uploadToCDContainer = (e) => {
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
      signUserOut();
      return;
    }

    let data = await response.json();
    let readefineCommunityDictionary = data['readefinitions']
    if (readefineCommunityDictionary) {
      readefineCommunityDictionary.sort((a, b) => a.original.localeCompare(b.original, undefined, {sensitivity: 'base'}))
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
      get: (searchParams, prop) => searchParams.get(prop),
    });
    if (params.upload === 'communityDictionary') {
      setModalName("upload")
      setShowModal(true);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70) || (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70) || (e.metaKey && e.keyCode === 70))) {
      e.preventDefault();
      document.querySelector('#search-form').focus()
    }
  })
}, [user, domains, selectedCD]);

  return (
    <>
      <div id="cd_view_container" className={'dictselected'}>
        <div className={"side"} id="cd_add_container">
          <div id="lefttopbar">
            <div onClick={() => backtocdlist()} id="back_button" className={'dictselected'}>&#xe5c4;</div>
            <Download permissionLevels={editable ? 'editable' : 'noneditable'} link={downloadLink} doc_title={encodeURI(selectedCD) + '_readefine_CD.tsv'}/>
          </div>
          <div id="cd_add_btn_container" className={editable ? 'editable' : 'noneditable'} >
            <div id="upload-container" className="addcd upload-icon custom-file-upload" onClick={((e) => uploadToCDContainer(e))}>&#xe2c6;</div>
            <div id="add-to-cd-container" className="addcd" onClick={((e) => addToCDContainer(e))}>&#xe03b;</div>
          </div>
        </div>
        {/* main dictionary viewer */}
        <div className="main" id="cd_dictionary_container">
          <div id="readefine_cd" className={"dictionary_container" + (dictLoading ? ' dict-loading' : '')}>
          <div className="search-wrapper">
            <textarea
                type="search"
                name="search-form"
                id="search-form"
                className="search-input"
                placeholder="Search"
                autoComplete="off"
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
            <div id="clear-search" className={showClearSearch} onClick={((e) => {clearSearch()})}>&#xe5cd;</div>
          </div>
          <div id="cd_readefinitions_container">
            {
              dictionaryContent.length > 0 &&
              <Virtuoso
                data={search(dictionaryContent)}
                increaseViewportBy={200}
                itemContent={(index, item) => {
                  return (
                    <DictionaryRow className={index % 2 === 0 ? "RowEven" : "RowOdd"} key={item.index} index={item.index} target={item.target} original={item.original} dict={selectedCD} definition={item['definition'] ? item['definition'] : ''} link={item['link'] ? item['link'] : ''} editReadefinition={editReadefinition}/>
                  )
                }}
              />
            }
            {
              dictionaryContent.length === 0 &&
              editable &&
              <div className="emptyrdfndict" onClick={((e) => addToCDContainer(e))}>
                <CgPlayListAdd className="emptyrdfndicticon"/>
                <div className="emptyrdfndicttxt">This dictionary has no Readefinitions. Click here to add one!</div>
              </div>
            }
            {
              dictionaryContent.length === 0 &&
              !editable &&
              <div className="emptyrdfndict noneditable">
                <CgPlayListAdd className="emptyrdfndicticon"/>
                <div className="emptyrdfndicttxt">This dictionary has no Readefinitions.</div>
              </div>
            }
          </div>
          </div>
          <div id="dictionary_loader" className={dictLoading ? 'dict-loading' : ''}><div className="loading"></div></div>
        </div>
      </div>
    </>
  );
}
export default CD;