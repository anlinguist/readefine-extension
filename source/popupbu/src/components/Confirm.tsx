import React from 'react';

const Confirm = ({
    isOpen,
    message,
    onConfirm,
    onCancel
}: any) => {
    if (!isOpen) return null;

    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div className="confirm-overlay" onClick={onCancel}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className="confirm-message">{message}</div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className="confirm-buttons">
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <button className="confirm-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default Confirm;