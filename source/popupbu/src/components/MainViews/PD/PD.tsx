// @ts-expect-error TS(6142): Module '../../Buttons/Download' was resolved to '/... Remove this comment to see the full error message
import Download from "../../Buttons/Download";
import "./PD.css";
import { useState, useEffect, useContext } from "react";
// @ts-expect-error TS(6142): Module '../../Dictionary_Row' was resolved to '/Us... Remove this comment to see the full error message
import DictionaryRow from "../../Dictionary_Row";
import { Virtuoso } from 'react-virtuoso';
import { CgPlayListAdd } from 'react-icons/cg';
// @ts-expect-error TS(6142): Module '../../../RDFNContext' was resolved to '/Us... Remove this comment to see the full error message
import { RDFNContext } from "../../../RDFNContext";
import { useSearchParams } from "react-router-dom";

function PD() {
  // @ts-expect-error TS(2339): Property 'dictLoading' does not exist on type 'unk... Remove this comment to see the full error message
  const { dictLoading, dictionaryContent, setDictionaryType, setEditable, setModalName, setShowModal, setWordObj, user } = useContext(RDFNContext)

  const [q, setQ] = useState(""),
    [searchParam] = useState(["original"]),
    [showClearSearch, setShowClearSearch] = useState('hidden');  

  useEffect(() => {
    setDictionaryType("user");
    setEditable(true);
  }, []);
  
  const search = (items: any) => {
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
    editReadefinition = async (obj: any) => {
      setWordObj(obj)
      setModalName("edit")
      setShowModal(true);
    },
    addToPDContainer = (e: any) => {
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
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div id="personal_dictionary" className="checkedbyreadefine">
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="row">
          {/* toolbar (e.g. download, upload, add to dictionary btns) */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="side" id="pd_add_container">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Download doc_title='personal_dictionary.tsv'/>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="pd_add_btn_container">
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div id="upload-container" className="addpd upload-icon custom-file-upload" onClick={((e) => {
                uploadToPDContainer();
              })}>&#xe2c6;</div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div id="add-to-pd-container" className="addpd" onClick={((e) => {
                // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
                addToPDContainer();
              })}>&#xe03b;</div>
            </div>
          </div>

          {/* main dictionary viewer */}
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <div className="main" id="pd_dictionary_container">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="readefine_pd" className={"dictionary_container " + (dictLoading ? 'dict-loading' : '')}>
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
              <div id="clear-search" className={showClearSearch} onClick={((e) => {
                clearSearch();
              })}>&#xe5cd;</div>
            </div>
              // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <div id="pd_readefinitions_container">
                {
                  dictionaryContent.length > 0 &&
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <Virtuoso
                    data={search(dictionaryContent)}
                    increaseViewportBy={200}
                    itemContent={(index, item) => (
                      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                      <DictionaryRow className={index % 2 === 0 ? "RowEven" : "RowOdd"} key={item.index} index={item.index} target={item.target} original={item.original} definition={item['definition'] ? item['definition'] : ''} link={item['link'] ? item['link'] : ''} editReadefinition={editReadefinition}/>
                    )}
                  />
                }
                {
                  dictionaryContent.length === 0 &&
                  // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <div className="emptyrdfndict" onClick={((e) => addToPDContainer(e))}>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <CgPlayListAdd className="emptyrdfndicticon"/>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div className="emptyrdfndicttxt">This dictionary has no Readefinitions. Click here to add one!</div>
                  </div>
                }
              </div>
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="dictionary_loader" className={dictLoading ? 'dict-loading' : ''}><div className="loading"></div></div>
          </div>
        </div>
      </div>
    </>
  );
}
export default PD;