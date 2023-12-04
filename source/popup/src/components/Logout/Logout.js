import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function Logout() {
  return (
    <div>Logout</div>
  )
}

export default Logout