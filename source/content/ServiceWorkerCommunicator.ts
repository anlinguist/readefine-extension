import { TextItemManager } from "./TextItemManager";
import { PageTextUpdater } from "./PageTextUpdater";

export class ServiceWorkerCommunicator {
    private textItemManager: TextItemManager;
    private pageUpdater: PageTextUpdater;

    constructor(textItemManager: TextItemManager, pageUpdater: PageTextUpdater) {
        this.textItemManager = textItemManager;
        this.pageUpdater = pageUpdater;
    }

    public async sendNodesForReadefinition(payload: any): Promise<void> {
        const response: ServiceWorkerResponse = await chrome.runtime.sendMessage({
            swaction: "READEFINE_NODES",
            sendData: {
                pagehost: window.location.host,
                pagedata: payload,
                locale: navigator.language,
            },
        });
        if (response) {
            this.pageUpdater.updatePageText(response);
        } else {
            throw new Error("No response from service worker");
        }
    }
}