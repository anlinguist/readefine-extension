import React, { useState } from 'react';

function NewStyleTarget({
  addTarget
}: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e: any) => {
    setNewTargetName(e.target.value);
  };

  const handleAddNewTarget = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    await addTarget(newTargetName);
    console.log('New target added:', newTargetName);
    setIsLoading(false);
    setIsAdding(false);
    setNewTargetName('');
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='addNewAIStyleContainer'>
      {isAdding ? (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <form id='addNewAIStyleForm' onSubmit={handleAddNewTarget}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <input
          required
            type="text"
            maxLength={100}
            value={newTargetName}
            onChange={handleInputChange}
            placeholder="Enter new target name"
          />
            {
                isLoading ? 
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <div className='loaderContainer'><div className='loader'></div></div> :
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <button id='addNewAIStyleSubmit' disabled={isLoading}>
                    Add
                </button>
            }
        </form>
      ) : (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <button onClick={handleAddClick}>Add New Target</button>
      )}
    </div>
  );
}

export default NewStyleTarget;
