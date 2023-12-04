import React, { useState } from 'react';

function NewAIStyle({addStyle}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (e) => {
    setNewStyleName(e.target.value);
  };

  const handleAddNewStyle = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    await addStyle(newStyleName);
    console.log('New style added:', newStyleName);
    setIsLoading(false);
    setIsAdding(false);
    setNewStyleName('');
  };

  return (
    <div id='addNewAIStyleContainer'>
      {isAdding ? (
        <form id='addNewAIStyleForm' onSubmit={handleAddNewStyle}>
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
                <div className='loaderContainer'><div className='loader'></div></div> :
                <button id='addNewAIStyleSubmit' disabled={isLoading}>
                    Add
                </button>
            }
        </form>
      ) : (
        <button onClick={handleAddClick}>Add New Style</button>
      )}
    </div>
  );
}

export default NewAIStyle;
