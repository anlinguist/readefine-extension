/*global chrome*/
import { useEffect, useState } from 'react';
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

  const handleOperationChange = (operation: any) => {
    setSelectedOperation(operation);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    setSelectedValue(operations[operation][0] || '');
  };

  const handleValueChange = (value: any) => {
    setSelectedValue(value);
  };

  const getReadefineAIDetails = async () => {
    let response = await chrome.runtime.sendMessage({ swaction: 'GET_READEFINE_AI_DETAILS' });
    return response;
  }

  const updateUIs = async (retrieved_operations: any) => {
    if (Object.keys(retrieved_operations).length > 0) {
      let { lastApproach } = await chrome.storage.local.get();
      // set selected operation and target if they're available in retrieved_operations
      if (lastApproach) {
        if (!retrieved_operations[lastApproach]) {
          // get the first available operation
          let firstOperation = Object.keys(retrieved_operations).sort()[0]
          // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
          setSelectedOperation(firstOperation);
        } else {
          setSelectedOperation(lastApproach);
        }
      } else {
        let firstOperation = Object.keys(retrieved_operations).sort()[0]
        // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
        setSelectedOperation(firstOperation);
      }
    }
  }

  useEffect(() => {
    const updateTargets = async() => {
      // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
      if (operations && Object.keys(operations).length > 0 && operations[selectedOperation]) {
        // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
        if (operations[selectedOperation].length > 0) {
          let { lastTarget } = await chrome.storage.local.get();
          setHasValueOptions(true);
          // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
          if (operations[selectedOperation].includes(lastTarget)) {
            setSelectedValue(lastTarget);
          } else {
            // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
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
    if (readefineAIDetails.exceededDailyLimit) {
      setExceededDailyLimit(true);
    } else {
      setExceededDailyLimit(false);
    }
    setOperations(readefineAIDetails.options);

    await updateUIs(readefineAIDetails.options);
    setLoading(false);
  }

  const handleMessage = (event: any) => {
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
      // @ts-expect-error TS(2339): Property 'tagName' does not exist on type 'EventTa... Remove this comment to see the full error message
      if (e.target.tagName === 'INPUT') {
        return;
      }
      chrome.runtime.sendMessage({ swaction: 'RECREATE_SELECTION_VIA_BG' })
    })}>
      <div className='RDFNAITOP'>
        {
          !exceededDailyLimit &&
          <>
            <Select
              options={Object.keys(operations)}
              handleChange={handleOperationChange}
              // @ts-expect-error TS(2345): Argument of type '"operation"' is not assignable t... Remove this comment to see the full error message
              setActiveDropdown={() => setActiveDropdown('operation')}
              active={activeDropdown === 'operation'}
              deactivate={() => setActiveDropdown(null)}
              defaultSelection={selectedOperation} />
            {
              hasValueOptions &&
              operations &&
              // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
              operations[selectedOperation] &&
              // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
              operations[selectedOperation].length > 0 &&
              <Select
                // @ts-expect-error TS(2538): Type 'boolean' cannot be used as an index type.
                options={operations[selectedOperation]}
                handleChange={handleValueChange} 
                // @ts-expect-error TS(2345): Argument of type '"value"' is not assignable to pa... Remove this comment to see the full error message
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
              chrome.tabs.create({ url: 'https://app.getreadefine.com/ai' });
            })} rel="noreferrer">
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
          <span id="readefine_settings" className="dict_class" onClick={(() => {
            // send message to open rdfn settings
            chrome.runtime.sendMessage({ swaction: 'OPEN_SETTINGS' })
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
                // @ts-expect-error TS(2339): Property 'lastTarget' does not exist on type '{ la... Remove this comment to see the full error message
                storedVals.lastTarget = selectedValue;
              }
              chrome.storage.local.set(storedVals);
              const messageData = {
                type: 'READEFINE_SELECTION',
                operation: selectedOperation,
                value: selectedValue
              };

              chrome.runtime.sendMessage({ swaction: 'SEND_MESSAGE_VIA_BG', data: messageData }, function (response: any) {
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