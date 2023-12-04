/*global chrome*/
import React, { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/testicon.png';
import Select from './Components/Select';

function App() {
  const [selectedOperation, setSelectedOperation] = useState(false);
  const [selectedValue, setSelectedValue] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [overLimit, setOverLimit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exceededDailyLimit, setExceededDailyLimit] = useState(false);
  const [operations, setOperations] = useState({});
  const [hasValueOptions, setHasValueOptions] = useState(false);

  const handleOperationChange = (operation) => {
    setSelectedOperation(operation);
    setSelectedValue(operations[operation][0] || '');
  };

  const handleValueChange = (value) => {
    setSelectedValue(value);
  };

  const getReadefineAIDetails = async () => {
    let response = await chrome.runtime.sendMessage({ 'action': 'getReadefineAIDetails' });
    console.log("received response from ext bg: ", response);
    return response;
  }

  const updateUIs = async(retrieved_operations) => {
    console.log("updating UIs...")
    if (Object.keys(retrieved_operations).length > 0) {
      let { lastApproach } = await chrome.storage.local.get();
      // set selected operation and target if they're available in retrieved_operations
      if (lastApproach) {
        if (!retrieved_operations[lastApproach]) {
          // get the first available operation
          let firstOperation = Object.keys(retrieved_operations).sort()[0]
          setSelectedOperation(firstOperation);
        } else {
          setSelectedOperation(lastApproach);
        }
      } else {
        let firstOperation = Object.keys(retrieved_operations).sort()[0]
        setSelectedOperation(firstOperation);
      }
    }
  }

  useEffect(() => {
    const updateTargets = async() => {
      console.log("updating targets...")
      if (operations && Object.keys(operations).length > 0 && operations[selectedOperation]) {
        if (operations[selectedOperation].length > 0) {
          let { lastTarget } = await chrome.storage.local.get();
          setHasValueOptions(true);
          if (operations[selectedOperation].includes(lastTarget)) {
            setSelectedValue(lastTarget);
          } else {
            console.log("setting selected value to: ", operations[selectedOperation][0])
            setSelectedValue(operations[selectedOperation][0]);
          }
        } else {
          setHasValueOptions(false);
          setSelectedValue(false);
        }
      }
    }
    updateTargets();
  }, [operations, selectedOperation]);

  const checkDailyLimit = async() => {
    setLoading(true)
    let readefineAIDetails = await getReadefineAIDetails();
    if (!readefineAIDetails) {
      setLoading(false);
      setOperations({});
      return;
    }
    console.log("received readefineAIDetails: ", readefineAIDetails)
    if (readefineAIDetails.exceededDailyLimit) {
      setExceededDailyLimit(true);
      console.log("user has exceeded daily limit")
    } else {
      console.log("user has not exceeded daily limit")
      setExceededDailyLimit(false);
    }
    setOperations(readefineAIDetails.options);

    await updateUIs(readefineAIDetails.options);
    setLoading(false);
  }

  const handleMessage = (event) => {
    if (event?.data?.type === 'SELECTION_OVER_LIMIT') {
      console.log("setting over limit...")
      setOverLimit(true);
    }
  }

  useEffect(() => {
    checkDailyLimit();
    window.addEventListener('message', handleMessage);
  
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="RDFNAI" onClick={(async(e) => {
      e.preventDefault();
      // if clicked on input item, do not send message
      if (e.target.tagName === 'INPUT') {
        return;
      }
      chrome.runtime.sendMessage({ action: 'RECREATE_SELECTION' })
    })}>
      <div className='RDFNAITOP'>
        {
          !exceededDailyLimit &&
          <>
            <Select
              options={Object.keys(operations)}
              handleChange={handleOperationChange}
              setActiveDropdown={() => setActiveDropdown('operation')}
              active={activeDropdown === 'operation'}
              deactivate={() => setActiveDropdown(null)}
              defaultSelection={selectedOperation} />
            {
              hasValueOptions &&
              operations &&
              operations[selectedOperation] &&
              operations[selectedOperation].length > 0 &&
              <Select
                options={operations[selectedOperation]}
                handleChange={handleValueChange} 
                setActiveDropdown={() => setActiveDropdown('value')}
                active={activeDropdown === 'value'}
                deactivate={() => setActiveDropdown(null)}
                defaultSelection={selectedValue} />  // Pass the default selection as a prop
            }
          </>
        }
        {
          exceededDailyLimit &&
          <div className="exceededDailyLimit">
            <a href='https://app.getreadefine.com/subscription' target='_blank' onClick={((e) => {
              e.preventDefault();
              chrome.tabs.create({ url: 'https://app.getreadefine.com/subscription' });
            })}>
              <div>
                Manage subscription
              </div>
            </a>
          </div>
        }
      </div>
      <div className='RDFNAIBTM'>    
        <img src={chrome.runtime.getURL("assets/testicon.png") || logo} id="hl2rdfnlogo" alt="Logo" />
        <div className='RDFNAIBTMBTNS'>
          <span id="readefine_settings" class="dict_class" onClick={((e) => {
            // send message to open rdfn settings
            chrome.runtime.sendMessage({ action: 'OPEN_SETTINGS' })
          })}>&#xe150;</span>
          {
            !overLimit &&
            !loading &&
            !exceededDailyLimit &&
            <button className="rdfnPlayButton" onClick={(async(e) => {
              e.preventDefault();
              setLoading(true);

              // store lastApproach and lastTarget
              let storedVals = {
                lastApproach: selectedOperation,
              }
              if (selectedValue) {
                storedVals.lastTarget = selectedValue;
              }
              chrome.storage.local.set(storedVals);
              const messageData = {
                type: 'READEFINE_SELECTION',
                operation: selectedOperation,
                value: selectedValue
              };

              chrome.runtime.sendMessage({ 'action': 'SEND_MESSAGE_VIA_BG', 'data': messageData }, function (response) {
                if (response) { }
              });
            })}>
              <svg viewBox="0 0 32 32" width="20" height="20">
                <path d="M6 4l20 12-20 12z"></path>
              </svg>
            </button>
          }
          {
            exceededDailyLimit &&
            <div className="errorMessage">Exceeded Daily Limit.</div>
          }
          {
            !overLimit &&
            loading &&
            <div className='readefineGPT-loader'></div>
          }
          {
            !exceededDailyLimit &&
            overLimit &&
            <div className="errorMessage">Selection is too long.</div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;