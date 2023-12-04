import React, { useContext, useState } from 'react'
import { RDFNContext } from '../../RDFNContext'
import CloseNavMenu from './CloseNavMenu'
import AITargetCard from '../MainViews/Pro/AITargetCard'
import NewStyleTarget from '../MainViews/Pro/NewStyleTarget'
import Confirm from '../Confirm'

function ManageReadefineAIStyle() {
  const { chosenAIStyle, aiPromptOptions, setAIPromptOptions, showToastMessage, signUserOut, user } = useContext(RDFNContext)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState(false);

  const handleDelete = () => {
      setIsConfirmOpen(false);
      removeTarget(cardToRemove);
  };

  const updateTargets = async(targetName, endpoint, msg) => {
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
    
  const removeTarget = async (targetName) => {    
    const msg = `Removed ${targetName} style`;
    await updateTargets(targetName, "deleteTarget", msg);
  }

  const addTarget = async (targetName) => {
    const msg = `Added ${targetName} target`;
    await updateTargets(targetName, "addTarget", msg);
  }

  return (
    <div id='usergreeting' onClick={((e) => {e.stopPropagation()})}>
            <Confirm
              isOpen={isConfirmOpen}
              message={`Are you sure you want to delete the ${cardToRemove} target from the ${chosenAIStyle} Readefine AI style?`}
              onConfirm={((e) => {
                e.stopPropagation();
                handleDelete();
              })}
              onCancel={() => setIsConfirmOpen(false)}
            />
        <div id='rdfnsettings'>
            <CloseNavMenu />
            <h2 id="manageaistylemodal">
                {chosenAIStyle}
            </h2>
            <div className='rdfnmodeexplainer'>
                <div className='rdfnmodeexclamation'>&#xe88f;</div>
                <p>Here, you can modify the targets for the {chosenAIStyle} style.</p>
            </div>
            {/*
                obtain the targets for the current style (if there are any) 
                and display them in a list, each with a remove button
                and a button to add a new target
            */}
            <div id="targetlist">
                {
                    aiPromptOptions &&
                    aiPromptOptions[chosenAIStyle].length > 0 &&
                    aiPromptOptions[chosenAIStyle].map((target, index) => {
                        return (
                            <AITargetCard key={index} targetName={target} setIsConfirmOpen={setIsConfirmOpen} setCardToRemove={setCardToRemove} />
                        )
                    })
                }
                {
                    aiPromptOptions &&
                    aiPromptOptions[chosenAIStyle].length === 0 &&
                    <div id="noaistylestext">There are no targets for this style yet</div>
                }
            </div>
            <NewStyleTarget addTarget={addTarget} />
        </div>
    </div>
  )
}

export default ManageReadefineAIStyle