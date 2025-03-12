interface ServiceWorkerResponse {
    updatedNodes?: [
      {
        uid: string;
        originalText: string;
        readefinedText: string;
      }
    ];
    readefinitionsList?: {
      [tooltipId: string]: {
        original: string;
        target: string;
      }
    };
    readefineMode: string;
  }

interface TextItem {
    node: Node;
    uid: string;
}