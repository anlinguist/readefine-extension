// TextItemManager.ts
import { ReadefineUtils } from "./ReadefineUtils";

export class TextItemManager {
    public textItems: Node[] = [];
    readefineUtils: ReadefineUtils;
    walker: TreeWalker;

    constructor(readefineUtils: ReadefineUtils) {
        this.readefineUtils = readefineUtils;
        this.walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, this.acceptNode);
    }

    acceptNode(node: any) {
        const ignoredSelectors = '.readefiningAWord,.readefiningAWord *,.readefine-loader-pd-container,.readefine-loader-pd-container *,#readefine-something-new-tt,#readefine-something-new-tt *,[data-readefine_tooltip-root],[data-readefine_tooltip-root] *,noscript,noscript *,code,code *,input,input *,script,script *,style,style *,.textareawrapper,.textareawrapper *,.blockeditor,.blockeditor *,.editor,.editor *,.block-editor,.block-editor *,#textareawrapper,#textareawrapper *,.textarea,.textarea *,#textarea,#textarea *,[contenteditable="true"],[contenteditable="true"] *,[role="button"],[role="button"] *,textarea,textarea *,text,text *,.textareawrapper,.textareawrapper *,iframe,iframe *,#hl2rdfn,#hl2rdfn *';
        if ((node.nodeType === Node.ELEMENT_NODE) && (node.parentElement.matches(ignoredSelectors) || node.parentElement.matches(ignoredSelectors))) {
            return NodeFilter.FILTER_REJECT;
        }
        if (node.nodeType === Node.TEXT_NODE && node.parentElement.matches(ignoredSelectors)) {
            return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
    }

    collectTextNodes() {
        this.textItems = [];
        this.walker.currentNode = document.body;
        while (this.walker.nextNode()) {
            if (this.walker.currentNode.nodeType === Node.TEXT_NODE && this.walker.currentNode.nodeValue?.trim() !== '') {
                this.textItems.push(this.walker.currentNode);
            }
        }
    }
}