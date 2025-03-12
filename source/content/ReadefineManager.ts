import { PageTextUpdater } from "./PageTextUpdater";
import { ReadefineUtils } from "./ReadefineUtils";
import { SelectToReadefineManager } from "./SelectToReadefineManager";
import { ServiceWorkerCommunicator } from "./ServiceWorkerCommunicator";
import { TextItemManager } from "./TextItemManager";
import { TooltipManager } from "./TooltipManager";

export class ReadefineManager {
    private readefineUtils: ReadefineUtils;
    private textItemManager: TextItemManager;
    private pageUpdater: PageTextUpdater;
    private swCommunicator: ServiceWorkerCommunicator;
    private tooltipManager: TooltipManager;
    private selectToReadefineManager: SelectToReadefineManager;
    private status: boolean = false;
    private observer: MutationObserver | null = null;
    private debouncedProcessMutations: () => void;

    private boundHandleSelectionChange: () => void;

    constructor(
        utils = new ReadefineUtils(),
        textItemManager = new TextItemManager(utils),
        pageUpdater = new PageTextUpdater(textItemManager, utils),
        swCommunicator = new ServiceWorkerCommunicator(textItemManager, pageUpdater),
        tooltipManager = new TooltipManager(pageUpdater),
        selectToReadefineManager = new SelectToReadefineManager(pageUpdater)
    ) {
        this.initializeStatus();
        this.readefineUtils = utils;
        this.pageUpdater = pageUpdater;
        this.textItemManager = textItemManager;
        this.swCommunicator = swCommunicator;
        this.tooltipManager = tooltipManager;
        this.selectToReadefineManager = selectToReadefineManager;
        this.boundHandleSelectionChange = this.selectToReadefineManager.handleSelectionChange.bind(this.selectToReadefineManager);

        this.handleCopy = this.handleCopy.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.hideRDFNSettings = this.hideRDFNSettings.bind(this);
        this.openIFrameHandler = this.openIFrameHandler.bind(this);
        this.openReadefineiFrame = this.openReadefineiFrame.bind(this);

        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.attachEventListeners();

        this.debouncedProcessMutations = this.debounce(() => this.processTextItems(), 500);
        this.initObserver();
    }

    attachEventListeners() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener('copy', this.handleCopy);
        document.addEventListener('mouseover', this.handleMouseOver);
        document.addEventListener("selectionchange", this.boundHandleSelectionChange);
        this.setupExtensionListener();
    }

    setupExtensionListener() {
        chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
            switch (message.type) {
                case 'REREADEFINE_TABS': {
                    this.rereadefine();
                    sendResponse({ rereadefined_page: true });
                    break;
                }
                case 'READEFINE_SELECTION': {
                    this.selectToReadefineManager.readefineSelection(message.operation, message.value);
                    break;
                }
                case 'READEFINE_RECREATE_SELECTION': {
                    this.selectToReadefineManager.recreateSelection();
                    break;
                }
                case 'UPDATE_READEFINE_AI': {
                    this.selectToReadefineManager.hl2rdfn = message.val;
                    break;
                }
                case 'OPEN_READEFINE_SETTINGS': {
                    this.openIFrameHandler('editreadefineai');
                    break;
                }
            }
        }
        );
    }

    removeEventListeners() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener('copy', this.handleCopy);
        document.removeEventListener('mouseover', this.handleMouseOver);
        document.removeEventListener("selectionchange", this.boundHandleSelectionChange);
    }

    handleCopy(event: any) {
        const sel = document.getSelection();
        if (!sel) return;

        const range = sel.getRangeAt(0);
        const candidates = document.querySelectorAll('.readefiningAWord');
        let clipboardCandidates: {
            [key: number]: {
                theText: ChildNode;
                originalCandidate: Node;
            }
        } = {};

        candidates.forEach((candidate, index) => {
            if (sel.containsNode(candidate, true)) {
                const originalText = this.pageUpdater.readefinitionsList[candidate.id.replace("readefinition", "")]['original'];
                const theText = candidate.childNodes[0];
                const originalCandidate = candidate.cloneNode(true);

                clipboardCandidates[index] = {
                    theText,
                    originalCandidate
                };

                candidate.replaceWith(theText);
                theText.textContent = originalText;
            }
        });

        const newRange = document.createRange();
        newRange.setStart(range.startContainer, range.startOffset);
        newRange.setEnd(range.endContainer, range.endOffset);

        sel.removeAllRanges();
        sel.addRange(newRange);
    }

    rereadefine() {
        const candidates = document.querySelectorAll('.readefiningAWord');
        candidates.forEach((candidate, index) => {
            const originalText = this.pageUpdater.readefinitionsList[candidate.id.replace("readefinition", "")]['original'];
            const theText = candidate.childNodes[0];
            candidate.replaceWith(theText);
            theText.textContent = originalText;
        });
    }

    hideRDFNSettings(e: any) {
        console.log("hiding settings");
        var element = document.getElementById("rdfn-iframe");
        if (
            element &&
            e.target !== element &&
            !element.contains(e.target) &&
            !e.target.classList.contains("readefine-definition-visible") &&
            e.target.id !== "rdfn_expand_out" &&
            e.target.id !== "rdfn_expand_in"
        ) {
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            document.getElementById("rdfn-iframe").style.animationName = "rdfncontentout";
            document.removeEventListener("click", this.hideRDFNSettings);
            setTimeout(function () {
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                element.remove();
            }, 500);
        }
    }

    openIFrameHandler(which_frame: any) {
        if (document.querySelector("#rdfn-iframe")) {
            console.log("removing iframe");
            setTimeout(() => {
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                document.getElementById("rdfn-iframe").style.animationName = "rdfncontentout";
                document.removeEventListener("click", this.hideRDFNSettings);
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                document.querySelector("#rdfn-iframe").remove();
                this.openReadefineiFrame(which_frame);
                document.addEventListener("click", this.hideRDFNSettings);
            }, 500);
        } else {
            console.log("directly opening iframe");
            this.openReadefineiFrame(which_frame);
            document.addEventListener("click", this.hideRDFNSettings);
        }
    }

    openReadefineiFrame(selected: any) {
        var iframe = document.createElement("iframe");
        if (selected === "settings") {
            iframe.src = chrome.runtime.getURL("/popup/index.html#/?modal=settings&context=contentScript");
        } else if (selected === "edit-readefinition") {
            let send_original
            let send_target
            let send_definition
            let send_link
            send_original = this.tooltipManager.hoveredData['original']
            send_target = this.tooltipManager.hoveredData['target']
            if (!this.tooltipManager.hoveredData['definition'] || this.tooltipManager.hoveredData['definition'] === "false") {
                send_definition = ''
            }
            else {
                send_definition = this.tooltipManager.hoveredData['definition']
            }
            if (!this.tooltipManager.hoveredData['link'] || this.tooltipManager.hoveredData['link'] === "false") {
                send_link = ''
            }
            else {
                send_link = this.tooltipManager.hoveredData['link']
            }
            let dt = 'personal-dictionary';
            let params = {
                original: send_original,
                target: send_target,
                definition: send_definition,
                link: send_link
            }
            var queryString = JSON.stringify(params)
            iframe.src = chrome.runtime.getURL(`/popup/index.html#/${dt}${dt === 'personal-dictionary' ? '/' : ('/' + this.tooltipManager.hoveredData['dictionary'] + '/')}?modal=edit-readefinition&context=contentScript&wordObj=${queryString}`)
        } else if (selected === "editreadefineai") {
            iframe.src = chrome.runtime.getURL("/popup/index.html#/pro?context=contentScript");
        }
        console.log("adding iframe");

        iframe.id = "rdfn-iframe";
        document.body.appendChild(iframe);
        iframe.style.animationName = "rdfncontentin";
    }

    handleClick = (e: any) => {
        if (e.target.matches('#edit_readefinition')) {
            this.openIFrameHandler('edit-readefinition');
            return
        }

        if (e.target.matches('#readefine_settings')) {
            this.openIFrameHandler('settings');
            return
        }

        if (e.target.closest('#rdfn_def_visible')) {
            var rdfnDefApp = document.getElementById("rdfnDefAppearance");
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            rdfnDefApp.classList.toggle('expanded-rdfn-def');

            var rdfnExpandOut = document.getElementById('rdfn_expand_out');
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            rdfnExpandOut.classList.toggle('expanded-rdfn-def');

            var rdfnExpandIn = document.getElementById('rdfn_expand_in');
            // @ts-expect-error TS(2531): Object is possibly 'null'.
            rdfnExpandIn.classList.toggle('expanded-rdfn-def');
            return
        }
    }

    handleMouseOver(e: any) {
        const target = e.target.closest('.readefiningAWord');
        if (!target) return;
        if (e.target.classList.contains("lp")) {
            return;
        }
        this.tooltipManager.showTooltipOn(e.target);
    }

    private initObserver() {
        const config: MutationObserverInit = {
            childList: true,
            subtree: true,
            characterData: true
        };

        this.observer = new MutationObserver((mutationsList) => {
            if (!this.status) {
                return;
            }
            this.debouncedProcessMutations();
        });

        this.observer.observe(document.body, config);
    }

    async initializeStatus() {
        const { status = true } = await chrome.storage.local.get();
        this.status = status;
    }

    private processTextItems() {
        if (!this.status) {
            return;
        }
        this.textItemManager.collectTextNodes();

        if (this.textItemManager.textItems.length === 0) {
            return;
        }

        const pageData = this.createPageData();

        if (Object.keys(pageData).length === 0) {
            return;
        }

        this.swCommunicator.sendNodesForReadefinition(pageData);
    }

    private createPageData(): { [key: string]: { text: string | null; uid: string } } {
        const data: { [key: string]: { text: string | null; uid: string } } = {};

        this.textItemManager.textItems.forEach((node: any, index: any) => {
            data[index] = {
                text: node.nodeValue,
                uid: this.readefineUtils.generateUID(node)
            };
        });

        return data;
    }

    debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number,
        immediate = false
    ): (...args: Parameters<T>) => void {
        let timeout: number | undefined;
        return function (this: any, ...args: any[]) {
            const context = this;
            const later = () => {
                timeout = undefined;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            const callNow = immediate && timeout === undefined;
            if (timeout !== undefined) {
                clearTimeout(timeout);
            }
            timeout = window.setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }
}