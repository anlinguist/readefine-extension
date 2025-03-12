import React, { useContext, useEffect, useState } from 'react'
// @ts-expect-error TS(6142): Module './MarketingOptions' was resolved to '/User... Remove this comment to see the full error message
import MarketingOptions from './MarketingOptions';
// @ts-expect-error TS(6142): Module './Unsubscribe' was resolved to '/Users/and... Remove this comment to see the full error message
import Unsubscribe from './Unsubscribe';
// @ts-expect-error TS(6142): Module './Subscribe' was resolved to '/Users/andre... Remove this comment to see the full error message
import Subscribe from './Subscribe';
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext';
// @ts-expect-error TS(6142): Module './MarketingSettingsToggle' was resolved to... Remove this comment to see the full error message
import MarketingSettingsToggle from './MarketingSettingsToggle';

function MarketingSettings() {
    // @ts-expect-error TS(2339): Property 'user' does not exist on type 'unknown'.
    const { user, showToastMessage, setShowModal, setModalName, readefineMarketingEmails, readefineMarketingEmailsSet, setReadefineMarketingEmailsSet, setReadefineMarketingEmails } = useContext(RDFNContext);
    const [view, setView] = useState(null);
    const handleUserResponse = async (optIn: any) => {
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
            // @ts-expect-error TS(2345): Argument of type 'Element' is not assignable to pa... Remove this comment to see the full error message
            setView(<MarketingSettingsToggle handleUserResponse={handleUserResponse} />)
        } else {
            // @ts-expect-error TS(2345): Argument of type 'Element' is not assignable to pa... Remove this comment to see the full error message
            setView(<MarketingOptions handleUserResponse={handleUserResponse} />)
        }
    }, [readefineMarketingEmails])
    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <>
            {
                view &&
                view
            }
        </>
    )
}

export default MarketingSettings