function runOnStart() {
  var div=document.createElement("div"); 
  div.style.display = "none"
  div.setAttribute("id", "readefineextension");

  var extensionVersion = chrome.runtime.getManifest().version;
  div.setAttribute("data-readefine-extension-version", extensionVersion);

  document.body.appendChild(div);
  
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/readefine_version.js') + '?version=' + encodeURIComponent(extensionVersion);
  document.head.appendChild(script);
}

if(document.readyState !== 'loading') {
  runOnStart();
} else {
  document.addEventListener('DOMContentLoaded', function () {
      runOnStart()
  });
}

window.addEventListener("message", function(event) {
  // We only accept messages from this window to itself [i.e. not from any iframes]
  if (event.source != window) {
    return
  }

  if (event.data.type && (event.data.type == "FROM_PAGE_TO_CONTENT_SCRIPT")) {
    if (event.data.text == "checkforuserdata") {
      chrome.runtime.sendMessage({swaction: "GET_USER_LOGGED_IN_STATUS"}).then(function(response: any) {
        if (response.loggedIn) {
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          event.source.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT", 
                                // @ts-expect-error TS(2559): Type '"*"' has no properties in common with type '... Remove this comment to see the full error message
                                text: "loggedout" }, "*");
        }
        else {
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          event.source.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT", 
                            // @ts-expect-error TS(2559): Type '"*"' has no properties in common with type '... Remove this comment to see the full error message
                            text: "loggedin" }, "*");
        }
      })
    }
    if (event.data.otp) {
      let obj = {}
      // @ts-expect-error TS(2304): Cannot find name 'obj'.
      obj["gUserName"] = event.data.gUserName
      // @ts-expect-error TS(2304): Cannot find name 'obj'.
      obj["gUserEmail"] = event.data.gUserEmail
      // @ts-expect-error TS(2304): Cannot find name 'obj'.
      obj["gUserPhoto"] = event.data.gUserPhoto
      // @ts-expect-error TS(2304): Cannot find name 'obj'.
      obj["otp"] = event.data.otp
      chrome.runtime.sendMessage(obj)
    }
    if (event.data.signOut) {
      chrome.storage.local.remove(["gUserID", "gUserEmail", "gUserName", "readefineAddons", "readefinePaidStatus", "readefinePreferredLocation", "readefinePersonalDictionary", "readefineblocked", "readefinemode", "tempreadefinestatus", "otp"])
    }
  }
  if (event.data.type && (event.data.type === "AUTH_MESSAGE")) {
    chrome.runtime.sendMessage({ swaction: "SIGN_USER_IN", customToken: event.data.customToken });
  }
}, false);