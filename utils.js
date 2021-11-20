function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
  if (object === undefined || object === null || _typeof(object) !== 'object' && !Array.isArray(object)) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(function (value) {
      return modifyObjectKeys(value, modify);
    });
  } // Otherwise, process all its keys.


  var result = {};
  Object.entries(object).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

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
  var transformer = function transformer(key) {
    return nameMap[key] === undefined ? key : nameMap[key];
  };

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

export function getQueryParameters() {
  var search = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : global.location.search;
  var keyValueFragments = search.slice(search.indexOf('?') + 1).split('&').filter(function (hash) {
    return hash !== '';
  });
  return keyValueFragments.reduce(function (params, keyValueFragment) {
    var split = keyValueFragment.indexOf('=');
    var key = keyValueFragment.slice(0, split);
    var value = keyValueFragment.slice(split + 1);
    return Object.assign(params, _defineProperty({}, key, decodeURIComponent(value)));
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
  Object.keys(object).forEach(function (key) {
    if (object[key] === undefined) {
      // eslint-disable-next-line no-console
      console.warn("Module configuration error: ".concat(key, " is required by ").concat(requester, "."));
    }
  });
}
//# sourceMappingURL=utils.js.map