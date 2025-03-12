import { ReadefineUtils } from "./ReadefineUtils";
import { TextItemManager } from "./TextItemManager";

export class PageTextUpdater {
    private parser: DOMParser;
    private textItemManager: TextItemManager;
    private utils: ReadefineUtils;
    readefinitionsList: Record<string, { original: string; target: string }> = {};
    readefineMode: string = 'reading';

    constructor(textItemManager: TextItemManager, utils: ReadefineUtils) {
        this.parser = new DOMParser();
        this.textItemManager = textItemManager;
        this.utils = utils;
    }

    replaceContentEditableSelection(range: any, replacementContent: any) {
        const doc = this.parser.parseFromString(replacementContent, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        range.deleteContents();
        range.insertNode(fragment);
    }
  
    replaceRegularSelection(range: any, replacementContent: any) {
      const doc = this.parser.parseFromString(replacementContent, 'text/html');
      const fragment = document.createDocumentFragment();
      Array.from(doc.body.childNodes).forEach(node => {
          fragment.appendChild(node.cloneNode(true));
      });
      range.deleteContents();
      range.insertNode(fragment);
    }

    public updatePageText(
        serviceWorkerResponse: ServiceWorkerResponse
    ): void {
        this.readefinitionsList = Object.assign(this.readefinitionsList, serviceWorkerResponse.readefinitionsList);
        this.readefineMode = serviceWorkerResponse.readefineMode;
        const updatedNodes: any = serviceWorkerResponse.updatedNodes || {};
        for (let i = 0; i < this.textItemManager.textItems.length; i++) {
            const node = this.textItemManager.textItems[i];
            if (updatedNodes[i] && updatedNodes[i].uid === this.utils.generateUID(node)) {
                const original = updatedNodes[i]['readingHTML'];
                const target = updatedNodes[i]['learningHTML'];
                const show = this.readefineMode === 'reading' ? original : target;
                let doc = this.parser.parseFromString(show, 'text/html');
                let fragment = document.createDocumentFragment();
                const childNodes = Array.from(doc.body.childNodes);
                for (const childNode of childNodes) {
                    fragment.appendChild(childNode.cloneNode(true));
                }

                // @ts-expect-error TS(2531): Object is possibly 'null'.
                const leadingSpaces = /^\s*/.exec(show)[0];
                if (leadingSpaces.length > 0) {
                    const spaceNode = document.createTextNode(leadingSpaces);
                    fragment.insertBefore(spaceNode, fragment.firstChild);
                }

                (node as Element).replaceWith(...fragment.childNodes);
            }
        }
    }
}