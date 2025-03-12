import React, { useContext } from 'react'
// @ts-expect-error TS(6142): Module '../../../RDFNContext' was resolved to '/Us... Remove this comment to see the full error message
import { RDFNContext } from '../../../RDFNContext';

function AIStyleCard({
    styleName,
    setIsConfirmOpen,
    setCardToRemove
}: any) {
    // @ts-expect-error TS(2339): Property 'setModalName' does not exist on type 'un... Remove this comment to see the full error message
    const { setModalName, setShowModal, setChosenAIStyle } = useContext(RDFNContext);
    const editAIStyle = async (styleName: any) => {
        setChosenAIStyle(styleName);
        setModalName("manageAIStyle");
        setShowModal(true);
    }
    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="aistylecard" onClick={() => editAIStyle(styleName)}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="aistylecard-content">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <p>{styleName}</p>
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="aistylecard-remove" onClick={((e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setCardToRemove(styleName);                
            })}
            >&times;</div>
        </div>
    );
}

export default AIStyleCard