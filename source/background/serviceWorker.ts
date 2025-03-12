import { eventHandlerMap as lehm, EventHandlerMap } from "./eventHandlerMap";

export class ServiceWorker {
  eventHandlerMap: EventHandlerMap;
  constructor(eventHandlerMap: EventHandlerMap = lehm) {
    this.eventHandlerMap = eventHandlerMap;
  };

  async handleReadefineInstalled(details: chrome.runtime.InstalledDetails) {
    await this.eventHandlerMap.handleInstalled(details);
  };

  handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Boolean {
    if (!message.swaction) {
      return false;
    }
    (async () => {
      if (sender.id === chrome.runtime.id) {
        let response = await this.eventHandlerMap.handleMessage(message, sender);
        sendResponse(response);
      }
    })();
    return true;
  };

  handleActionClicked(tab: chrome.tabs.Tab) {
    this.eventHandlerMap.handleActionClicked(tab);
  };

  handleExternalMessage(request: any, sender: any, sendResponse: any) {
    (async () => {
      if (sender.id !== chrome.runtime.id) {
        let response = await this.eventHandlerMap.handleExternalMessage(request, sender);
        sendResponse(response);
      }
    })();
    return true;
  };
}

export const serviceWorker = new ServiceWorker();

chrome.action.onClicked.addListener(serviceWorker.eventHandlerMap.handleActionClicked.bind(serviceWorker.eventHandlerMap));
chrome.runtime.onInstalled.addListener(serviceWorker.handleReadefineInstalled.bind(serviceWorker));
chrome.runtime.onMessage.addListener(serviceWorker.handleMessage.bind(serviceWorker));
chrome.runtime.onMessageExternal.addListener(serviceWorker.handleExternalMessage.bind(serviceWorker));