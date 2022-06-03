/**
 * #### Import members from **@edx/frontend-platform**
 *
 * @module Utilities
 */
import camelCase from 'lodash.camelcase';
import snakeCase from 'lodash.snakecase';

/**
 * This is the underlying function used by camelCaseObject, snakeCaseObject, and convertKeyNames
 * above.
 *
 * Given an object (or array) and a modification function, will perform the function on each key it
 * encounters on the object and its tree of children.
 *
 * The modification function must take a string as an argument and returns a string.
 *
 * Example:
 *
 * ```
 * (key) => {
 *   if (key === 'edX') {
 *     return 'Open edX';
 *   }
 *   return key;
 * }
 * ```
 *
 * This function will turn any key that matches 'edX' into 'Open edX'.  All other keys will be
 * passed through unmodified.
 *
 * Can accept arrays as well as objects, and will perform its conversion on any objects it finds in
 * the array.
 *
 * @param {Object} object
 * @param {function} modify
 * @returns {Object}
 */
export function modifyObjectKeys(object, modify) {
  // If the passed in object is not an Object, return it.
  if (
    object === undefined
    || object === null
    || (typeof object !== 'object' && !Array.isArray(object))
  ) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(value => modifyObjectKeys(value, modify));
  }

  // Otherwise, process all its keys.
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    result[modify(key)] = modifyObjectKeys(value, modify);
  });
  return result;
}

/**
 * Performs a deep conversion to camelCase on all keys in the provided object and its tree of
 * children.  Uses [lodash.camelcase](https://lodash.com/docs/4.17.15#camelCase) on each key.  This
 * is commonly used to convert snake_case keys in models from a backend server into camelCase keys
 * for use in the JavaScript client.
 *
 * Can accept arrays as well as objects, and will perform its conversion on any objects it finds in
 * the array.
 *
 * @param {Array|Object} object
 * @returns {Array|Object}
 */
export function camelCaseObject(object) {
  return modifyObjectKeys(object, camelCase);
}

/**
 * Performs a deep conversion to snake_case on all keys in the provided object and its tree of
 * children.  Uses [lodash.snakecase](https://lodash.com/docs/4.17.15#snakeCase) on each key.  This
 * is commonly used to convert camelCase keys from the JavaScript app into snake_case keys expected
 * by backend servers.
 *
 * Can accept arrays as well as objects, and will perform its conversion on any objects it finds in
 * the array.
 *
 * @param {Array|Object} object
 * @returns {Array|Object}
 */
export function snakeCaseObject(object) {
  return modifyObjectKeys(object, snakeCase);
}

/**
 * Given a map of key-value pairs, performs a deep conversion key names in the specified object
 * _from_ the key _to_ the value.  This is useful for updating names in an API request to the names
 * used throughout a client application if they happen to differ.  It can also be used in the
 * reverse - formatting names from the client application to names expected by an API.
 *
 * ```
 * import { convertKeyNames } from '@edx/frontend-base';
 *
 * // This object can be of any shape or depth with subobjects/arrays.
 * const myObject = {
 *   myKey: 'my value',
 * }
 *
 * const result = convertKeyNames(myObject, { myKey: 'their_key' });
 *
 * console.log(result) // { their_key: 'my value' }
 * ```
 *
 * Can accept arrays as well as objects, and will perform its conversion on any objects it finds in
 * the array.
 *
 * @param {Array|Object} object
 * @param {Object} nameMap
 * @returns {Array|Object}
 */
export function convertKeyNames(object, nameMap) {
  const transformer = key => (nameMap[key] === undefined ? key : nameMap[key]);

  return modifyObjectKeys(object, transformer);
}

/**
 * *Deprecated*: A method which converts the supplied query string into an object of
 * key-value pairs and returns it.  Defaults to the current query string - should perform like
 * [window.searchParams](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams)
 *
 * @deprecated
 * @param {string} [search=global.location.search]
 * @returns {Object}
 */
export function getQueryParameters(search = global.location.search) {
  const keyValueFragments = search
    .slice(search.indexOf('?') + 1)
    .split('&')
    .filter(hash => hash !== '');

  return keyValueFragments.reduce((params, keyValueFragment) => {
    const split = keyValueFragment.indexOf('=');
    const key = keyValueFragment.slice(0, split);
    const value = keyValueFragment.slice(split + 1);
    return Object.assign(params, { [key]: decodeURIComponent(value) });
  }, {});
}

/**
 * This function helps catch a certain class of misconfiguration in which configuration variables
 * are not properly defined and/or supplied to a consumer that requires them.  Any key that exists
 * is still set to "undefined" indicates a misconfiguration further up in the application, and
 * should be flagged as an error, and is logged to 'warn'.
 *
 * Keys that are intended to be falsy should be defined using null, 0, false, etc.
 *
 * @param {Object} object
 * @param {string} requester A human-readable identifier for the code which called this function.
 * Used when throwing errors to aid in debugging.
 */
export function ensureDefinedConfig(object, requester) {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined) {
      // eslint-disable-next-line no-console
      console.warn(`Module configuration error: ${key} is required by ${requester}.`);
    }
  });
}

/**
 * This function helps to parse api query params
 *
 * @param {String} mainURI
 * @param {Array} queryParams Array with object with strings to set query name and value
 *  {name: '', value, ''}
 */

export function parseUrlQueryParams(mainURI, queryParams = []) {
  const params = new URLSearchParams();
  queryParams.forEach(queryObj => params.append(queryObj.name, queryObj.value));
  return `${mainURI}?${params.toString()}`;
}
