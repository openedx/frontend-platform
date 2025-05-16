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
  const baseUrl = window.location?.origin;

  // validates if the baseurl has the protocol to be interpreted correctly by the browser,
  // if is not present add '//' to use Protocol-relative URL
  const protocol = /^(https?:)?\/\//.test(baseUrl) ? '' : '//';

  return `${protocol}${baseUrl}${basename}${url}`;
};

export const isEmptyObject = (obj) => !obj || Object.keys(obj).length === 0;
