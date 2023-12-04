import React, { useContext } from 'react'
import default_photo from '../../assets/def_prof_pic.jpeg'
import Settings from '../MainViews/Settings/Settings'
import { RDFNContext } from '../../RDFNContext'
import CloseNavMenu from './CloseNavMenu'

function UserGreeting() {
  const { userPhoto, userName, userCount } = useContext(RDFNContext)

  return (
    <div id='usergreeting' onClick={((e) => {e.stopPropagation()})}>
        <CloseNavMenu />
        <img id='user-img' alt='User' src={userPhoto ? userPhoto : default_photo} />
        <div id="account_settings">
            <div id="account_greeting">Hi {userName ? userName : 'Friend'}!</div>
            <div id="readefine_count_msg"><span>Readefine has changed </span><span id="readefine_count">{userCount}</span><span> words or phrases for you.</span></div>
        </div>
        <Settings />
    </div>
  )
}

export default UserGreeting