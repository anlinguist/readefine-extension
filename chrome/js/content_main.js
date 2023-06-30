class Readefine {
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
  }

  async initializeStatus() {
    const { status } = await chrome.storage.local.get();
    this.status = status;
  }

  handleMouseOver(e) {
    const target = e.target.closest('.readefiningAWord');
    if (!target) return;
    if (e.target.classList.contains("lp")) {
      return;
    }
    if (this.tooltip) {
      readefine_tooltip.hideAll();
    }
    this.instances.forEach(instance => {
      instance.destroy();
    });
    this.instances.length = 0;
    this.tooltip = this.createTooltip(e.target);
    this.tooltip.show();
    this.instances = this.instances.concat(this.tooltip);
  }

  createTooltip(target) {
    return readefine_tooltip(target, this.getTooltipOptions(target));
  }

  getTooltipOptions(target) {
    return {
      content: (reference) => this.getTooltipContent(reference),
      allowHTML: true,
      interactive: true,
      animation: 'shift-away',
      theme: 'readefine',
      appendTo: document.body,
      interactiveBorder: 10,
      inlinePositioning: true,
      hideOnClick: false,
      zIndex: 9999999999,
      onHidden(instance) {
        instance.destroy()
        var elements = document.querySelectorAll(".newdivinstances");
        for (var i = 0; i < elements.length; i++) {
          elements[i].remove();
        }
      }
    };
  }

  getTooltipContent(reference) {
    let id = reference.id.replace("readefinition", "");
    let data = this.readefinitionsList[id];
    if (!data) return;
    
    this.formatHoveredData(data);
    this.hoveredData['show'] = this.readefineMode === "reading" ? this.hoveredData['original'] : this.hoveredData['target'];
    let {dictionaryName, dictionaryLink, disableDictLink} = this.formatDictionaryName();
    this.hoveredData['dictionaryName'] = dictionaryName;
    this.hoveredData['dictionaryLink'] = dictionaryLink;
    this.hoveredData['disableDictLink'] = disableDictLink;
    this.formatDefinitionStatus();
    this.formatLinkStatus();
    
    return this.generateHTMLContent();
  }
  
  formatHoveredData(data) {
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
          dictionaryLink: "https://app.getreadefine.com/personal-dictionary",
          disableDictLink: ''
        };
        break;
  
      case "community":
        dictionaryProperties = {
          dictionaryName: this.hoveredData['dictionary'] + " Community Dictionary",
          dictionaryLink: `https://app.getreadefine.com/community-dictionaries/${this.hoveredData['dictionary']}`,
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
          dictionaryLink: `https://app.getreadefine.com/team-dictionaries/${this.hoveredData['dictionary']}`,
          disableDictLink: ''
        };
        break;
    }
    return dictionaryProperties;
  }

  generateHTMLContent() {
    let editFolder = "";
  
    if (this.hoveredData['dictionaryName'] != "Readefine Dictionary" && this.hoveredData['dictionaryName'] != 'UK to US Dictionary' && this.hoveredData['dictionaryName'] != 'US to UK Dictionary') {
      editFolder = '<a title="' + this.hoveredData['dictionaryName'] + '" target="_blank" class="' + this.hoveredData['disableDictLink'] + '" href="' + this.hoveredData['dictionaryLink'] + '" id="readefine-dictionary-name">\
                      <span class="dict_class">&#xe2c7;</span>\
                    </a>'
    }
  
    let htmlContent = '<div id="readefine-original-word">' + this.hoveredData['show'] + '</div>\
    <div id="rdfn-tooltip">\
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
          <span id="edit_readefinition" class="dict_class">&#xe3c9;</span>\
          <span id="readefine_settings" class="dict_class">&#xe8b8;</span>\
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

  acceptNode(node) {
    const ignoredSelectors = '.readefiningAWord,.readefiningAWord *,.checkedbyreadefine,.checkedbyreadefine *,.readefine-loader-pd-container,.readefine-loader-pd-container *,#readefine-something-new-tt,#readefine-something-new-tt *,[data-readefine_tooltip-root],[data-readefine_tooltip-root] *,noscript,noscript *,code,code *,input,input *,script,script *,style,style *,.textareawrapper,.textareawrapper *,.blockeditor,.blockeditor *,.editor,.editor *,.block-editor,.block-editor *,#textareawrapper,#textareawrapper *,.textarea,.textarea *,#textarea,#textarea *,[contenteditable="true"],[contenteditable="true"] *,[role="button"],[role="button"] *,textarea,textarea *,text,text *,.textareawrapper,.textareawrapper *,iframe,iframe *';
    if ((node.nodeType === Node.ELEMENT_NODE) && (node.parentElement.matches(ignoredSelectors) || node.parentElement.matches(ignoredSelectors))) {
      return NodeFilter.FILTER_REJECT;
    }
    if (node.nodeType === Node.TEXT_NODE && node.parentElement.matches(ignoredSelectors)) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  }

  createStyleElement(content) {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = content;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  launcher() {
    if (!this.checkTextItemsIsRunning) {
      this.checkTextItems()
    }
  }

  updatePageText(updated) {
    let data = JSON.parse(updated.replace(/\\[r]|(\r\n)|[\r\n]/g, "\\n"));
    if (data['error'] && data['error'] === "wait") {
        this.checkTextItemsIsRunning = false;
        var checkedbyreadefineclasses = document.getElementsByClassName("checkedbyreadefine");

        while (checkedbyreadefineclasses.length) {
          checkedbyreadefineclasses[0].classList.remove("checkedbyreadefine");
        }
        return;
    }
    this.readefinitionsList = Object.assign(this.readefinitionsList, data['readefinitions_list']);
    this.readefineMode = data['readefineMode']
    delete data['readefinitions_list'];
    delete data['readefineMode'];

    for (let i = 0; i < this.textItems.length; i++) {
      const node = this.textItems[i];
      if (data[i]) {
        const target = data[i]['readefined_target_text'];
        const original = data[i]['readefined_original_text'];
  
        if (this.readefineMode == "learning") {
          let doc = this.parser.parseFromString(original, 'text/html');
          let fragment = document.createDocumentFragment();
          const childNodes = Array.from(doc.body.childNodes);
          for (const childNode of childNodes) {
            fragment.appendChild(childNode.cloneNode(true));
          }
        
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

  async checkTextItems() {
    await this.initializeStatus();
    while (this.status !== false) {
      if (!this.checkTextItemsIsRunning) {
          this.checkTextItemsIsRunning = true;
          let modified = false;
          this.walker.currentNode = document.body;

          while (this.walker.nextNode()) {
              if (this.walker.currentNode.nodeType === Node.TEXT_NODE && this.walker.currentNode.nodeValue.trim() !== '') {
                  this.textItems.push(this.walker.currentNode);
                  modified = true;
              }
          }

          let newobj = {};
          this.textItems.map((node, index) => {
              if (node.parentElement && !node.parentElement.classList.contains("checkedbyreadefine")) {
                  node.parentElement.classList.add("checkedbyreadefine");
              }
              newobj[index] = node.nodeValue;
          });

          let finobj = JSON.stringify(newobj);
          if (finobj === "{}" || !modified) {
              this.checkTextItemsIsRunning = false;
          } else {
              let appobj = {};
              appobj["pageData"] = newobj;
              appobj["pageHost"] = window.location.host;
              appobj["pagecount"] = document.querySelectorAll('.readefiningAWord').length;
              let sendData = JSON.stringify(appobj);
              chrome.runtime.sendMessage({ action: "routeSendData", sendData: sendData }).then(response => {
                this.updatePageText(response.text)
              })
          }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async rereadefine() {
    let { status } = await chrome.storage.local.get();
    this.status = status;
    const currentlyReadefined = document.getElementsByClassName('readefiningAWord');
    const elementsArray = Array.from(currentlyReadefined);

    for (const element of elementsArray) {
      const a = element.id.replace("readefinition", "");
      const original = this.readefinitionsList[a]['original'];
      element.replaceWith(original);
    }

    const checkedByReadefineClasses = document.getElementsByClassName("checkedbyreadefine");
    const cbrArr = Array.from(checkedByReadefineClasses);
    for (const element of cbrArr) {
      element.classList.remove("checkedbyreadefine");
    }

    this.normalizeTextNodes(document.body);

    if (status) {
      if (readefine) {
        readefine.removeEventListeners();
      }
      readefine = null;

      readefine = new Readefine();
      readefine.collectDataAndReadefine();
    } else {
      if (readefine) {
        readefine.removeEventListeners();
      }
      readefine = null;
    }
  }

  normalizeTextNodes(element) {
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
  
  handleCopy(event) {
    const sel = document.getSelection();
    const candidates = document.querySelectorAll('.readefiningAWord');
    this.clipboardCandidates = {};

    candidates.forEach((candidate, index) => {
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

    const clipData = event.clipboardData || window.clipboardData;
  }

  hideRDFNSettings(e) {
    var element = document.getElementById("rdfn-iframe");
    if (
      e.target !== element &&
      !element.contains(e.target) &&
      !e.target.classList.contains("readefine-definition-visible") &&
      e.target.id !== "rdfn_expand_out" &&
      e.target.id !== "rdfn_expand_in"
    ) {
      document.getElementById("rdfn-iframe").style.animationName = "rdfncontentout";
      document.removeEventListener("click", this.hideRDFNSettings);
      setTimeout(function () {
        element.remove();
      }, 500);
    }
  }

  openIFrameHandler(which_frame) {
    if (document.querySelector("#rdfn-iframe")) {
      setTimeout(() => {
        document.getElementById("rdfn-iframe").style.animationName = "rdfncontentout";
        document.removeEventListener("click", this.hideRDFNSettings);
        document.querySelector("#rdfn-iframe").remove();
        this.openReadefineiFrame(which_frame);
        document.addEventListener("click", this.hideRDFNSettings);
      }, 500);
    } else {
      this.openReadefineiFrame(which_frame);
      document.addEventListener("click", this.hideRDFNSettings);
    }
  }

  openReadefineiFrame(selected) {
    var iframe = document.createElement("iframe");
    if (selected === "settings") {
      iframe.src = chrome.runtime.getURL("/popup/build/index.html#/?modal=settings&context=contentScript");
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
      iframe.src = chrome.runtime.getURL(`/popup/build/index.html#/${dt}${dt === 'personal-dictionary' ? '/' : ('/' + this.hoveredData['dictionary'] + '/')}?modal=edit&context=contentScript&wordObj=${queryString}`)
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
      iframe.src = chrome.runtime.getURL(`/popup/build/index.html#/personal-dictionary?modal=edit&context=contentScript&wordObj=${queryString}`)
    }

    iframe.id = "rdfn-iframe";
    document.body.appendChild(iframe);
    iframe.style.animationName = "rdfncontentin";
  }

  getSelectedText() {
    var text = "";
    if (typeof window.getSelection !== "undefined") {
      text = window.getSelection().toString();
    } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  handleSelectionChange() {
    let timer = null;
  
    const handleSelectionChangeTimeout = async () => {
      clearTimeout(timer);
  
      timer = setTimeout(async () => {
        const selectedText = this.getSelectedText().trim();
        if (selectedText && selectedText !== "") {
          const { hl2rdfn } = await chrome.storage.local.get("hl2rdfn");
  
          while (document.querySelector("#hl2rdfn")) {
            document.querySelector("#hl2rdfn").outerHTML = "";
          }
  
          if (hl2rdfn) {
            const hl2rdfnDiv = document.createElement("div");
            hl2rdfnDiv.id = "hl2rdfn";
  
            const hl2rdfnLogo = document.createElement("img");
            hl2rdfnLogo.src = this.readefineLogoImage;
            hl2rdfnLogo.id = "hl2rdfnlogo";
  
            const hl2rdfnSpan = document.createElement("span");
            hl2rdfnSpan.textContent = "Readefine current selection";
            hl2rdfnSpan.id = "hl2rdfnspan";
  
            hl2rdfnDiv.appendChild(hl2rdfnLogo);
            hl2rdfnDiv.appendChild(hl2rdfnSpan);
  
            document.body.appendChild(hl2rdfnDiv);
            this.currsel = selectedText;
          }
        } else {
          while (document.querySelector("#hl2rdfn")) {
            document.querySelector("#hl2rdfn").outerHTML = "";
          }
        }
      }, 200); // Adjust the delay (in milliseconds) as needed
    };
  
    handleSelectionChangeTimeout();
  }
  
  handleClick = (e) => {
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
      rdfnDefApp.classList.toggle('expanded-rdfn-def');
  
      var rdfnExpandOut = document.getElementById('rdfn_expand_out');
      rdfnExpandOut.classList.toggle('expanded-rdfn-def');
  
      var rdfnExpandIn = document.getElementById('rdfn_expand_in');
      rdfnExpandIn.classList.toggle('expanded-rdfn-def');
      return
    }

    if (e.button === 0) {
      if (document.getElementById("hl2rdfn") && document.getElementById("hl2rdfn").contains(e.target)) {
        this.openIFrameHandler("addnew");
      }
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
    this.launcher();
  }
}

let readefine = new Readefine();
window.addEventListener("load", function() {
  readefine.collectDataAndReadefine();
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.rereadefine == true) {
      if (readefine) {
        readefine.rereadefine()
      }
      else {
        readefine = new Readefine();
        readefine.rereadefine();
      }
      sendResponse({rereadefined_page: true});
    }
  }
);