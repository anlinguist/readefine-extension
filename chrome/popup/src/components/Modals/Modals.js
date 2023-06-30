import { useContext, useEffect } from "react";
import AddWordToD from "./AddWordToD";
import UploadToD from "./UploadToD";
import EditReadefinition from "./EditReadefinition";
import UserGreeting from "./UserGreeting";
import { RDFNContext } from "../../RDFNContext";
import { useSearchParams } from "react-router-dom";

function Modals() {
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
            document.documentElement.className = 'contextContentScript';
        }
    }, [searchParams]);

    let showEl;
    switch (modalName) {
        case "settings":
            showEl = <UserGreeting />;
            break;
        case "add":
            showEl = <AddWordToD />;
            break;
        case "upload":
            showEl = <UploadToD />;
            break;
        case "edit":
            showEl = <EditReadefinition />;
            break;
        default:
            showEl = null;
    }
    
    return (
        <>
        {
            showModal &&
            <div id="rdfn-modal-container" onClick={((e) => closeModal())}>
                {showEl}
            </div>
        }
        </>
    );
}

export default Modals;