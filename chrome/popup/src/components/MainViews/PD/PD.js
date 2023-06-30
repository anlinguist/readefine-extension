import Download from "../../Buttons/Download";
import "./PD.css";
import { useState, useEffect, useContext } from "react";
import DictionaryRow from "../../Dictionary_Row";
import { Virtuoso } from 'react-virtuoso';
import { CgPlayListAdd } from 'react-icons/cg';
import { RDFNContext } from "../../../RDFNContext";
import { useSearchParams } from "react-router-dom";

function PD({fetch_data}) {
  const { dictLoading, downloadLink, dictionaryContent, setDictionaryType, setEditable, setModalName, setShowModal, setWordObj, user } = useContext(RDFNContext)

  const [q, setQ] = useState(""),
    [searchParam] = useState(["original"]),
    [showClearSearch, setShowClearSearch] = useState('hidden');  

  useEffect(() => {
    fetch_data();
  }, [user]);

  useEffect(() => {
    setDictionaryType("user");
    setEditable(true);
  }, []);
  
  const search = (items) => {
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
    editReadefinition = async(obj) => {
      setWordObj(obj)
      setModalName("edit")
      setShowModal(true);
    },
    addToPDContainer = (e) => {
      setModalName("add")
      setShowModal(true);
    },
    uploadToPDContainer = () => {
      setModalName("upload")
      setShowModal(true);
    },
    clearSearch = () => {
      setQ("");
      setShowClearSearch('hidden');
    };

  return (
    <>
      <div id="personal_dictionary" className="checkedbyreadefine">
        <div className="row">
          {/* toolbar (e.g. download, upload, add to dictionary btns) */}
          <div className="side" id="pd_add_container">
            <Download link={downloadLink} doc_title='personal_dictionary.tsv'/>
            <div id="pd_add_btn_container">
              <div id="upload-container" className="addpd upload-icon custom-file-upload" onClick={((e) => {
                uploadToPDContainer();
              })}>&#xe2c6;</div>
              <div id="add-to-pd-container" className="addpd" onClick={((e) => {
                addToPDContainer();
              })}>&#xe03b;</div>
            </div>
          </div>

          {/* main dictionary viewer */}
          <div className="main" id="pd_dictionary_container">
            <div id="readefine_pd" className={"dictionary_container " + (dictLoading ? 'dict-loading' : '')}>
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
              <div id="clear-search" className={showClearSearch} onClick={((e) => {
                clearSearch();
              })}>&#xe5cd;</div>
            </div>
              <div id="pd_readefinitions_container">
                {
                  dictionaryContent.length > 0 &&
                  <Virtuoso
                    data={search(dictionaryContent)}
                    increaseViewportBy={200}
                    itemContent={(index, item) => (
                      <DictionaryRow className={index % 2 === 0 ? "RowEven" : "RowOdd"} fetch_data={fetch_data} key={item.index} index={item.index} target={item.target} original={item.original} definition={item['definition'] ? item['definition'] : ''} link={item['link'] ? item['link'] : ''} editReadefinition={editReadefinition}/>
                    )}
                  />
                }
                {
                  dictionaryContent.length === 0 &&
                  <div className="emptyrdfndict" onClick={((e) => addToPDContainer(e))}>
                    <CgPlayListAdd className="emptyrdfndicticon"/>
                    <div className="emptyrdfndicttxt">This dictionary has no Readefinitions. Click here to add one!</div>
                  </div>
                }
              </div>
            </div>
            <div id="dictionary_loader" className={dictLoading ? 'dict-loading' : ''}><div className="loading"></div></div>
          </div>
        </div>
      </div>
    </>
  );
}
export default PD;