import * as lc from "../constants";
import { BrowserUtils, browserUtils as lbu } from "./browserUtils";
import { messageHandlers as lmh, MessageHandlers } from "./messageHandlers";

export class InstallHandlers {
    constants: typeof lc;
    browserUtils: BrowserUtils;
    messageHandlers: MessageHandlers;

    constructor(constants: typeof lc = lc, browserUtils: BrowserUtils = lbu, messageHandlers: MessageHandlers = lmh) {
        this.constants = constants;
        this.browserUtils = browserUtils;
        this.messageHandlers = messageHandlers;
    }

    async handleInstalled(): Promise<void> {
        if (this.browserUtils.getBrowserInfo().isChrome || this.browserUtils.getBrowserInfo().isEdge) {
            await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        }
        chrome.tabs.create({ url: `${this.constants.WEB_HOST}/learn` });
    }

    async handleUpdated(): Promise<void> {
        if (this.browserUtils.getBrowserInfo().isChrome || this.browserUtils.getBrowserInfo().isEdge) {
            await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        }
        const token = await this.messageHandlers.getUserToken();
        if (!token) {
            await chrome.storage.local.clear()
            chrome.tabs.create({ url: `${this.constants.WEB_HOST}/learn` });
        }
    }
}

export const installHandlers = new InstallHandlers();