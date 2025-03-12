import React, { useContext } from 'react';

function AITargetCard({
    targetName,
    setIsConfirmOpen,
    setCardToRemove
}: any) {
    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="aistylecard aitargetcard">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="aistylecard-content">
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <p>{targetName}</p>
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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