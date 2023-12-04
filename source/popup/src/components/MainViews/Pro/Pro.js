/*global chrome*/
import React, { useContext, useState } from 'react';
import './Pro.css';
import AIStyleCard from './AIStyleCard';
import NewAIStyle from './NewAIStyle';
import Confirm from '../../Confirm';
import { RDFNContext } from '../../../RDFNContext';

function Pro() {
    const { aiPromptOptions, setAIPromptOptions, signUserOut, user, showToastMessage, proStatus} = useContext(RDFNContext);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [cardToRemove, setCardToRemove] = useState(false);

    const handleDelete = (styleName) => {
        setIsConfirmOpen(false);
        removeCard(styleName);
    };

    const updateStyles = async (styleName, endpoint, msg) => {
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
            signUserOut();
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

    const removeCard = async (styleName) => {
        const msg = `Removed ${styleName} style`;
        await updateStyles(styleName, "deleteStyle", msg);
    }
    const addStyle = async (styleName) => {
        const msg = `Added ${styleName} style`;
        await updateStyles(styleName, "addStyle", msg);
    }

    return (
        <>
            <Confirm
                isOpen={isConfirmOpen}
                message={`Are you sure you want to delete the ${cardToRemove} Readefine AI style?`}
                onConfirm={((e) => {
                    e.stopPropagation();
                    handleDelete(cardToRemove);
                })}
                onCancel={() => setIsConfirmOpen(false)}
            />
            <div id='propagecontainer'>
                { proStatus &&
                    <>
                        <div className='rdfnmodeexplainer'>
                            <div className='rdfnmodeexclamation'>&#xe88f;</div>
                            <p>Edit the Readefine AI styles below. Click into a style to edit its targets.</p>
                        </div>
                        {
                            aiPromptOptions &&
                            <div id='aiStylesContainer'>
                                {
                                    Object.keys(aiPromptOptions).sort().map((style, index) => {
                                        return (
                                            <AIStyleCard key={index} styleName={style} setIsConfirmOpen={setIsConfirmOpen} setCardToRemove={setCardToRemove} />
                                        )
                                    })
                                }
                                <NewAIStyle addStyle={addStyle} />
                            </div>
                        }
                    </>
                }
                {
                    !proStatus &&
                    <>
                        <p>You can modify the styles and targets offered in Readefine AI by upgrading to Pro.</p>
                        <button id='pro-signup-btn' onClick={((e)=> {
                            e.preventDefault();
                            chrome.tabs.create({ url: 'https://app.readefine.ai/subscription' });
                        })}>Upgrade to Pro</button>
                    </>
                }
            </div>
        </>
    )
}

export default Pro