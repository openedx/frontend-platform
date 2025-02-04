import { getConfig } from '../../../config';
import { basename } from '../../../initialize';

/**
 * Iterates through each given `<link>` element and removes it from the DOM.
 * @param {HTMLLinkElement[]} existingLinks
 */
export const removeExistingLinks = (existingLinks) => {
  existingLinks.forEach((link) => {
    link.remove();
  });
};

/**
* Creates the fallback URL for the given theme file.
* @param {string} url The theme file path.
* @returns {string} The default theme url.
*/
export const fallbackThemeUrl = (url) => {
  const baseUrl = getConfig().BASE_URL || window.location?.origin;
  return `${baseUrl}${basename}${url}`;
};

export const isEmptyObject = (obj) => !obj || Object.keys(obj).length === 0;
