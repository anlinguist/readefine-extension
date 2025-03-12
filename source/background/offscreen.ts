/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

export class Offscreen {
    OFFSCREEN_DOCUMENT_PATH: string;
    creating: boolean | Promise<void>;

    constructor() {
        this.OFFSCREEN_DOCUMENT_PATH = '/pages/auth.html';
        this.creating = false;
    };

    async hasDocument() {

        const matchedClients = await self.clients.matchAll();

        return matchedClients.some(
            (c: any) => c.url === chrome.runtime.getURL(this.OFFSCREEN_DOCUMENT_PATH)
        );
    };

    async setupOffscreenDocument(path: string) {
        if (!(await this.hasDocument())) {
            if (this.creating) {
                await this.creating;
            } else {
                this.creating = chrome.offscreen.createDocument({
                    url: path,
                    reasons: [
                        chrome.offscreen.Reason.DOM_SCRAPING
                    ],
                    justification: 'authentication'
                });
                await this.creating;
                this.creating = false;
            }
        }
    };

    async closeOffscreenDocument() {
        if (!(await this.hasDocument())) {
            return;
        }
        await chrome.offscreen.closeDocument();
    }
}

export const offscreen = new Offscreen();