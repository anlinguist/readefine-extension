// ReadefineUtils.ts
export class ReadefineUtils {
  fa: HTMLStyleElement;
  ba: HTMLStyleElement;
  constructor() {
    this.fa = this.createStyleElement(
      '@font-face { font-family: "RDFN Material Icons"; src: url("' +
        chrome.runtime.getURL("assets/google_fonts.woff2") +
        '"); }'
    );
    this.ba = this.createStyleElement(
      '@font-face { font-family: "RDFN Roboto-Light"; src: url("' +
        chrome.runtime.getURL("assets/Roboto-Light.ttf") +
        '"); }'
    );
  }

  createStyleElement(content: string): HTMLStyleElement {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = content;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  generateUID(node: Node): string {
    let path = "";
    let currentNode: Node | null = node;
    while (currentNode && currentNode !== document.body && currentNode.parentNode) {
      path = `${Array.prototype.indexOf.call(currentNode.parentNode.childNodes, currentNode)}>${path}`;
      currentNode = currentNode.parentNode;
    }
    return this.utf8_to_b64((node.nodeValue || "").trim() + "|" + path).substring(0, 24);
  }

  utf8_to_b64(str: string): string {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
}