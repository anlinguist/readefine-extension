import React, { useContext, useEffect, useState } from 'react'
import MarketingOptions from './MarketingOptions';
import Unsubscribe from './Unsubscribe';
import Subscribe from './Subscribe';
import { RDFNContext } from '../../RDFNContext';
import MarketingSettingsToggle from './MarketingSettingsToggle';

function MarketingSettings() {
    const { user, showToastMessage, setShowModal, setModalName, readefineMarketingEmails, readefineMarketingEmailsSet, setReadefineMarketingEmailsSet, setReadefineMarketingEmails } = useContext(RDFNContext);
    const [view, setView] = useState(null);
    const handleUserResponse = async (optIn) => {
        const endpoint = optIn
            ? 'https://readefine-node-server-57discg22a-uc.a.run.app/v2/userOptedIntoReadefineMarketing'
            : 'https://readefine-node-server-57discg22a-uc.a.run.app/v2/userOptedOutOfReadefineMarketing';

        let resp = await fetch(endpoint, { method: 'GET', headers: { 'token': user } });

        if (resp.ok) {
            let msg = optIn ? "You're all set!" : "Ok - we won't send you emails."
            showToastMessage(msg, "success")
            setReadefineMarketingEmailsSet(true)
            setReadefineMarketingEmails(optIn)
        } else {
            showToastMessage("Something went wrong. Please try again.", "error")
        }
        setShowModal(false)
        setModalName("")
    };

    useEffect(() => {
        if (readefineMarketingEmailsSet) {
            setView(<MarketingSettingsToggle handleUserResponse={handleUserResponse} />)
        } else {
            setView(<MarketingOptions handleUserResponse={handleUserResponse} />)
        }
    }, [readefineMarketingEmails])
    return (
        <>
            {
                view &&
                view
            }
        </>
    )
}

export default MarketingSettings