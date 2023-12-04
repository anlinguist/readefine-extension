import React, { useEffect, useState } from 'react';

function Select({ options, handleChange, setActiveDropdown, active, deactivate, defaultSelection }) {
    const [selection, setSelection] = useState(defaultSelection || options[0] || "");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setSelection(defaultSelection);
    }, [defaultSelection]);
    
    const handleSelection = (option) => {
        setSelection(option);
        deactivate();
        handleChange(option);
        setSearchTerm("");
    };

    const toggleDropdown = () => {
        if(active) {
        deactivate();
        } else {
        setActiveDropdown();
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredOptions = options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`rdfnOperationTargetContainer${active ? ' active' : ''}`}>
            <div className='rdfnOperationTargetDisplay'  onClick={toggleDropdown}>
                <div>{selection}</div>
                <div className='arrow'></div>
            </div>
            <ul className={`rdfnOperationTargetDropdown${active ? ' active' : ''}`}>
                <input 
                    type='text' 
                    placeholder='Search' 
                    value={searchTerm} 
                    onChange={handleSearchChange}  // <-- Attach the onChange handler
                />
                {
                    filteredOptions.map((option, index) => (  // <-- Use the filteredOptions here
                        <li key={index} onClick={() => handleSelection(option)} className='rdfnOperationTargetDropdownItem'>
                            {option}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}

export default Select;