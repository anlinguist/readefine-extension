import { authManager as lam, AuthManager } from "./authManager";
import * as lc from "../constants";
import { offscreen } from "./offscreen";
import { FirebaseManager, firebaseManager as lfm } from "./firebaseManager";

export class MessageHandlers {
    authManager: AuthManager;
    firebaseManager: FirebaseManager;
    
    constants: typeof lc;
    constructor(
        authManager: AuthManager = lam,
        firebaseManager: FirebaseManager = lfm,
        constants: typeof lc = lc
    ) {
        this.authManager = authManager;
        this.firebaseManager = firebaseManager;
        this.constants = constants;
    };

    async getUserLoggedInStatus(): Promise<{ loggedIn: boolean }> {
        const token = await this.getUserToken();
        if (token) {
            return { loggedIn: true };
        } else {
            return { loggedIn: false };
        }
    };

    async readefineNodes(message: any): Promise<any> {
        let uidsMap = new Map();
        let sendData = message.sendData
        const { status = true } = await chrome.storage.local.get();

        if (status === false) {
            return { updatedNodes: JSON.stringify({}) };
        }
        else {
            let tokenobj = await this.getUserToken();
            let { token } = tokenobj;
            if (!token) {
                return { updatedNodes: JSON.stringify({}) };
            }
            let pagehost = sendData['pagehost'];
            let pagecount = sendData['pagecount'];
            let pagedata = sendData["pagedata"];
            let locale = sendData["locale"] || chrome.i18n.getUILanguage();

            let textData = {};
            Object.keys(pagedata).forEach(index => {
                let nodeData = pagedata[index];
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                textData[index] = nodeData.text; // Only send the text to the server
                uidsMap.set(index, nodeData.uid); // Store the UIDs in memory
            });

            let finobj = JSON.stringify(textData);
            let postinfo = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'pagehost': pagehost,
                    'pagecount': pagecount,
                    'Api-Version': '3.0',
                    'locale': locale
                },
                body: finobj
            };
            let queryurl = `${this.constants.SERVER_HOST}/readefine`;
            let raw = await fetch(queryurl, postinfo);
            // if response is status code 401, the token is invalid
            if (raw.status === 401) {
                await this.authManager.signUserOut();
                return { updatedNodes: JSON.stringify({}) };
            }
            let data = await raw.json();

            const updatedNodes = data.updatedNodes || {};
            Object.keys(updatedNodes).forEach(index => {
                let updatedText = updatedNodes[index];
                let uid = uidsMap.get(index);
                if (uid) {
                    updatedText["uid"] = uid
                }
            });

            const response = { updatedNodes: updatedNodes, readefinitionsList: data.readefinitionsList, readefineMode: data.readefineMode }
            return response;
        }
    };

    async reReadefineTabs(): Promise<any> {
        chrome.tabs.query({}, function (tabs: any) {
            var message = { type: 'REREADEFINE_TABS' };
            for (var i = 0; i < tabs.length; ++i) {
                try {
                    chrome.tabs.sendMessage(tabs[i].id, message, function (theresponse: any) {
                        if (chrome.runtime.lastError) {
                            return;
                        }
                    });
                }
                catch { }
            }
        });
        return;
    };

    async readefineCurrentSelection(message: any): Promise<any> {
        console.log("readefineCurrentSelection", message);
        let tokenObj = await this.getUserToken();
        let { token } = tokenObj;
        let selection = message.text

        let url = `${this.constants.SERVER_HOST}/readefineai`
        let payload = {
            "text": selection,
            "pageCount": message.pageCount,
            "isEditable": message.isEditable,
            "changes": {
                "changeToApply": message.operation
            }
        }

        if (message.target) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            payload['changes']['target'] = message.target
        }

        let postinfo = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Api-Version': '2.0'
            },
            body: JSON.stringify(payload)
        }
        let resp = await fetch(url, postinfo)
        // if response is status code 401, the token is invalid
        if (resp.status === 401) {
            await this.authManager.signUserOut();
            return { updatedNodes: JSON.stringify({}) };
            return;
        }
        let data = await resp.json()
        if (data.exceededDailyLimit) {
            await chrome.storage.local.set({ exceededDailyLimit: data.exceededDailyLimit })
        }
        return data;
    };

    async sendMessageViaBg(message: any): Promise<any> {
        let messageData = message.data;

        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        let currentTabId = tab.id;

        if (!currentTabId) {
            return "done";
        }

        chrome.tabs.sendMessage(currentTabId, messageData);
        return "done";
    };

    async recreateSelectionViaBg(message: any): Promise<any> {
        const messageData = {
            type: 'READEFINE_RECREATE_SELECTION',
        };

        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        let currentTabId = tab.id;
        if (!currentTabId) {
            return "done";
            return;
        }

        chrome.tabs.sendMessage(currentTabId, messageData);
        return "done";
    };

    async updateReadefineAI(message: any): Promise<any> {
        chrome.tabs.query({}, function (tabs: any) {
            for (let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, { type: "UPDATE_READEFINE_AI", val: message.val }, function (response: any) {
                    if (chrome.runtime.lastError) { }
                });
            }
        });
        return "done";
    };

    async openSettings(): Promise<any> {
        const messageData = {
            type: 'OPEN_READEFINE_SETTINGS',
        };

        let queryOptions = { active: true, lastFocusedWindow: true };
        let [tab] = await chrome.tabs.query(queryOptions);
        let currentTabId = tab.id;
        if (!currentTabId) {
            return "done";
        }

        chrome.tabs.sendMessage(currentTabId, messageData);
        return "done";
    };

    async openAccountUrl(): Promise<any> {
        let url = this.constants.WEB_HOST;
        chrome.tabs.create({ url: url });
        return "done";
    };

    async getReadefineAIDetails(): Promise<any> {
        let tokenObj = await this.getUserToken();
        let { token } = tokenObj;
        let url = `${this.constants.SERVER_HOST}/user/ai/details`
        let postinfo = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Api-Version': '2.0'
            }
        }
        let resp = await fetch(url, postinfo)
        if (resp.status === 401) {
            await this.authManager.signUserOut();
            return false;
        }
        if (!resp.ok) {
            return false;
        }
        let data = await resp.json()
        return data;
    };

    async checkReadefineWithPermissions(): Promise<any> {
        const all_permissions = await chrome.permissions.getAll();
        const origin_permissions = all_permissions['origins'];

        return { installed: true, origin_permissions: origin_permissions };
    };

    async storeOtp(message: any): Promise<any> {
        let obj: any = {}
        obj["gUserName"] = message.gUserName
        obj["gUserEmail"] = message.gUserEmail
        obj["status"] = true
        obj["otp"] = message.otp
        await chrome.action.setBadgeText({ text: '' })
        await chrome.storage.local.set(obj)
        return { success: true };
    };

    async signOut(): Promise<any> {
        await chrome.storage.local.clear()
        return { success: true };
    };

    async openInAppPurchases(message: any): Promise<any> {
        let userTokenObj = await this.getUserToken();
        let { token } = userTokenObj;

        // @ts-expect-error TS(2304): Cannot find name 'browser'.
        let response = await browser.runtime.sendNativeMessage({ token: token });
        if (response.response === "SUCCESS") {
            let linkPath;
            if (message.target) {
                switch (message.target) {
                    case "Pro":
                        linkPath = "switchToPro"
                        break;
                    default:
                        break;
                }

                if (linkPath) {
                    let deepLinkURL = `rdfnapp://app.readefine.ai/${linkPath}`
                    // @ts-expect-error TS(2304): Cannot find name 'browser'.
                    browser.tabs.create({ url: deepLinkURL });
                }
            }
        }
        return "done";
    };

    async getUserState(): Promise<any> {
        return await this.firebaseManager.getUserState();
    };

    async getUserToken(): Promise<any> {
        return await this.firebaseManager.getUserToken();
    };

    async getUserId(): Promise<any> {
        return await this.firebaseManager.getUserId();
    }

    async signUserIn(message: any): Promise<any> {
        return await this.firebaseManager.signUserIn(message);
    }

    async signUserOut(): Promise<any> {
        return await this.firebaseManager.signUserOut();
    }
}

export const messageHandlers = new MessageHandlers();