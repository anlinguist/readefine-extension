import React, { useContext } from 'react';
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext';

const NavMenu = () => {
    // @ts-expect-error TS(2339): Property 'setModalName' does not exist on type 'un... Remove this comment to see the full error message
    let { setModalName, setShowModal } = useContext(RDFNContext)

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id="navigationmenu">
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div id="nav_options_menu" className='openmodal' onClick={((e) => {
        setModalName('settings')
        setShowModal(true)
      })}>&#xe8b8;</div>
    </div>
  );
}

export default NavMenu;
