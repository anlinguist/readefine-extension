const handleReadefineInstalled = (details) => {
  if (details.reason == "install") {
    chrome.tabs.create({url: 'https://app.getreadefine.com/welcome'});
  }
};
const getBrowserInfo = () => {
  let isChrome = false,
      isFirefox = false,
      isEdge = false,
      isSafari = false;

  let extUrl = chrome.runtime.getURL('');
  let parsedExtUrl = new URL(extUrl);
  let extProtocol = parsedExtUrl.protocol;
  let extHost = parsedExtUrl.host;

  switch (extProtocol) {
    case 'chrome-extension:':
      switch (extHost) {
        case 'odfcpcabgcopkkpicbnebpefigppfglm':
          isChrome = true;
          break;
        case 'cglfmmemieddkpolaaeckmbnaddjbbfe':
          isEdge = true;
          break;
        default:
          break;
      }
      break;
    case 'moz-extension:':
      isFirefox = true;
      break;
    case 'safari-extension:':
    case 'safari-web-extension:':
      isSafari = true;
      break;
    default:
      break;
  }
  return { isChrome, isFirefox, isEdge, isSafari };
};
const handleMessage = (request, sender, sendResponse) => {
  (async () => {
    if (sender.id === chrome.runtime.id) {
      if ("action" in request) {
        switch (request.action) {
          case "checkforuserdata": {
            const { gUserID } = await chrome.storage.local.get();
            if (gUserID) {
              sendResponse({ message: 'loggedIn'});
            }
            else {
              sendResponse({ message: 'loggedOut'});
            }
            break;
          }
          case "routeSendData": {
            let sendData = JSON.parse(request.sendData)
            const { gUserID, status } = await chrome.storage.local.get();

            if (status === false) {
              sendResponse({title: "updatethepage", text: JSON.stringify({})})
            }
            else {
              let uid = gUserID
              let pageHost = sendData['pageHost']
              let pagecount = sendData['pagecount']
              let finobj = JSON.stringify(sendData["pageData"])
              let postinfo = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'uid': uid,
                    'pageHost': pageHost,
                    'pagecount': pagecount
                },
                body: finobj
              }
              let queryurl = 'https://readefine-node-server-57discg22a-uc.a.run.app/queryReadefine'
              let raw = await fetch(queryurl, postinfo)
              let data = await raw.json()
              let tosend = JSON.stringify(data)
              sendResponse({title: "updatethepage", text: tosend});   
            }           
            break;
          }
          case "rereadefine_tabs": {
            chrome.tabs.query({}, function(tabs) {
              var message = {rereadefine: true};
              for (var i=0; i<tabs.length; ++i) {
                try{
                  chrome.tabs.sendMessage(tabs[i].id, message, function(theresponse) {
                    if (chrome.runtime.lastError) {
                      return;
                    }
                  });
                }
                catch {}
              }
            });
            sendResponse("done");
            break;
          }
          case "feedback_report": {
            const { gUserID } = await chrome.storage.local.get();
            let uid = gUserID
            let target = request.target;
            let original = request.original;
            let postinfo = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'uid': uid,
                  'target': target,
                  'original': original
              }
            }
            let queryurl = 'https://readefine-node-server-57discg22a-uc.a.run.app/feedbackReport'
            let resp = await fetch(queryurl, postinfo)
            let data = await resp.json()
            if (data.status === "success") {
              sendResponse({text: "success"})
            }
            break;
          }
          case "feedback_disable_dict": {
            const { gUserID, status } = await chrome.storage.local.get();
            let uid = gUserID
            let target = request.target;
            let original = request.original;
            let dict = request.dict;
            let type = request.type;
            let docurl = request.url;
            let postData = {
              target: target,
              original: original,
              dict: dict,
              type: type
            }

            finobj = JSON.stringify(postData)

            let postinfo = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'uid': uid,
                  'pageHost': docurl
              },
              body: finobj
            }
            let url = 'https://readefine-node-server-57discg22a-uc.a.run.app/disableDictionaryForUser'

            let resp = await fetch(url, postinfo)
            let data = await resp.json()
            if (data['result'] == "success") {
              sendResponse({text: 'success'});
            }
            break;
          }
        }
      }
      if ("message" in request) {
        if (request.message == "popup") {
          sendResponse({ url: chrome.runtime.getURL("content/web/viewer.html") })
        }
      }
      if ("gUserID" in request) {
        await chrome.action.setBadgeText({ text: '' })
        await chrome.storage.local.set({stored: "true"})
        await chrome.storage.local.set(request)
        sendResponse("done")
      }
    }
  })();
  return true;
};
const handleExternalMessage = (request, sender, sendResponse) => {
  (async () => {
    console.log("received external message")
    let { isChrome, isFirefox, isEdge, isSafari } = getBrowserInfo();
    let all_permissions = await chrome.permissions.getAll()
    let pinned_status;
    if (!isSafari) {
      pinned_status = (await chrome.action.getUserSettings()).isOnToolbar
    } else {
      pinned_status = true
    }

    let origin_permissions = all_permissions['origins']
    if (request.checkReadefine) {
      sendResponse("installed")
    }
    if (request.checkReadefineWithPermissions) {
      sendResponse({installed: true, origin_permissions: origin_permissions, pinned_status: pinned_status})
    }
    if (request.gUserID) {
      obj = {}
      obj["gUserName"] = request.gUserName
      obj["gUserEmail"] = request.gUserEmail
      obj["gUserID"] = request.gUserID
      await chrome.action.setBadgeText({ text: '' })
      await chrome.storage.local.set(obj)
      sendResponse({success: true})
    }
    if (request.signOut) {
      await chrome.storage.local.remove(["gUserID", "gUserEmail", "gUserName", "readefineAddons", "readefinePaidStatus", "readefinePreferredLocation", "readefinePersonalDictionary", "readefineblocked", "readefinemode", "tempreadefinestatus"])
      sendResponse({success: true})
    }
  })();
  return true;
};
const handleTabUpdate = async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    let { isChrome, isFirefox, isEdge, isSafari } = getBrowserInfo();
    
    if (!isSafari) {
      chrome.notifications.clear('open_pdf')
      chrome.notifications.clear('sign_in_to_readefine')
    }
    if (tab.url.indexOf(".pdf") != -1) {
      if (!tab.url.includes("getreadefine")) {
        let { pdfs, gUserID } = await chrome.storage.local.get();
        let newURL = "https://app.getreadefine.com/view-pdf/?rdfn-pdf-url=" + tab.url
        if (pdfs == "enabled") {
          chrome.tabs.update(tabId, {
            url: newURL
          });
        }
        else {
          if (!isSafari) {
            if (gUserID) {
              chrome.notifications.create('open_pdf', {
                type: 'basic',
                iconUrl: '/assets/exticon.png',
                title: 'Readefine this PDF',
                message: 'Click here to Readefine this PDF!',
                priority: 2
              })

              chrome.notifications.onClicked.addListener(function(notificationId, byUser) {
                if (notificationId == "open_pdf") {
                  chrome.tabs.update(tabId, {
                    url: newURL
                  });
                  chrome.notifications.clear('open_pdf')
                }
              });
            } else {
              chrome.notifications.create('sign_in_to_readefine', {
                type: 'basic',
                iconUrl: '/assets/exticon.png',
                title: 'Sign in to Readefine',
                message: 'Click here to sign in to Readefine!',
                priority: 2
              })

              chrome.notifications.onClicked.addListener(function(notificationId, byUser) {
                if (notificationId == "sign_in_to_readefine") {
                  chrome.tabs.create({
                    url: `https://appp.getreadefine.com?aftersignin=${newURL}`
                  });
                  chrome.notifications.clear('sign_in_to_readefine')
                }
              });
            }
          } else {
            chrome.runtime.sendNativeMessage("application.id", {message: "get_device_id"}, async function(response) {
              if (response['device_token'] != "not_found") {
                if (data.gUserID) {
                  var raw = JSON.stringify({
                    "pdf_link": newURL,
                    "device": response['device_token']
                  });
                  var requestOptions = {
                    method: 'POST',
                    body: raw,
                    redirect: 'follow',
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  };

                  let resp = await fetch("https://query-readefine-57discg22a-uc.a.run.app/readefine_pdf", requestOptions)
                  let data = await resp.text()
                  console.log(data)
                }
                else {
                  var raw = JSON.stringify({
                    "pdf_link": newURL,
                    "device": response['device_token']
                  });
                  var requestOptions = {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: raw,
                    redirect: 'follow'
                  };
                  let resp = await fetch("https://query-readefine-57discg22a-uc.a.run.app/notify_to_signin", requestOptions)
                  let data = await resp.text()
                  console.log(data)
                }
              }
            });
          }
        }
      }
    }
  }
};

chrome.runtime.onInstalled.addListener(handleReadefineInstalled)
chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onMessageExternal.addListener(handleExternalMessage);
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.runtime.setUninstallURL('https://app.getreadefine.com/uninstall')