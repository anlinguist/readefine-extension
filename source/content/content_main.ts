class SelectToReadefine {
  iframe: any;
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

class Readefine {
  MAX_TEXT_LENGTH: any;
  SELECTION_CHANGE_TIMEOUT: any;
  ba: any;
  banner: any;
  button: any;
  checkTextItemsIsRunning: any;
  clipboardCandidates: any;
  copyTimeout: any;
  currsel: any;
  fa: any;
  hl2rdfn: any;
  hoveredData: any;
  instances: any;
  parser: DOMParser;
  readefineLogoImage: any;
  readefineMode: any;
  readefinitionsList: any;
  status: any;
  textItems: any;
  tooltip: any;
  walker: any;
  private observer: MutationObserver | null = null;
  private debouncedProcessMutations: () => void;

  constructor() {
    this.readefineLogoImage = chrome.runtime.getURL("assets/testicon.png");
    this.checkTextItemsIsRunning = false;
    this.initializeStatus();
    this.textItems = [];
    this.readefinitionsList = {};
    this.readefineMode = "";
    this.tooltip = null;
    this.instances = [];
    this.parser = new DOMParser();
    this.hoveredData = {};
    this.currsel = "";
    this.button = false;
    this.banner = false;
    this.handleCopy = this.handleCopy.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.hideRDFNSettings = this.hideRDFNSettings.bind(this);
    this.openIFrameHandler = this.openIFrameHandler.bind(this);
    this.openReadefineiFrame = this.openReadefineiFrame.bind(this);
    this.getSelectedText = this.getSelectedText.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.fa = this.createStyleElement('@font-face { font-family: "RDFN Material Icons"; src: url("' + chrome.runtime.getURL('assets/google_fonts.woff2') + '"); }');
    this.ba = this.createStyleElement('@font-face { font-family: "RDFN Roboto-Light"; src: url("' + chrome.runtime.getURL('assets/Roboto-Light.ttf') + '"); }');
    this.walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, this.acceptNode);
    this.clipboardCandidates = {};
    this.copyTimeout = null;

    this.SELECTION_CHANGE_TIMEOUT = 200;
    this.MAX_TEXT_LENGTH = 1000;
    this.debouncedProcessMutations = this.debounce(() => this.processTextItems(), 500);
    this.initObserver();
    chrome.runtime.onMessage.addListener(this.messageHandler.bind(this));
  }

  private sendPageData(pageData: { [key: string]: { text: string | null; uid: string } }) {
    const payload = {
      pageData: pageData,
      pageHost: window.location.host,
      pagecount: document.querySelectorAll('.readefiningAWord').length
    };

    chrome.runtime.sendMessage({
      swaction: "READEFINE_NODES",
      sendData: JSON.stringify(payload)
    }).then((response: any) => {
      this.updatePageText(response.text);
    }).catch((error: any) => {
      console.error('Error sending message:', error);
    });
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

  public disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
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

  private processTextItems() {
    if (!this.status) {
      return;
    }
    // Gather current text nodes
    this.collectTextNodes();

    if (this.textItems.length === 0) {
      return;
    }

    const pageData = this.createPageData();

    if (Object.keys(pageData).length === 0) {
      return;
    }

    this.sendPageData(pageData);
  }

  private createPageData(): { [key: string]: { text: string | null; uid: string } } {
    const data: { [key: string]: { text: string | null; uid: string } } = {};

    this.textItems.forEach((node: any, index: any) => {
      data[index] = {
        text: node.nodeValue,
        uid: this.generateUID(node)
      };
    });

    return data;
  }

  private collectTextNodes() {
    this.textItems = [];
    this.walker.currentNode = document.body;
    while (this.walker.nextNode()) {
      if (this.walker.currentNode.nodeType === Node.TEXT_NODE && this.walker.currentNode.nodeValue.trim() !== '') {
        this.textItems.push(this.walker.currentNode);
      }
    }
  }

  messageHandler(message: any, sender: any, sendResponse: any) {
    switch (message.type) {
      case 'READEFINE_SELECTION': {
        this.recreateSelection();
        const operation = message.operation;
        const target = message.value;
        let selectedText = this.getSelectedText();
        if (selectedText.length > 0 && selectedText.length <= this.MAX_TEXT_LENGTH) {
          let bgPayload = {
            swaction: "READEFINE_CURRENT_SELECTION",
            text: selectedText,
            pageCount: document.querySelectorAll('.readefiningAWord').length,
            operation: operation,
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
        break;
      }
      case 'READEFINE_RECREATE_SELECTION': {
        this.recreateSelection();
        break;
      }
      case 'UPDATE_READEFINE_AI': {
        this.hl2rdfn = message.val;
        break;
      }
      case 'OPEN_READEFINE_SETTINGS': {
        this.openIFrameHandler('editreadefineai');
        break;
      }
    }
  }

  async initializeStatus() {
    const { status = true, hl2rdfn } = await chrome.storage.local.get();
    this.status = status;
    if (hl2rdfn ||  typeof hl2rdfn === "undefined") {
      this.hl2rdfn = true
    } else {
      this.hl2rdfn = false
    }
  }

  handleMouseOver(e: any) {
    const target = e.target.closest('.readefiningAWord');
    if (!target) return;
    if (e.target.classList.contains("lp")) {
      return;
    }
    if (this.tooltip) {
      // @ts-expect-error TS(2304): Cannot find name 'readefine_tooltip'.
      readefine_tooltip.hideAll();
    }
    this.instances.forEach((instance: any) => {
      instance.destroy();
    });
    this.instances.length = 0;
    this.tooltip = this.createTooltip(e.target);
    this.tooltip.show();
    this.instances = this.instances.concat(this.tooltip);
  }

  createTooltip(target: any) {
    // @ts-expect-error TS(2304): Cannot find name 'readefine_tooltip'.
    return readefine_tooltip(target, this.getTooltipOptions(target));
  }

  getTooltipOptions(target: any) {
    return {
      content: (reference: any) => this.getTooltipContent(reference),
      allowHTML: true,
      interactive: true,
      animation: 'shift-away',
      theme: 'readefine',
      appendTo: document.body,
      interactiveBorder: 10,
      inlinePositioning: true,
      hideOnClick: false,
      zIndex: 9999999999,
      onHidden(instance: any) {
        instance.destroy()
        var elements = document.querySelectorAll(".newdivinstances");
        for (var i = 0; i < elements.length; i++) {
          elements[i].remove();
        }
      }
    };
  }

  getTooltipContent(reference: any) {
    let id = reference.id.replace("readefinition", "");
    let data = this.readefinitionsList[id];
    if (!data) return;
    
    this.formatHoveredData(data);
    this.hoveredData['show'] = this.readefineMode === "reading" ? this.hoveredData['original'] : this.hoveredData['target'];
    // @ts-expect-error TS(2339): Property 'dictionaryName' does not exist on type '... Remove this comment to see the full error message
    let {dictionaryName, dictionaryLink, disableDictLink} = this.formatDictionaryName();
    this.hoveredData['dictionaryName'] = dictionaryName;
    this.hoveredData['dictionaryLink'] = dictionaryLink;
    this.hoveredData['disableDictLink'] = disableDictLink;
    this.formatDefinitionStatus();
    this.formatLinkStatus();
    
    return this.generateHTMLContent();
  }

  formatHoveredData(data: any) {
    this.hoveredData = {
      original: data['original'],
      target: data['target'],
      definition: (data['definition'] && data['definition'] !== "false" && data['definition'] !== 'undefined') ? data['definition'] : false,
      dictionary: data['dictionary'],
      link: (data['link'] && data['link'] !== "false") ? data['link'] : false,
      type: data['type'],
      mode: this.readefineMode
    }
  
    if (this.readefineMode === "reading") {
      this.hoveredData['show'] = data['original'];
    }
    else {
      this.hoveredData['show'] = data['target'];
    }

    if (data['aiOperation']) {
      this.hoveredData['aiOperation'] = data['aiOperation'];
    }
    if (data['aiTarget']) {
      this.hoveredData['aiTarget'] = data['aiTarget'];
    }
  }

  formatDictionaryName() {
    let dictionaryProperties = {};
  
    switch (this.hoveredData['type']) {
      case "main":
        dictionaryProperties = {
          dictionaryName: "Readefine Dictionary",
          dictionaryLink: "",
          disableDictLink: 'disabledictlink'
        };
        break;
  
      case "user":
        dictionaryProperties = {
          dictionaryName: "Personal Dictionary",
          dictionaryLink: "https://app.readefine.ai/personal-dictionary",
          disableDictLink: ''
        };
        break;
  
      case "community":
        dictionaryProperties = {
          dictionaryName: this.hoveredData['dictionary'] + " Community Dictionary",
          dictionaryLink: `https://app.readefine.ai/community-dictionaries/${this.hoveredData['dictionary']}`,
          disableDictLink: ''
        };
        break;
  
      case 'location':
        let dictName = this.hoveredData['dictionary'] === "US" ? "UK to US Dictionary" : "US to UK Dictionary";
        dictionaryProperties = {
          dictionaryName: dictName,
          dictionaryLink: "",
          disableDictLink: 'disabledictlink'
        };
        break;
  
      case "team":
        dictionaryProperties = {
          dictionaryName: this.hoveredData['dictionary'] + " Team Dictionary",
          dictionaryLink: `https://app.readefine.ai/team-dictionaries/${this.hoveredData['dictionary']}`,
          disableDictLink: ''
        };
        break;

      case "ai":
        dictionaryProperties = {
          disableDictLink: 'disabledictlink'
        };
        break;
    }
    return dictionaryProperties;
  }

  generateAIContent() {
    const operationsTargets = {
      Simplify: ['Average Adults', 'ESL', 'Children', 'Boomers', 'Millenials', 'Gen Z'],
      Tone: ['friendly', 'professional', 'optimistic', 'pessimistic', 'angry', 'sad', 'happy', 'excited', 'bored', 'confused', 'scared', 'surprised', 'disgusted', 'neutral', 'sarcastic'],
      Summarize: [],
      Complexify: [],
      Translate: ['English', 'Spanish', 'Russian', 'Italian', 'French', 'Portuguese', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Polish', 'Romanian', 'Greek', 'Bulgarian', 'Czech', 'Danish', 'Finnish', 'Hebrew', 'Hungarian', 'Indonesian', 'Malay', 'Norwegian', 'Persian', 'Swedish', 'Thai', 'Ukrainian', 'Vietnamese', 'Old English', 'Classical Latin', 'Koine Greek', 'Ancient Hebrew'],
      Reword: ['a pirate', 'a love letter', 'a sci-fi novel', 'a mob boss', 'Yoda', 'Shakespeare', 'a western cowboy', 'a film noir detective'],
      Convert: ['Imperial', 'Metric', 'Celsius', 'Fahrenheit']
    };

    const operation = this.hoveredData['aiOperation'];
    const target = this.hoveredData['aiTarget'];

      return `Readefine AI reworded this text using the ${operation} style${target ? ` with the ${target} target` : ""}.`;
}

  generateHTMLContent() {
    let editFolder = "";
    let aiContent = "";

    if (this.hoveredData['type'] === "ai") {
      aiContent = this.generateAIContent();
    }
  
    if (this.hoveredData['dictionaryName'] && this.hoveredData['dictionaryName'] != "Readefine Dictionary" && this.hoveredData['dictionaryName'] != 'UK to US Dictionary' && this.hoveredData['dictionaryName'] != 'US to UK Dictionary') {
      editFolder = '<a title="' + this.hoveredData['dictionaryName'] + '" target="_blank" class="' + this.hoveredData['disableDictLink'] + '" href="' + this.hoveredData['dictionaryLink'] + '" id="readefine-dictionary-name">\
                      <span class="dict_class">&#xe2c7;</span>\
                    </a>'
    }
  
    let htmlContent = '<div id="readefine-original-word">' + this.hoveredData['show'] + '</div><div id="rdfn-tooltip">';
    
    if (aiContent) {
      htmlContent += '<div id="readefine-ai-content">' + aiContent + '</div>';
    }
    htmlContent += '\
      <div id="' + this.hoveredData['rdfnDef'] + '">\
        <div id="rdfnDefAppearance" class="' + this.hoveredData['rdfnDefAppearance'] + '">' + this.hoveredData['definition'] + '</div>\
        <div id="rdfn_expand_out" class="dict_class">&#xe5cf;</div>\
        <div id="rdfn_expand_in" class="dict_class">&#xe5ce;</div>\
      </div>\
      <a id="rdfn_link" href="' + this.hoveredData['link'] + '" class="' + this.hoveredData['linkVisible'] + '" target="_blank">Learn more...</a>\
      <div class="readefine-tt-logo-container">\
        <img class="readefine-tt-logo" src="' + this.readefineLogoImage + '">\
        <div id="readefine-tt-team-logo"></div>\
        <div class="readefine-tt-fb">\
          ' + editFolder + '\
          <span id="readefine_settings" class="dict_class">&#xe8b8;</span>\
          <span id="edit_readefinition" class="dict_class">&#xe3c9;</span>\
        </div>\
      </div>\
    </div>';
    return htmlContent;
  }

  formatDefinitionStatus() {
    if (this.hoveredData['definition']) {
      this.hoveredData['rdfnDef'] = 'rdfn_def_visible'
      this.hoveredData['rdfnDefAppearance'] = 'readefine-definition-visible'
    } else {
      this.hoveredData['rdfnDef'] = 'rdfn_def'
      this.hoveredData['rdfnDefAppearance'] = 'readefine-definition-default'
    }
  }

  formatLinkStatus() {
    if (this.hoveredData['link']) {
      this.hoveredData['linkVisible'] = 'linkvisible'
    } else {
      this.hoveredData['linkVisible'] = ''
    }
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

  createButton() {
    this.button = new SelectToReadefineButton();
    this.button.appendToBody();
  }

  createStyleElement(content: any) {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = content;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  updatePageText(updated: any) {
    let data = JSON.parse(updated.replace(/\\[r]|(\r\n)|[\r\n]/g, "\\n"));
    if (data['error'] && data['error'] === "wait") {
        this.checkTextItemsIsRunning = false;
        return;
    }
    this.readefinitionsList = Object.assign(this.readefinitionsList, data['readefinitions_list']);
    this.readefineMode = data['readefineMode']
    delete data['readefinitions_list'];
    delete data['readefineMode'];

    for (let i = 0; i < this.textItems.length; i++) {
      const node = this.textItems[i];
      if (data[i] && data[i].uid === this.generateUID(node)) {
        delete data[i]['uid'];
        const target = data[i]['readefined_target_text'];
        const original = data[i]['readefined_original_text'];
  
        if (this.readefineMode == "learning") {
          let doc = this.parser.parseFromString(original, 'text/html');
          let fragment = document.createDocumentFragment();
          const childNodes = Array.from(doc.body.childNodes);
          for (const childNode of childNodes) {
            fragment.appendChild(childNode.cloneNode(true));
          }
        
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          const leadingSpaces = /^\s*/.exec(original)[0];
          if (leadingSpaces.length > 0) {
            const spaceNode = document.createTextNode(leadingSpaces);
            fragment.insertBefore(spaceNode, fragment.firstChild);
          }
        
          node.replaceWith(...fragment.childNodes);
        } else {
          let doc = this.parser.parseFromString(target, 'text/html');
          let fragment = document.createDocumentFragment();
          const childNodes = Array.from(doc.body.childNodes);
          for (const childNode of childNodes) {
            fragment.appendChild(childNode.cloneNode(true));
          }
        
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          const leadingSpaces = /^\s*/.exec(target)[0];
          if (leadingSpaces.length > 0) {
            const spaceNode = document.createTextNode(leadingSpaces);
            fragment.insertBefore(spaceNode, fragment.firstChild);
          }
        
          node.replaceWith(...fragment.childNodes);
        }
      }
    }
    this.checkTextItemsIsRunning = false;
  }

  generateUID(node: any) {
    let path = "";
    let currentNode = node;
    while (currentNode !== document.body && currentNode.parentNode) {
      path = `${Array.prototype.indexOf.call(currentNode.parentNode.childNodes, currentNode)}>${path}`;
      currentNode = currentNode.parentNode;
    }
    return this.utf8_to_b64(node.nodeValue.trim() + "|" + path).substring(0, 24);
  }

  utf8_to_b64(str: any) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  async rereadefine() {
    let { status = true, hl2rdfn } = await chrome.storage.local.get();
    this.status = status;
    if (hl2rdfn ||  typeof hl2rdfn === "undefined") {
      this.hl2rdfn = true
    } else {
      this.hl2rdfn = false
    }
    const currentlyReadefined = document.getElementsByClassName('readefiningAWord');
    const elementsArray = Array.from(currentlyReadefined);

    for (const element of elementsArray) {
      const a = element.id.replace("readefinition", "");
      const original = this.readefinitionsList[a]['original'];
      element.replaceWith(original);
    }

    this.normalizeTextNodes(document.body);

    if (status || typeof status === 'undefined') {
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      if (window.readefine) {
        // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
        window.readefine.removeEventListeners();
      }
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine = null;

      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine = new Readefine();
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine.collectDataAndReadefine();
    } else {
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      if (window.readefine) {
        // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
        window.readefine.removeEventListeners();
      }
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine = null;
    }
  }

  normalizeTextNodes(element: any) {
    if (element.nodeType === Node.ELEMENT_NODE) {
      for (let i = element.childNodes.length - 1; i >= 0; i--) {
        const childNode = element.childNodes[i];
        if (childNode.nodeType === Node.TEXT_NODE) {
          if (childNode.nextSibling && childNode.nextSibling.nodeType === Node.TEXT_NODE) {
            childNode.textContent += childNode.nextSibling.textContent;
            element.removeChild(childNode.nextSibling);
          }
        } else if (childNode.nodeType === Node.ELEMENT_NODE) {
          this.normalizeTextNodes(childNode);
        }
      }
    }
  }

  handleCopy(event: any) {
    const sel = document.getSelection();
    const candidates = document.querySelectorAll('.readefiningAWord');
    this.clipboardCandidates = {};

    candidates.forEach((candidate, index) => {
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      if (sel.containsNode(candidate, true)) {
        const originalText = this.readefinitionsList[candidate.id.replace("readefinition", "")]['original'];
        const targetText = this.readefinitionsList[candidate.id.replace("readefinition", "")]['target'];
        const theText = candidate.childNodes[0];
        const originalCandidate = candidate.cloneNode(true);

        this.clipboardCandidates[index] = {
          theText,
          originalCandidate
        };

        candidate.replaceWith(theText);
        theText.textContent = originalText;
      }
    });

    this.copyTimeout = setTimeout(() => {
      for (const obj in this.clipboardCandidates) {
        const { theText, originalCandidate } = this.clipboardCandidates[obj];
        theText.replaceWith(originalCandidate);
      }
    }, 20);

    // @ts-expect-error TS(2339): Property 'clipboardData' does not exist on type 'W... Remove this comment to see the full error message
    const clipData = event.clipboardData || window.clipboardData;
  }

  hideRDFNSettings(e: any) {
    var element = document.getElementById("rdfn-iframe");
    if (
      e.target !== element &&
      // @ts-expect-error TS(2531): Object is possibly 'null'.
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
      this.openReadefineiFrame(which_frame);
      document.addEventListener("click", this.hideRDFNSettings);
    }
  }

  openReadefineiFrame(selected: any) {
    var iframe = document.createElement("iframe");
    if (selected === "settings") {
      iframe.src = chrome.runtime.getURL("/popup/index.html#/?modal=settings&context=contentScript");
    } else if (selected === "edit") {
      let send_original
      let send_target
      let send_definition
      let send_link
      send_original = this.hoveredData['original']
      send_target = this.hoveredData['target']
      if (!this.hoveredData['definition'] || this.hoveredData['definition'] === "false") {
        send_definition = ''
      }
      else {
        send_definition = this.hoveredData['definition']
      }
      if (!this.hoveredData['link'] || this.hoveredData['link'] === "false") {
        send_link = ''
      }
      else {
        send_link = this.hoveredData['link']
      }
      let dt = 'personal-dictionary';
      // switch (this.hoveredData['type']) {
      //   case 'user':
      //     dt = 'personal-dictionary';
      //     break;
      //   case 'community':
      //     dt = 'community-dictionaries';
      //     break;
      //   case 'team':
      //     dt = 'team-dictionaries';
      //   case 'default':
      //     break;
      // }
      let params = {
        original: send_original,
        target: send_target,
        definition: send_definition,
        link: send_link
      }
      var queryString = JSON.stringify(params)
      iframe.src = chrome.runtime.getURL(`/popup/index.html#/${dt}${dt === 'personal-dictionary' ? '/' : ('/' + this.hoveredData['dictionary'] + '/')}?modal=edit&context=contentScript&wordObj=${queryString}`)
    } else if (selected === "addnew") {
      let send_original = this.currsel,
      send_target = "",
      send_definition = "",
      send_link = "",   
      params = {
        original: send_original,
        target: send_target,
        definition: send_definition,
        link: send_link
      }

      var queryString = JSON.stringify(params)
      iframe.src = chrome.runtime.getURL(`/popup/index.html#/personal-dictionary?modal=edit&context=contentScript&wordObj=${queryString}`)
    } else if (selected === "editreadefineai") {
      iframe.src = chrome.runtime.getURL("/popup/index.html#/pro?context=contentScript");
    }

    iframe.id = "rdfn-iframe";
    document.body.appendChild(iframe);
    iframe.style.animationName = "rdfncontentin";
  }

  getSelectedText() {
    var text = "";
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

  isEditableNode(node: any) {
    if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA' || node.isContentEditable) {
        return true;
    }

    while (node.parentNode) {
        node = node.parentNode;
        if (node.isContentEditable) {
            return true;
        }
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

    if (range && this.isSelectionInButton(range)) {
      return this.recreateSelection();
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

  isSelectionInButton(range: any) {
    if (!this.button) return false;

    let shadowRootInstance = this.button.shadowRoot;

    if (!shadowRootInstance) return false;

    let startContainerRoot = this.findShadowRoot(range.startContainer);
    let endContainerRoot = this.findShadowRoot(range.endContainer);

    if (startContainerRoot !== shadowRootInstance || endContainerRoot !== shadowRootInstance) {
        return false;
    }

    return this.button.contains(range.startContainer) || this.button.contains(range.endContainer);
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

  isDirectlyEditable(node: any) {
    return node.isContentEditable || node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA';
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

  storeSelection() {
    const selection = window.getSelection();
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

  showSelectToReadefine(selectedText: any) {
    this.currsel = selectedText;
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
      this.button = null;
    }
    if (!this.banner) {
      // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
      this.banner = new SelectToReadefineDisabled("Selection is too long.");
      this.banner.appendToBody();
    }
    return;
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
      
      this.readefinitionsList = Object.assign(this.readefinitionsList, responseData['readefinitions_list']);
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
                this.replaceContentEditableSelection(range, replacementContent);
            }
        } else {
            this.replaceRegularSelection(range, replacementContent);
        }
    }
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

  handleClick = (e: any) => {
    if (e.target.matches('#edit_readefinition')) {
      this.openIFrameHandler('edit');
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

  attachEventListeners() {
    document.addEventListener("click", this.handleClick);
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener("selectionchange", this.handleSelectionChange);
  }

  removeEventListeners() {
    document.removeEventListener("click", this.handleClick);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener("selectionchange", this.handleSelectionChange);
  }

  collectDataAndReadefine() {
    this.attachEventListeners();
  }
}

window.addEventListener("load", async function() {
  console.log("windowloaded")
  // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
  if (typeof window.readefine === 'undefined') {
    console.log("readefine is undefined")
    const response = await chrome.runtime.sendMessage({ swaction: "GET_USER_TOKEN" });
    const { token } = response;
    let { status = true } = await chrome.storage.local.get();
    if (token && status) {
      console.log("setting up readefine")
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine = new Readefine();
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      window.readefine.collectDataAndReadefine();
    }
  }
});

chrome.runtime.onMessage.addListener(
  function(request: any, sender: any, sendResponse: any) {
    if (request.rereadefine == true) {
      // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
      if (window.readefine) {
        // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
        window.readefine.rereadefine()
      }
      else {
        // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
        window.readefine = new Readefine();
        // @ts-expect-error TS(2339): Property 'readefine' does not exist on type 'Windo... Remove this comment to see the full error message
        window.readefine.rereadefine();
      }
      sendResponse({rereadefined_page: true});
    }
  }
);