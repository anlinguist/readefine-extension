import React, { useContext } from 'react'
import { RDFNContext } from '../../../RDFNContext';

function AIStyleCard({ styleName, setIsConfirmOpen, setCardToRemove }) {
    const { setModalName, setShowModal, setChosenAIStyle } = useContext(RDFNContext);
    const editAIStyle = async (styleName) => {
        setChosenAIStyle(styleName);
        setModalName("manageAIStyle");
        setShowModal(true);
    }
    return (
        <div className="aistylecard" onClick={() => editAIStyle(styleName)}>
            <div className="aistylecard-content">
                <p>{styleName}</p>
            </div>
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