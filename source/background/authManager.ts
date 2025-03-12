import * as lc from "../constants";

export class AuthManager {
    constants: typeof lc;
    constructor(constants: typeof lc = lc) {
        this.constants = constants;
    };

    async signUserOut(): Promise<void> {
        let { promptedLogin } = await chrome.storage.session.get();
        if (promptedLogin) {
            await chrome.storage.local.clear();
            return;
        }
        await chrome.storage.local.clear();
        await chrome.storage.session.set({ promptedLogin: true });
        chrome.tabs.create({ url: `${this.constants.WEB_HOST}/learn` });
    };
}

export const authManager = new AuthManager();