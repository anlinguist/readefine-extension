import { useContext, useEffect } from "react";
// @ts-expect-error TS(6142): Module './AddWordToD' was resolved to '/Users/andr... Remove this comment to see the full error message
import AddWordToD from "./AddWordToD";
// @ts-expect-error TS(6142): Module './UploadToD' was resolved to '/Users/andre... Remove this comment to see the full error message
import UploadToD from "./UploadToD";
// @ts-expect-error TS(6142): Module './EditReadefinition' was resolved to '/Use... Remove this comment to see the full error message
import EditReadefinition from "./EditReadefinition";
// @ts-expect-error TS(6142): Module './UserGreeting' was resolved to '/Users/an... Remove this comment to see the full error message
import UserGreeting from "./UserGreeting";
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from "../../RDFNContext";
import { useSearchParams } from "react-router-dom";
// @ts-expect-error TS(6142): Module './ManageReadefineAIStyle' was resolved to ... Remove this comment to see the full error message
import ManageReadefineAIStyle from "./ManageReadefineAIStyle";
// @ts-expect-error TS(6142): Module './MarketingModal' was resolved to '/Users/... Remove this comment to see the full error message
import MarketingModal from "./MarketingModal";

function Modals() {
    // @ts-expect-error TS(2339): Property 'closeModal' does not exist on type 'unkn... Remove this comment to see the full error message
    const { closeModal, modalName, setModalName, setShowModal, setWordObj, showModal, wordObj } = useContext(RDFNContext);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (showModal || showModal === undefined) {
            if (modalName) {
                if (modalName === "edit") {
                    setSearchParams({ modal: modalName, wordObj: JSON.stringify({ ...wordObj }) });
                } else {
                    setSearchParams({ modal: modalName });
                }
            }
        } else {
            searchParams.delete('modal');
            searchParams.delete('wordObj');
            setSearchParams(searchParams);
        }
    }, [setSearchParams, modalName]);

    useEffect(() => {
        const modalParam = searchParams.get('modal');
        if (modalParam) {
            setShowModal(true);
            setModalName(modalParam);
        }
        const wordObjParam = searchParams.get('wordObj');
        if (wordObjParam) {
            setWordObj(JSON.parse(wordObjParam));
        }
        const contextParam = searchParams.get('context');
        if (contextParam && contextParam === "contentScript") {
            console.log("contextParam is contentScript");
            // update html class to make the content of the iframe window smaller
            if (!document.documentElement.classList.contains('contextContentScript')) {
                document.documentElement.classList.add('contextContentScript');
            }
        }
    }, [searchParams]);

    let showEl;
    switch (modalName) {
        case "settings":
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <UserGreeting />;
            break;
        case "add":
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <AddWordToD />;
            break;
        case "upload":
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <UploadToD />;
            break;
        case "edit":
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <EditReadefinition />;
            break;
        case "manageAIStyle":
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <ManageReadefineAIStyle />;
            break;
        case 'marketing':
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            showEl = <MarketingModal />;
            break;
        default:
            showEl = null;
    }
    
    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <>
        {
            showModal &&
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="rdfn-modal-container" onClick={((e) => {
                closeModal();
            })}>
                {showEl}
            </div>
        }
        </>
    );
}

export default Modals;