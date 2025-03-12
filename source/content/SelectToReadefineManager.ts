import { PageTextUpdater } from "./PageTextUpdater";

export class SelectToReadefineManager {
    button: SelectToReadefineButton | false = false;
    banner: SelectToReadefineDisabled | false = false;
    hl2rdfn: boolean = false;
    MAX_TEXT_LENGTH: number = 4000;
    SELECTION_CHANGE_TIMEOUT: number = 200;
    pageUpdater: PageTextUpdater;

    constructor(pageUpdater: PageTextUpdater) {
        this.initializeSelectToReadefine();
        this.pageUpdater = pageUpdater;
    }

    readefineSelection(operation: string, target: string) {
        this.recreateSelection();
        let selectedText = this.getSelectedText();
        if (selectedText.length > 0 && selectedText.length <= this.MAX_TEXT_LENGTH) {
            let bgPayload = {
                swaction: "READEFINE_CURRENT_SELECTION",
                text: selectedText,
                pageCount: document.querySelectorAll('.readefiningAWord').length,
                operation: operation,
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                isEditable: this.button.currentlySelectedRange?.isEditable ? true : false,
            }
            if (target) {
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                bgPayload['target'] = target
            }

            chrome.runtime.sendMessage(bgPayload, (response: any) => {
                if (this.button) {
                    this.replaceSelectedText(response, operation, target ? target : null);
                    this.button.remove();
                    // @ts-expect-error TS(2531): Object is possibly 'null'.
                    getSelection().empty();
                }
            });
        }
    }


    replaceSelectedText(responseData: any, operation: any, target: any) {
        if (responseData.exceededDailyLimit) return;
        if (responseData['readefinitions_list']) {
            for (let key in responseData['readefinitions_list']) {
                responseData['readefinitions_list'][key]['type'] = 'ai';
                responseData['readefinitions_list'][key]['aiOperation'] = operation;
                if (target) {
                    responseData['readefinitions_list'][key]['aiTarget'] = target;
                }
            }

            this.pageUpdater.readefinitionsList = Object.assign(this.pageUpdater.readefinitionsList, responseData['readefinitions_list']);
        }
        let replacementContent;
        if (responseData.readefineMode === "learning") {
            replacementContent = responseData.readefined_original_text;
        } else {
            replacementContent = responseData.readefined_target_text;
        }

        const sel = window.getSelection();

        // @ts-expect-error TS(2531): Object is possibly 'null'.
        if (sel.rangeCount) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            const range = sel.getRangeAt(0);
            const editableElem = this.getEditableElement(range.commonAncestorContainer);

            if (editableElem) {
                if (editableElem.nodeName === 'INPUT' || editableElem.nodeName === 'TEXTAREA') {
                    const start = editableElem.selectionStart;
                    const end = editableElem.selectionEnd;
                    editableElem.value = editableElem.value.slice(0, start) + replacementContent + editableElem.value.slice(end);
                    editableElem.setSelectionRange(start, start + replacementContent.length);
                } else if (this.isContentEditable(editableElem)) {
                    this.pageUpdater.replaceContentEditableSelection(range, replacementContent);
                }
            } else {
                this.pageUpdater.replaceRegularSelection(range, replacementContent);
            }
        }
    }

    async initializeSelectToReadefine() {
        let { hl2rdfn } = await chrome.storage.local.get();
        if (hl2rdfn || typeof hl2rdfn === "undefined") {
            this.hl2rdfn = true
        } else {
            this.hl2rdfn = false
        }
    }

    handleSelectionChange() {
        let timer: any = null;

        const handleSelectionChangeTimeout = async () => {
            clearTimeout(timer);

            timer = setTimeout(() => this.handleTimeout(), this.SELECTION_CHANGE_TIMEOUT);
        };

        if (this.hl2rdfn) {
            handleSelectionChangeTimeout();
        }
    }

    createButton() {
        this.button = new SelectToReadefineButton();
        this.button.appendToBody();
    }

    getEditableElement(node: any) {
        // First, check if the node or any of its ancestors is editable.
        let current = node;
        while (current) {
            if (this.isDirectlyEditable(current)) {
                return current;
            }
            current = current.parentNode;
        }

        // If not found, check the children of the node.
        return this.findEditableChild(node);
    }

    // @ts-expect-error TS(7023): 'findEditableChild' implicitly has return type 'an... Remove this comment to see the full error message
    findEditableChild(node: any) {
        if (this.isDirectlyEditable(node)) {
            return node;
        }

        for (let i = 0; i < node.childNodes.length; i++) {
            // @ts-expect-error TS(7022): 'editable' implicitly has type 'any' because it do... Remove this comment to see the full error message
            let editable = this.findEditableChild(node.childNodes[i]);
            if (editable) {
                return editable;
            }
        }

        return null;
    }

    isDirectlyEditable(node: any) {
        return node.isContentEditable || node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA';
    }

    storeSelection() {
        const selection = window.getSelection();
        if (this.button) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            if (selection.rangeCount > 0) {
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                let range = selection.getRangeAt(0);
                let startEditableElement = this.getEditableElement(range.startContainer);
                let endEditableElement = this.getEditableElement(range.endContainer);

                if (startEditableElement || endEditableElement) {
                    if (startEditableElement === endEditableElement) {
                        // If the editable element is an INPUT or TEXTAREA
                        if (startEditableElement.nodeName === 'INPUT' || startEditableElement.nodeName === 'TEXTAREA') {
                            this.button.currentlySelectedRange = {
                                isEditable: true,
                                element: startEditableElement,
                                start: startEditableElement.selectionStart,
                                end: startEditableElement.selectionEnd
                            };
                        } else { // If it's a contentEditable element
                            let startNode = range.startContainer;
                            let endNode = range.endContainer;

                            // You don't have to ascend to the parent node now.
                            // Let's keep the text nodes as they are.

                            this.button.currentlySelectedRange = {
                                isEditable: true,
                                element: startEditableElement,
                                startContainer: startNode,
                                startOffset: range.startOffset,
                                endContainer: endNode,
                                endOffset: range.endOffset
                            };
                        }
                    } else {
                        // Selection spans multiple editable elements, store as non-editable for simplicity
                        // Or implement custom logic to handle this rare scenario
                        let startNode = range.startContainer;
                        let endNode = range.endContainer;

                        this.button.currentlySelectedRange = {
                            isEditable: true,
                            element: startEditableElement,
                            startContainer: startNode,
                            startOffset: range.startOffset,
                            endContainer: endNode,
                            endOffset: range.endOffset
                        };
                    }
                } else {
                    this.button.currentlySelectedRange = range.cloneRange();
                }
            } else {
                this.button.currentlySelectedRange = null;
            }
        }
    }

    recreateSelection() {
        if (this.button && this.button.currentlySelectedRange) {
            const sel = window.getSelection();
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            sel.removeAllRanges();

            const range = new Range();

            if (this.button.currentlySelectedRange.isEditable) {
                const element = this.button.currentlySelectedRange.element;

                if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
                    element.focus();
                    element.setSelectionRange(
                        this.button.currentlySelectedRange.start,
                        this.button.currentlySelectedRange.end
                    );
                } else if (this.isContentEditable(element)) {
                    element.focus();

                    let startNode = this.button.currentlySelectedRange.startContainer;
                    let endNode = this.button.currentlySelectedRange.endContainer;

                    range.setStart(startNode, this.button.currentlySelectedRange.startOffset);
                    range.setEnd(endNode, this.button.currentlySelectedRange.endOffset);

                    // @ts-expect-error TS(2531): Object is possibly 'null'.
                    sel.addRange(range);
                }
            } else {

                // For non-editable content
                range.setStart(this.button.currentlySelectedRange.startContainer, this.button.currentlySelectedRange.startOffset);
                range.setEnd(this.button.currentlySelectedRange.endContainer, this.button.currentlySelectedRange.endOffset);

                // @ts-expect-error TS(2531): Object is possibly 'null'.
                sel.addRange(range);
            }
        }
    }

    isContentEditable(element: any) {
        while (element) {
            if (element.contentEditable === "true") {
                return true;
            } else if (element.contentEditable === "false") {
                return false;
            }
            element = element.parentElement;
        }
        return false;
    }

    isEditable(node: any) {
        if (node.nodeType === 1) {
            return node.isContentEditable || node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA';
        } else if (node.nodeType === 3) {
            return node.parentNode && (node.parentNode.isContentEditable || node.parentNode.nodeName === 'INPUT' || node.parentNode.nodeName === 'TEXTAREA');
        }
        return false;
    }

    async handleTimeout() {
        const selectedText = this.getSelectedText().trim();
        const selection = window.getSelection();
        let range = null;
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        if (selection.rangeCount > 0) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            range = selection.getRangeAt(0);
        }

        // @ts-expect-error TS(2531): Object is possibly 'null'.
        if (!selectedText || !selection.rangeCount || !range) {
            return this.hideSelectToReadefine();
        }

        if (selectedText.length > this.MAX_TEXT_LENGTH) {
            // send message to iframe
            try {
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                const iframeWindow = document.querySelector('#hl2rdfn').contentWindow;

                // Send the message
                iframeWindow.postMessage({ type: 'SELECTION_OVER_LIMIT' }, '*');
            } catch (e) { }

            return this.showDisabledSelectToReadefineBanner();
        }

        return this.showSelectToReadefine(selectedText);
    }

    showSelectToReadefine(selectedText: any) {
        if (!this.button) {
            this.createButton();
        } else {
            this.storeSelection();
        }
        if (this.banner) {
            this.banner.remove();
            this.banner = false;
        }
    }

    hideSelectToReadefine() {
        if (this.button) {
            this.button.remove();
            this.button = false;
        }
        if (this.banner) {
            this.banner.remove();
            this.banner = false;
        }
        return
    }

    showDisabledSelectToReadefineBanner() {
        if (this.button) {
            this.button.remove();
            this.button = false;
        }
        if (!this.banner) {
            // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
            this.banner = new SelectToReadefineDisabled("Selection is too long.");
            this.banner.appendToBody();
        }
        return;
    }

    findShadowRoot(node: any) {
        while (node) {
            if (node.nodeType === 11) {
                return node;
            }

            if (node.host) {
                return node.host.shadowRoot;
            }

            node = node.parentNode || node.host;
        }
        return null;
    }

    getSelectedText(): string {
        var text: string = "";
        if (typeof window.getSelection !== "undefined") {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            text = window.getSelection().toString();
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
        } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
            // @ts-expect-error TS(2339): Property 'selection' does not exist on type 'Docum... Remove this comment to see the full error message
            text = document.selection.createRange().text;
        }
        return text;
    }
}


class SelectToReadefine {
    iframe: any;
    currentlySelectedRange: any;
    constructor() {
        this.remove = this.remove.bind(this);
    }

    appendToBody() {
        this.iframe = document.createElement('iframe');
        this.iframe.id = "hl2rdfn";
        this.iframe.src = chrome.runtime.getURL('select-to-readefine/build/index.html');
        this.iframe.style.border = 'none';
        document.body.appendChild(this.iframe);
    }

    remove() {
        let iframeElem = document.getElementById("hl2rdfn");
        if (iframeElem) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            iframeElem.parentNode.removeChild(iframeElem);
        }
    }
}

class SelectToReadefineButton extends SelectToReadefine {
    constructor() {
        super();
    }
}

class SelectToReadefineDisabled extends SelectToReadefine {
    constructor() {
        super();
    }
}