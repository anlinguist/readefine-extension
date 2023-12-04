const handleReadefineInstalled = async (details) => {
  if (details.reason == "install") {
    chrome.tabs.create({ url: 'https://app.readefine.ai/?modal=welcome' });
  } else if (details.reason == "update") {
    let { otp } = await chrome.storage.local.get()
    await chrome.storage.local.remove(["gUserID"])
    if (!otp) {
      await chrome.storage.local.clear()
      chrome.tabs.create({ url: 'https://app.readefine.ai/?modal=welcome' });
    }
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
const signUserOut = async () => {
  await chrome.storage.local.clear()
  chrome.tabs.create({ url: 'https://app.readefine.ai/?modal=welcome' });
}
const handleMessage = (request, sender, sendResponse) => {
  (async () => {
    if (sender.id === chrome.runtime.id) {
      if ("action" in request) {
        switch (request.action) {
          case "checkforuserdata": {
            const { otp } = await chrome.storage.local.get();
            if (otp) {
              sendResponse({ message: 'loggedIn' });
            }
            else {
              sendResponse({ message: 'loggedOut' });
            }
            break;
          }
          case "routeSendData": {
            let uidsMap = new Map();
            let sendData = JSON.parse(request.sendData)
            const { otp, status } = await chrome.storage.local.get();

            if (status === false) {
              sendResponse({ title: "updatethepage", text: JSON.stringify({}) })
            }
            else {
              let token = otp;
              let pageHost = sendData['pageHost'];
              let pagecount = sendData['pagecount'];
              let pageData = sendData["pageData"];

              // Extract texts and store UIDs
              let textData = {};
              Object.keys(pageData).forEach(index => {
                let nodeData = pageData[index];
                textData[index] = nodeData.text; // Only send the text to the server
                uidsMap.set(index, nodeData.uid); // Store the UIDs in memory
              });

              let finobj = JSON.stringify(textData);
              let postinfo = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'token': token,
                  'pageHost': pageHost,
                  'pagecount': pagecount,
                  'version': '5'
                },
                body: finobj
              };
              let queryurl = 'https://readefine-node-server-57discg22a-uc.a.run.app/v2/queryReadefine';
              let raw = await fetch(queryurl, postinfo);
              // if response is status code 401, the token is invalid
              if (raw.status === 401) {
                signUserOut();
                sendResponse({ title: "updatethepage", text: JSON.stringify({}) })
                return;
              }
              let data = await raw.json();

              // Reattach UIDs to the data before sending the response back
              Object.keys(data).forEach(index => {
                let updatedText = data[index];
                let uid = uidsMap.get(index); // Recall the UID
                if (uid) {
                  updatedText["uid"] = uid
                }
              });

              let tosend = JSON.stringify(data);
              sendResponse({ title: "updatethepage", text: tosend });
            }
            break;
          }
          case "rereadefine_tabs": {
            chrome.tabs.query({}, function (tabs) {
              var message = { rereadefine: true };
              for (var i = 0; i < tabs.length; ++i) {
                try {
                  chrome.tabs.sendMessage(tabs[i].id, message, function (theresponse) {
                    if (chrome.runtime.lastError) {
                      return;
                    }
                  });
                }
                catch { }
              }
            });
            sendResponse("done");
            break;
          }
          case "readefineCurrentSelection": {
            const { otp, status } = await chrome.storage.local.get();
            let token = otp
            // here, we'll pass the selection to backend
            // which will return the readefined text
            let selection = request.text

            let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/testchatgpt"
            let payload = {
              "text": selection,
              "pageCount": request.pageCount,
              "isEditable": request.isEditable,
              "changes": {
                "changeToApply": request.operation
              }
            }

            if (request.target) {
              payload['changes']['target'] = request.target
            }

            let postinfo = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'token': token,
                'version': '5'
              },
              body: JSON.stringify(payload)
            }
            let resp = await fetch(url, postinfo)
            // if response is status code 401, the token is invalid
            if (resp.status === 401) {
              signUserOut();
              sendResponse({ title: "updatethepage", text: JSON.stringify({}) })
              return;
            }
            let data = await resp.json()
            if (data.exceededDailyLimit) {
              await chrome.storage.local.set({ exceededDailyLimit: data.exceededDailyLimit })
            }
            sendResponse(data);
            break;
          }
          case "SEND_MESSAGE_VIA_BG": {
            let messageData = request.data;

            let queryOptions = { active: true, lastFocusedWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);
            let currentTabId = tab.id;
            console.log(`instructing tab ${currentTabId} to send message`)

            chrome.tabs.sendMessage(currentTabId, messageData);
            // send response:
            sendResponse("done");
            break;
          }
          case "RECREATE_SELECTION": {
            const messageData = {
              type: 'READEFINE_RECREATE_SELECTION',
            };

            let queryOptions = { active: true, lastFocusedWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);
            let currentTabId = tab.id;

            chrome.tabs.sendMessage(currentTabId, messageData);
            sendResponse("done");
            break;
          }
          case 'UPDATE_HL2RDFN': {
            chrome.tabs.query({}, function (tabs) {
              for (let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, { type: "UPDATE_HL2RDFN", val: request.val }, function (response) {
                  if (chrome.runtime.lastError) { }
                });
              }
            });
            sendResponse("done");
            break;
          }
          case 'OPEN_SETTINGS': {
            const messageData = {
              type: 'OPEN_READEFINE_SETTINGS',
            };

            let queryOptions = { active: true, lastFocusedWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);
            let currentTabId = tab.id;

            chrome.tabs.sendMessage(currentTabId, messageData);
            sendResponse("done");
            break;
          }
          case 'OPEN_ACCOUNT_URL': {
            let url = "https://app.readefine.ai"
            chrome.tabs.create({ url: url });
            sendResponse("done");
            break;
          }
          case 'getReadefineAIDetails': {
            let { otp } = await chrome.storage.local.get();
            let token = otp
            let url = "https://readefine-node-server-57discg22a-uc.a.run.app/v2/getReadefineAIDetails"
            let postinfo = {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'token': token,
                'version': '5'
              }
            }
            let resp = await fetch(url, postinfo)
            if (resp.status === 401) {
              signUserOut();
              sendResponse(false);
              return;
            }
            if (!resp.ok) {
              sendResponse(false);
              return;
            }
            let data = await resp.json()
            sendResponse(data);
            break;
          }
        }
      }
      if ("message" in request) {
        if (request.message == "popup") {
          sendResponse({ url: chrome.runtime.getURL("content/web/viewer.html") })
        }
      }
      if ("otp" in request) {
        await chrome.action.setBadgeText({ text: '' })
        await chrome.storage.local.set({ stored: "true" })
        await chrome.storage.local.set(request)
        sendResponse("done")
      }
    }
  })();
  return true;
};
const handleExternalMessage = (request, sender, sendResponse) => {
  (async () => {
    console.log("handling external message")
    let { isChrome, isFirefox, isEdge, isSafari } = getBrowserInfo();
    console.log("isSafari", isSafari)
    let all_permissions = await chrome.permissions.getAll()
    let pinned_status;
    if (!isSafari) {
      pinned_status = (await chrome.action.getUserSettings()).isOnToolbar
    } else {
      pinned_status = true
    }

    let origin_permissions = all_permissions['origins']
    if (request.checkReadefine) {
      console.log("sending response installed")
      sendResponse("installed")
    }
    if (request.checkReadefineWithPermissions) {
      console.log("sending response installed with permissions")
      sendResponse({ installed: true, origin_permissions: origin_permissions, pinned_status: pinned_status })
    }
    if (request.otp) {
      obj = {}
      obj["gUserName"] = request.gUserName
      obj["gUserEmail"] = request.gUserEmail
      obj["status"] = true
      obj["otp"] = request.otp
      await chrome.action.setBadgeText({ text: '' })
      await chrome.storage.local.set(obj)
      sendResponse({ success: true })
    }
    if (request.signOut) {
      await chrome.storage.local.clear()
      sendResponse({ success: true })
    }
    if (request.openInAppPurchases) {
      let { otp } = await chrome.storage.local.get();
      let token = otp
      console.log("opening in app purchases")

      let response = await browser.runtime.sendNativeMessage({ token: token });
      if (response.response === "SUCCESS") {
          let linkPath;
          if (request.target) {
            switch (request.target) {
              case "Pro":
                linkPath = "switchToPro"
                break;
              default:
                break;
            }
              
              if (linkPath) {
                  let deepLinkURL = `rdfnapp://app.readefine.ai/${linkPath}`
                  console.log("deepLinkURL: ", deepLinkURL)
                  browser.tabs.create({ url: deepLinkURL });
              }
          }
      }
      sendResponse("done")
    }
  })();
  return true;
};

chrome.runtime.onInstalled.addListener(handleReadefineInstalled)
chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onMessageExternal.addListener(handleExternalMessage);