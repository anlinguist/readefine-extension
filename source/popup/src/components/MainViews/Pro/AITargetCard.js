import React, { useContext } from 'react';

function AITargetCard({ targetName, setIsConfirmOpen, setCardToRemove }) {
    return (
        <div className="aistylecard aitargetcard">
            <div className="aistylecard-content">
                <p>{targetName}</p>
            </div>
            <div className="aistylecard-remove" onClick={((e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setCardToRemove(targetName);
            })}
            >&times;</div>
        </div>
    );
}

export default AITargetCard