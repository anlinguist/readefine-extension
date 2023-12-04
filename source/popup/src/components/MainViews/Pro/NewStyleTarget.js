import React, { useState } from 'react';

function NewStyleTarget({addTarget}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e) => {
    setNewTargetName(e.target.value);
  };

  const handleAddNewTarget = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    await addTarget(newTargetName);
    console.log('New target added:', newTargetName);
    setIsLoading(false);
    setIsAdding(false);
    setNewTargetName('');
  };

  return (
    <div id='addNewAIStyleContainer'>
      {isAdding ? (
        <form id='addNewAIStyleForm' onSubmit={handleAddNewTarget}>
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
                <div className='loaderContainer'><div className='loader'></div></div> :
                <button id='addNewAIStyleSubmit' disabled={isLoading}>
                    Add
                </button>
            }
        </form>
      ) : (
        <button onClick={handleAddClick}>Add New Target</button>
      )}
    </div>
  );
}

export default NewStyleTarget;
