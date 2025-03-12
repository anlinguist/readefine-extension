import React, { useContext, useState } from 'react'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext'
// @ts-expect-error TS(6142): Module './CloseNavMenu' was resolved to '/Users/an... Remove this comment to see the full error message
import CloseNavMenu from './CloseNavMenu'
// @ts-expect-error TS(6142): Module '../MainViews/Pro/AITargetCard' was resolve... Remove this comment to see the full error message
import AITargetCard from '../MainViews/Pro/AITargetCard'
// @ts-expect-error TS(6142): Module '../MainViews/Pro/NewStyleTarget' was resol... Remove this comment to see the full error message
import NewStyleTarget from '../MainViews/Pro/NewStyleTarget'
// @ts-expect-error TS(6142): Module '../Confirm' was resolved to '/Users/andrew... Remove this comment to see the full error message
import Confirm from '../Confirm'

function ManageReadefineAIStyle() {
  // @ts-expect-error TS(2339): Property 'chosenAIStyle' does not exist on type 'u... Remove this comment to see the full error message
  const { chosenAIStyle, aiPromptOptions, setAIPromptOptions, showToastMessage, signUserOut, user } = useContext(RDFNContext)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState(false);

  const handleDelete = () => {
      setIsConfirmOpen(false);
      removeTarget(cardToRemove);
  };

  const updateTargets = async(targetName: any, endpoint: any, msg: any) => {
    const raw = JSON.stringify({
      "style": chosenAIStyle,
      "target": targetName
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
    
  const removeTarget = async (targetName: any) => {    
    const msg = `Removed ${targetName} style`;
    await updateTargets(targetName, "deleteTarget", msg);
  }

  const addTarget = async (targetName: any) => {
    const msg = `Added ${targetName} target`;
    await updateTargets(targetName, "addTarget", msg);
  }

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='usergreeting' onClick={((e) => {e.stopPropagation()})}>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Confirm
              isOpen={isConfirmOpen}
              message={`Are you sure you want to delete the ${cardToRemove} target from the ${chosenAIStyle} Readefine AI style?`}
              onConfirm={((e: any) => {
                e.stopPropagation();
                handleDelete();
              })}
              onCancel={() => setIsConfirmOpen(false)}
            />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div id='rdfnsettings'>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <CloseNavMenu />
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <h2 id="manageaistylemodal">
                {chosenAIStyle}
            </h2>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div className='rdfnmodeexplainer'>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className='rdfnmodeexclamation'>&#xe88f;</div>
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <p>Here, you can modify the targets for the {chosenAIStyle} style.</p>
            </div>
            {/*
                obtain the targets for the current style (if there are any) 
                and display them in a list, each with a remove button
                and a button to add a new target
            */}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="targetlist">
                {
                    aiPromptOptions &&
                    aiPromptOptions[chosenAIStyle].length > 0 &&
                    aiPromptOptions[chosenAIStyle].map((target: any, index: any) => {
                        return (
                            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                            <AITargetCard key={index} targetName={target} setIsConfirmOpen={setIsConfirmOpen} setCardToRemove={setCardToRemove} />
                        )
                    })
                }
                {
                    aiPromptOptions &&
                    aiPromptOptions[chosenAIStyle].length === 0 &&
                    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                    <div id="noaistylestext">There are no targets for this style yet</div>
                }
            </div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <NewStyleTarget addTarget={addTarget} />
        </div>
    </div>
  );
}

export default ManageReadefineAIStyle