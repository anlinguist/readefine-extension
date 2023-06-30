function runOnStart() {
  var div=document.createElement("div"); 
  div.style.display = "none"
  div.setAttribute("id", "readefineextension");
  document.body.appendChild(div);
}

if(document.readyState !== 'loading') {
  runOnStart();
}
else {
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
      chrome.runtime.sendMessage({action: "checkforuserdata"}).then(function(response) {
        if (response.message == "loggedOut") {
          event.source.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT", 
                                text: "loggedout" }, "*");
        }
        else if (response.message == "loggedIn") {
          event.source.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT", 
                            text: "loggedin" }, "*");
        }
      })
    }
    if (event.data.gUserID) {
      obj = {}
      obj["gUserName"] = event.data.gUserName
      obj["gUserEmail"] = event.data.gUserEmail
      obj["gUserPhoto"] = event.data.gUserPhoto
      obj["gUserID"] = event.data.gUserID
      chrome.runtime.sendMessage(obj)
    }
    if (event.data.signOut) {
      chrome.storage.local.remove(["gUserID", "gUserEmail", "gUserName", "readefineAddons", "readefinePaidStatus", "readefinePreferredLocation", "readefinePersonalDictionary", "readefineblocked", "readefinemode", "tempreadefinestatus"])
    }
  }
}, false);