/**
 * Returns the global object, either window, self, or global, depending on the environment.
 * @returns {Object} The global object.
 */
var _global = (typeof window === 'object' && window.window === window) ? window :
  (typeof self === 'object' && self.self === self) ? self :
  (typeof global === 'object' && global.global === global) ? global : this;

/**
 * Adds a byte order mark (BOM) to the blob if the content type is UTF-8 XML or text/* types.
 * @param {Blob} blob - The blob to add the BOM to.
 * @param {Object|boolean} opts - Optional. An object containing options, or a boolean indicating whether to automatically add the BOM.
 * @returns {Blob} The modified blob with the BOM prepended if applicable.
 */
function bom(blob, opts) {
  if (typeof opts === 'undefined') opts = { autoBom: false };
  else if (typeof opts !== 'object') {
    console.warn('Deprecated: Expected third argument to be a object');
    opts = { autoBom: !opts };
  }

  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
    return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
  }
  return blob;
}

/**
 * Downloads a file from a URL with an optional name and options.
 * @param {string} url - The URL of the file to download.
 * @param {string} name - Optional. The name of the downloaded file.
 * @param {Object} opts - Optional. An object containing additional options.
 */
function download(url, name, opts) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    saveAs(xhr.response, name, opts);
  }
  xhr.onerror = function() {
    console.error('could not download file');
  }
  xhr.send();
}

/**
 * Checks if cross-origin resource sharing (CORS) is enabled for a given URL.
 * @param {string} url - The URL to check for CORS.
 * @returns {boolean} True if CORS is enabled, false otherwise.
 */
function corsEnabled(url) {
  var xhr = new XMLHttpRequest();
  // use sync to avoid popup blocker
  xhr.open('HEAD', url, false);
  try {
    xhr.send();
  } catch (e) {}
  return xhr.status >= 200 && xhr.status <= 299;
}

/**
 * Simulates a click event on a given node.
 * @param {Node} node - The node to simulate the click event on.
 */
function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
      20, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  }
}

/**
 * Detects if the code is running in a WebView inside a native macOS app.
 * @returns {boolean} True if running in a macOS WebView, false otherwise.
 */
var isMacOSWebView = _global.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);

/**
 * The saveAs function, which allows saving a blob as a file.
 * @type {saveAs}
 */
var saveAs = _global.saveAs || (
  // probably in some web worker
  (typeof window !== 'object' || window !== _global)
    ? function saveAs() { /* noop */ }

  // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
  : ('download' in HTMLAnchorElement.prototype && !isMacOSWebView)
  ? function saveAs(blob, name, opts) {
    var URL = _global.URL || _global.webkitURL;
    // Namespace is used to prevent conflict w/ Chrome Poper Blocker extension (Issue #561)
    var a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    name = name || blob.name || 'download';

    a.download = name;
    a.rel = 'noopener'; // tabnabbing

    // TODO: detect chrome extensions & packaged apps
    // a.target = '_blank';

    if (typeof blob === 'string') {
      // Support regular links
      a.href = blob;
      if (a.origin !== location.origin) {
        corsEnabled(a.href)
          ? download(blob, name, opts)
          : click(a, a.target = '_blank');
      } else {
        click(a);
      }
    } else {
      // Support blobs
      a.href = URL.createObjectURL(blob);
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 4E4); // 40s
      setTimeout(function() { click(a); }, 0);
    }
  }

  // Use msSaveOrOpenBlob as a second approach
  : 'msSaveOrOpenBlob' in navigator
  ? function saveAs(blob, name, opts) {
    name = name || blob.name || 'download';

    if (typeof blob === 'string') {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        var a = document.createElement('a');
        a.href = blob;
        a.target = '_blank';
        setTimeout(function() { click(a); });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }

  // Fallback to using FileReader and a popup
  : function saveAs(blob, name, opts, popup) {
    // Open a popup immediately do go around popup blocker
    // Mostly only available on user interaction and the fileReader is async so...
    popup = popup || open('', '_blank');
    if (popup) {
      popup.document.title =
      popup.document.body.innerText = 'downloading...';
    }

    if (typeof blob === 'string') return download(blob, name, opts);

    var force = blob.type === 'application/octet-stream';
    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari;
    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

    if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
      // Safari doesn't allow downloading of blob URLs
      var reader = new FileReader();
      reader.onloadend = function() {
        var url = reader.result;
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
        if (popup) popup.location.href = url;
        else location = url;
        popup = null; // reverse-tabnabbing #460
      };
      reader.readAsDataURL(blob);
    } else {
      var URL = _global.URL || _global.webkitURL;
      var url = URL.createObjectURL(blob);
      if (popup) popup.location = url;
      else location.href = url;
      popup = null; // reverse-tabnabbing #460
      setTimeout(function() { URL.revokeObjectURL(url); }, 4E4); // 40s
    }
  }
);

_global.saveAs = saveAs.saveAs = saveAs;

if (typeof module !== 'undefined') {
  module.exports = saveAs;
}
