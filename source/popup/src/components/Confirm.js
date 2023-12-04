import React from 'react';

const Confirm = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-message">{message}</div>
                <div className="confirm-buttons">
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                    <button className="confirm-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default Confirm;