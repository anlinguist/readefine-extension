(function() {
    var script = document.currentScript;
  
    // @ts-ignore TS(2531): Object is possibly 'null'.
    var src = script?.src;
    var queryString = src.split('?')[1] || '';
    var params = new URLSearchParams(queryString);
  
    var version = params.get('version');
  
    // @ts-expect-error TS(2339): Property 'READEFINE_VERSION' does not exist on type 'Window & typeof globalThis'.
    window.READEFINE_VERSION = version;
  })();
  