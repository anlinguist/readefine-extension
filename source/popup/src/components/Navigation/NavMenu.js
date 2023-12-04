import React, { useContext } from 'react';
import { RDFNContext } from '../../RDFNContext';

const NavMenu = () => {
    let { setModalName, setShowModal } = useContext(RDFNContext)

  return (
    <div id="navigationmenu">
      <div id="nav_options_menu" className='openmodal' onClick={((e) => {
        setModalName('settings')
        setShowModal(true)
      })}>&#xe8b8;</div>
    </div>
  );
}

export default NavMenu;
