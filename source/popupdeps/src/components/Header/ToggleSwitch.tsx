// @ts-nocheck
import { useContext } from 'react';
import { RDFNContext } from '../../RDFNContext';
import { Switch, Tooltip } from '@mantine/core';
import classes from './ToggleSwitch.module.css';

function ToggleSwitch() {
  const { status, setStatus } = useContext(RDFNContext);

  const toggleRDFN = async (e: any) => {
    setStatus(e.target.checked)
    await chrome.storage.local.set({ status: e.target.checked })
    await chrome.runtime.sendMessage({ swaction: "REREADEFINE_TABS" })
  }
  return (
    <Tooltip  classNames={{
      tooltip: classes.tooltip,
  }} zIndex={1001} withArrow label={`Turn Readefine ${status ? 'off' : 'on'}`} refProp="rootRef">
      <Switch classNames={{
        root: classes.root
      }} mb={"10px"} checked={status} onChange={toggleRDFN} color="rdfnyellow.6"/>
    </Tooltip>
  )
}

export default ToggleSwitch