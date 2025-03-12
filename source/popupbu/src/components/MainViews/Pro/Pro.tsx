/*global chrome*/
import React, { useContext, useState } from 'react';
import './Pro.css';
// @ts-expect-error TS(6142): Module './AIStyleCard' was resolved to '/Users/and... Remove this comment to see the full error message
import AIStyleCard from './AIStyleCard';
// @ts-expect-error TS(6142): Module './NewAIStyle' was resolved to '/Users/andr... Remove this comment to see the full error message
import NewAIStyle from './NewAIStyle';
// @ts-expect-error TS(6142): Module '../../Confirm' was resolved to '/Users/and... Remove this comment to see the full error message
import Confirm from '../../Confirm';
// @ts-expect-error TS(6142): Module '../../../RDFNContext' was resolved to '/Us... Remove this comment to see the full error message
import { RDFNContext } from '../../../RDFNContext';

function Pro() {
    // @ts-expect-error TS(2339): Property 'aiPromptOptions' does not exist on type ... Remove this comment to see the full error message
    const { aiPromptOptions, setAIPromptOptions, signUserOut, user, showToastMessage, proStatus} = useContext(RDFNContext);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [cardToRemove, setCardToRemove] = useState(false);

    const handleDelete = (styleName: any) => {
        setIsConfirmOpen(false);
        removeCard(styleName);
    };

    const updateStyles = async (styleName: any, endpoint: any, msg: any) => {
        const raw = JSON.stringify({
            "style": styleName
        });

        const url = `https://readefine-node-server-57discg22a-uc.a.run.app/v2/${endpoint}`;
        const postInfo = {
            method: 'POST',
            headers: {
                'token': user,
                "Content-Type": "application/json",
                'version': '5'
            },
            body: raw
        };
        const resp = await fetch(url, postInfo);
        if (resp.status === 401) {
            await signUserOut();
            return;
        }
        if (resp.status !== 200) {
            const respData = await resp.json();
            showToastMessage(respData['error'], "error");
            return;
        }
        const updatedata = await resp.json();
        setAIPromptOptions(updatedata['updatedAIPromptOptions']);
        showToastMessage(msg, "success");
    }

    const removeCard = async (styleName: any) => {
        const msg = `Removed ${styleName} style`;
        await updateStyles(styleName, "deleteStyle", msg);
    }
    const addStyle = async (styleName: any) => {
        const msg = `Added ${styleName} style`;
        await updateStyles(styleName, "addStyle", msg);
    }

    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    return <>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Confirm
            isOpen={isConfirmOpen}
            message={`Are you sure you want to delete the ${cardToRemove} Readefine AI style?`}
            onConfirm={((e: any) => {
                e.stopPropagation();
                handleDelete(cardToRemove);
            })}
            onCancel={() => setIsConfirmOpen(false)}
        />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div id='propagecontainer'>
            { proStatus &&
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div className='rdfnmodeexplainer'>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <div className='rdfnmodeexclamation'>&#xe88f;</div>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <p>Edit the Readefine AI styles below. Click into a style to edit its targets.</p>
                    </div>
                    {
                        aiPromptOptions &&
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <div id='aiStylesContainer'>
                            {
                                Object.keys(aiPromptOptions).sort().map((style, index) => {
                                    return (
                                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                        <AIStyleCard key={index} styleName={style} setIsConfirmOpen={setIsConfirmOpen} setCardToRemove={setCardToRemove} />
                                    )
                                })
                            }
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <NewAIStyle addStyle={addStyle} />
                        </div>
                    }
                </>
            }
            {
                !proStatus &&
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <>
                {/* instead of this component, let's show the actual offer */}
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <p>You can modify the styles and targets offered in Readefine AI by upgrading to Pro.</p>
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div id="rdfnProUpgradeCard">
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <div id="rdfnProCardHeader">
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <h2>Pro</h2>
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <div>
                                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                <span id="rdfnProPrice">$10</span>
                                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                                <span id="rdfnProPricePeriod">/month</span>
                            </div>
                        </div>
                        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                        <div id="rdfnProCardBody">
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <div class="rdfnProFeature">✅ 10,000 tokens/day</div>
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <div class="rdfnProFeature">✅ GPT-4 Turbo</div>
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <div class="rdfnProFeature">✅ Custom rewording styles</div>
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <button id="pro-signup-btn" onClick={((e)=> {
                        e.preventDefault();
                        // detect which browser via the chrome.runtime.id if !safari, open web app. if safari, open subscription page
                        // @ts-expect-error TS(2304): Cannot find name 'chrome'.
                        if (chrome.runtime.id === "com.getreadefine.readefine.Extension (QK39SRR4H5)") {
                            // @ts-expect-error TS(2304): Cannot find name 'chrome'.
                            chrome.tabs.create({ url: 'rdfnapp://app.readefine.ai/switchToPro' });
                            return;
                        } else {
                            // @ts-expect-error TS(2304): Cannot find name 'chrome'.
                            chrome.tabs.create({ url: 'https://app.readefine.ai/subscription' });
                        }
                    })}>Upgrade to Pro</button>
                        </div>
                    </div>
                </>
            }
        </div>
    </>;
}

export default Pro