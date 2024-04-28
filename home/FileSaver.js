/**
 * Returns the global object, either window, self, or global, depending on the environment.
 * @returns {Object} The global object.
 */
const _global = (typeof window === 'object' && window.window === window) ? window :
  (typeof self === 'object' && self.self === self) ? self :
  (typeof global === 'object' && global.global === global) ? global : this;

/**
 * Adds a byte order mark (BOM) to the blob if the content type is UTF-8 XML or text/* types.
 * @param {Blob} blob - The blob to add the BOM to.
 * @returns {Blob} The modified blob with the BOM prepended if applicable.
 */
function bom(blob) {
  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
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
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status === 200) {
      saveAs(xhr.response, name, opts);
    } else {
      console.error('could not download file: ' + xhr.statusText);
    }
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
  const xhr = new XMLHttpRequest();
  // use sync to avoid popup blocker
  xhr.open('HEAD', url, false);
  try {
    xhr.send();
  } catch (e) {}
  return xhr.status === 200;
}

/**
 * Simulates a click event on a given node.
 * @param {Node} node - The node to simulate the click event on.
 */
function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
      20, false, false, false, false, 0, null);
    node.dispatchEvent(evt);
  }
}

/**
 * Detects if the code is running in a WebView inside a native macOS app.
 * @returns {boolean} True if running in a macOS WebView, false otherwise.
 */
const isMacOSWebView = _global.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);

/**
 * The saveAs function, which allows saving a blob as a file.
 */
let saveAs = _global.saveAs;

if (typeof saveAs === 'undefined') {
  saveAs = _global.saveAs = function(blob, name, opts) {
    // ... saveAs function implementation ...
  };
}

_global.saveAs = saveAs;

if (typeof module !== 'undefined') {
  module.exports = saveAs;
}
