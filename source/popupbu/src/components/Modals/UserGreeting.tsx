import React, { useContext } from 'react'
// @ts-expect-error TS(2307): Cannot find module '../../assets/def_prof_pic.jpeg... Remove this comment to see the full error message
import default_photo from '../../assets/def_prof_pic.jpeg'
// @ts-expect-error TS(6142): Module '../MainViews/Settings/Settings' was resolv... Remove this comment to see the full error message
import Settings from '../MainViews/Settings/Settings'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from '../../RDFNContext'
// @ts-expect-error TS(6142): Module './CloseNavMenu' was resolved to '/Users/an... Remove this comment to see the full error message
import CloseNavMenu from './CloseNavMenu'

function UserGreeting() {
  // @ts-expect-error TS(2339): Property 'userPhoto' does not exist on type 'unkno... Remove this comment to see the full error message
  const { userPhoto, userName, userCount } = useContext(RDFNContext)

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div id='usergreeting' onClick={((e) => {e.stopPropagation()})}>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <CloseNavMenu />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <img id='user-img' alt='User' src={userPhoto ? userPhoto : default_photo} />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div id="account_settings">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="account_greeting">Hi {userName ? userName : 'Friend'}!</div>
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <div id="readefine_count_msg"><span>Readefine has changed </span><span id="readefine_count">{userCount}</span><span> words or phrases for you.</span></div>
        </div>
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Settings />
    </div>
  )
}

export default UserGreeting