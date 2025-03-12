import React, { useState } from 'react';

function NewAIStyle({
  addStyle
}: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e: any) => {
    setNewStyleName(e.target.value);
  };

  const handleAddNewStyle = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    await addStyle(newStyleName);
    console.log('New style added:', newStyleName);
    setIsLoading(false);
    setIsAdding(false);
    setNewStyleName('');
  };

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='addNewAIStyleContainer'>
      {isAdding ? (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <form id='addNewAIStyleForm' onSubmit={handleAddNewStyle}>
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <input
          required
            type="text"
            maxLength={100}
            value={newStyleName}
            onChange={handleInputChange}
            placeholder="Enter new style name"
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
        <button onClick={handleAddClick}>Add New Style</button>
      )}
    </div>
  );
}

export default NewAIStyle;
