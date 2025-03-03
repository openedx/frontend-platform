import { getConfig } from '../../../config';
import { basename } from '../../../initialize';

/**
 * Iterates through each given `<link>` element and removes it from the DOM.
 * @param {HTMLLinkElement[]} existingLinks
 */
export var removeExistingLinks = function removeExistingLinks(existingLinks) {
  existingLinks.forEach(function (link) {
    link.remove();
  });
};

/**
* Creates the fallback URL for the given theme file.
* @param {string} url The theme file path.
* @returns {string} The default theme url.
*/
export var fallbackThemeUrl = function fallbackThemeUrl(url) {
  var _window$location;
  var baseUrl = getConfig().BASE_URL || ((_window$location = window.location) === null || _window$location === void 0 ? void 0 : _window$location.origin);
  return "".concat(baseUrl).concat(basename).concat(url);
};
export var isEmptyObject = function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
};
//# sourceMappingURL=utils.js.map