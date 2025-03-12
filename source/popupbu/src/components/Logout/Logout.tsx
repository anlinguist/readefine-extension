import React from 'react'
import { useNavigate } from "react-router-dom";
// @ts-expect-error TS(2307): Cannot find module '../../services/firebase' or it... Remove this comment to see the full error message
import { auth, signInWithGoogle } from "../../services/firebase";
// @ts-expect-error TS(2307): Cannot find module 'react-firebase-hooks/auth' or ... Remove this comment to see the full error message
import { useAuthState } from "react-firebase-hooks/auth";

function Logout() {
  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div>Logout</div>
  )
}

export default Logout