import React from 'react'

function Login() {
  return (
    <div id="main_login_body">
      <div id="rdfn_login_container">
        <div>
          Hi friend! Thanks for downloading - sign in to use Readefine!
        </div>
        <button id='loginbtn' class='loginbtn' onClick={((e) => {
          window.open('https://www.getreadefine.com/login')
        })}>Sign in</button>
      </div>
    </div>
  )
}

export default Login