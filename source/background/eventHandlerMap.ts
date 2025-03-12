/// <reference lib="webworker" />
import { AuthManager, authManager as lam } from "./authManager";
import { BrowserUtils, browserUtils as lbu } from "./browserUtils";
import { installHandlers as lih, InstallHandlers } from "./installHandlers";
import { MessageHandlers, messageHandlers as lmh } from "./messageHandlers";

export class EventHandlerMap {
    authManager: AuthManager;
    browserUtils: BrowserUtils;
    installHandlers: InstallHandlers;
    messageHandlers: MessageHandlers;

    constructor(
            authManager: AuthManager = lam,
            browserUtils: BrowserUtils = lbu,
            installHandlers: InstallHandlers = lih,
            messageHandlers: MessageHandlers = lmh
        ) {
        this.authManager = authManager;
        this.browserUtils = browserUtils;
        this.installHandlers = installHandlers;
        this.messageHandlers = messageHandlers;
    }

    async handleInstalled(details: chrome.runtime.InstalledDetails): Promise<void> {
        switch (details.reason) {
            case 'install': return this.installHandlers.handleInstalled();
            case 'update': return await this.installHandlers.handleUpdated();
        }
    }

    async handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
        switch (message.swaction) {
            case 'GET_USER_LOGGED_IN_STATUS': return await this.messageHandlers.getUserLoggedInStatus();
            case 'READEFINE_NODES': return await this.messageHandlers.readefineNodes(message);
            case 'REREADEFINE_TABS': return await this.messageHandlers.reReadefineTabs();
            case 'READEFINE_CURRENT_SELECTION': return await this.messageHandlers.readefineCurrentSelection(message);
            case 'SEND_MESSAGE_VIA_BG': return await this.messageHandlers.sendMessageViaBg(message);
            case 'RECREATE_SELECTION_VIA_BG': return await this.messageHandlers.recreateSelectionViaBg(message);
            case 'UPDATE_READEFINE_AI': return await this.messageHandlers.updateReadefineAI(message);
            case 'OPEN_SETTINGS': return await this.messageHandlers.openSettings();
            case 'OPEN_ACCOUNT_URL': return await this.messageHandlers.openAccountUrl();
            case 'GET_READEFINE_AI_DETAILS': return await this.messageHandlers.getReadefineAIDetails();
            case 'GET_USER_STATE': return await this.messageHandlers.getUserState();
            case 'GET_USER_TOKEN': return await this.messageHandlers.getUserToken();
            case 'SIGN_USER_IN': return await this.messageHandlers.signUserIn(message);
            case 'SIGN_USER_OUT': return await this.messageHandlers.signUserOut();
        }
    }

    async handleActionClicked(tab: chrome.tabs.Tab): Promise<void> {
        const { isFirefox } = this.browserUtils.getBrowserInfo();
        if (isFirefox) {
            // @ts-ignore
            chrome.sidebarAction.toggle();
        }
    }

    async handleExternalMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
        switch (true) {
            case message.checkReadefineWithPermissions: return await this.messageHandlers.checkReadefineWithPermissions();
            case message.otp: return await this.messageHandlers.storeOtp(message);
            case message.signOut: return await this.messageHandlers.signOut();
            case message.openInAppPurchases: return await this.messageHandlers.openInAppPurchases(message);
        }
    }
}

export const eventHandlerMap = new EventHandlerMap();