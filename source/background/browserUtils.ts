export class BrowserUtils {
    constructor() {
    }

    getBrowserInfo() {
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
}

export const browserUtils = new BrowserUtils();