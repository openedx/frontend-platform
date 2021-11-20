function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import PropTypes from 'prop-types';
import { addLocaleData } from 'react-intl';
import arLocale from 'react-intl/locale-data/ar';
import enLocale from 'react-intl/locale-data/en';
import esLocale from 'react-intl/locale-data/es';
import frLocale from 'react-intl/locale-data/fr';
import zhLocale from 'react-intl/locale-data/zh';
import caLocale from 'react-intl/locale-data/ca';
import heLocale from 'react-intl/locale-data/he';
import idLocale from 'react-intl/locale-data/id';
import koLocale from 'react-intl/locale-data/ko';
import plLocale from 'react-intl/locale-data/pl';
import ptLocale from 'react-intl/locale-data/pt';
import ruLocale from 'react-intl/locale-data/ru';
import thLocale from 'react-intl/locale-data/th';
import ukLocale from 'react-intl/locale-data/uk';
import Cookies from 'universal-cookie';
import merge from 'lodash.merge';
var cookies = new Cookies();
var supportedLocales = ['ar', // Arabic
// NOTE: 'en' is not included in this list intentionally, since it's the fallback.
'es-419', // Spanish, Latin American
'fr', // French
'zh-cn', // Chinese, Simplified
'ca', // Catalan
'he', // Hebrew
'id', // Indonesian
'ko-kr', // Korean (Korea)
'pl', // Polish
'pt-br', // Portuguese (Brazil)
'ru', // Russian
'th', // Thai
'uk' // Ukrainian
];
var rtlLocales = ['ar', // Arabic
'he', // Hebrew
'fa', // Farsi (not currently supported)
'ur' // Urdu (not currently supported)
];
var config = null;
var loggingService = null;
var messages = null;
/**
 *
 * @ignore
 * @returns {LoggingService}
 *
 */

export var getLoggingService = function getLoggingService() {
  return loggingService;
};
/**
 * @memberof module:Internationalization
 */

export var LOCALE_TOPIC = 'LOCALE';
/**
 * @memberof module:Internationalization
 */

export var LOCALE_CHANGED = "".concat(LOCALE_TOPIC, ".CHANGED");
/**
 *
 * @memberof module:Internationalization
 * @returns {Cookies}
 */

export function getCookies() {
  return cookies;
}
addLocaleData([].concat(_toConsumableArray(arLocale), _toConsumableArray(enLocale), _toConsumableArray(esLocale), _toConsumableArray(frLocale), _toConsumableArray(zhLocale), _toConsumableArray(caLocale), _toConsumableArray(heLocale), _toConsumableArray(idLocale), _toConsumableArray(koLocale), _toConsumableArray(plLocale), _toConsumableArray(ptLocale), _toConsumableArray(ruLocale), _toConsumableArray(thLocale), _toConsumableArray(ukLocale)));
/**
 * Some of our dependencies function on primary language subtags, rather than full locales.
 * This function strips a locale down to that first subtag.  Depending on the code, this
 * may be 2 or more characters.
 *
 * @param {string} code
 * @memberof module:Internationalization
 */

export function getPrimaryLanguageSubtag(code) {
  return code.split('-')[0];
}
/**
 * Finds the closest supported locale to the one provided.  This is done in three steps:
 *
 * 1. Returning the locale itself if its exact language code is supported.
 * 2. Returning the primary language subtag of the language code if it is supported (ar for ar-eg,
 * for instance).
 * 3. Returning 'en' if neither of the above produce a supported locale.
 *
 * @param {string} locale
 * @returns {string}
 * @memberof module:Internationalization
 */

export function findSupportedLocale(locale) {
  if (messages[locale] !== undefined) {
    return locale;
  }

  if (messages[getPrimaryLanguageSubtag(locale)] !== undefined) {
    return getPrimaryLanguageSubtag(locale);
  }

  return 'en';
}
/**
 * Get the locale from the cookie or, failing that, the browser setting.
 * Gracefully fall back to a more general primary language subtag or to English (en)
 * if we don't support that language.
 *
 * @param {string} locale If a locale is provided, returns the closest supported locale. Optional.
 * @throws An error if i18n has not yet been configured.
 * @returns {string}
 * @memberof module:Internationalization
 */

export function getLocale(locale) {
  if (messages === null) {
    throw new Error('getLocale called before configuring i18n. Call configure with messages first.');
  } // 1. Explicit application request


  if (locale !== undefined) {
    return findSupportedLocale(locale);
  } // 2. User setting in cookie


  var cookieLangPref = cookies.get(config.LANGUAGE_PREFERENCE_COOKIE_NAME);

  if (cookieLangPref) {
    return findSupportedLocale(cookieLangPref.toLowerCase());
  } // 3. Browser language (default)
  // Note that some browers prefer upper case for the region part of the locale, while others don't.
  // Thus the toLowerCase, for consistency.
  // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/language


  return findSupportedLocale(global.navigator.language.toLowerCase());
}
/**
 * Returns messages for the provided locale, or the user's preferred locale if no argument is
 * provided.
 *
 * @param {string} [locale=getLocale()]
 * @memberof module:Internationalization
 */

export function getMessages() {
  var locale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getLocale();
  return messages[locale];
}
/**
 * Determines if the provided locale is a right-to-left language.
 *
 * @param {string} locale
 * @memberof module:Internationalization
 */

export function isRtl(locale) {
  return rtlLocales.includes(locale);
}
/**
 * Handles applying the RTL stylesheet and "dir=rtl" attribute to the html tag if the current locale
 * is a RTL language.
 *
 * @memberof module:Internationalization
 */

export function handleRtl() {
  if (isRtl(getLocale())) {
    global.document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
  } else {
    global.document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');
  }
}
var messagesShape = {
  ar: PropTypes.objectOf(PropTypes.string),
  // Arabic
  en: PropTypes.objectOf(PropTypes.string),
  'es-419': PropTypes.objectOf(PropTypes.string),
  // Spanish, Latin American
  fr: PropTypes.objectOf(PropTypes.string),
  // French
  'zh-cn': PropTypes.objectOf(PropTypes.string),
  // Chinese, Simplified
  ca: PropTypes.objectOf(PropTypes.string),
  // Catalan
  he: PropTypes.objectOf(PropTypes.string),
  // Hebrew
  id: PropTypes.objectOf(PropTypes.string),
  // Indonesian
  'ko-kr': PropTypes.objectOf(PropTypes.string),
  // Korean (Korea)
  pl: PropTypes.objectOf(PropTypes.string),
  // Polish
  'pt-br': PropTypes.objectOf(PropTypes.string),
  // Portuguese (Brazil)
  ru: PropTypes.objectOf(PropTypes.string),
  // Russian
  th: PropTypes.objectOf(PropTypes.string),
  // Thai
  uk: PropTypes.objectOf(PropTypes.string) // Ukrainian

};
var optionsShape = {
  config: PropTypes.object.isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired
  }).isRequired,
  messages: PropTypes.oneOfType([PropTypes.shape(messagesShape), PropTypes.arrayOf(PropTypes.shape(messagesShape))]).isRequired
};
/**
 *
 *
 * @param {Array} [messagesArray=[]]
 * @returns {Object}
 * @memberof module:Internationalization
 */

export function mergeMessages() {
  var messagesArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return Array.isArray(messagesArray) ? merge.apply(void 0, [{}].concat(_toConsumableArray(messagesArray))) : {};
}
/**
 * Configures the i18n library with messages for your application.
 *
 * Logs a warning if it detects a locale it doesn't expect (as defined by the supportedLocales list
 * above), or if an expected locale is not provided.
 *
 * @param {Object} options
 * @param {LoggingService} options.loggingService
 * @param {Object} options.config
 * @param {Object} options.messages
 * @memberof module:Internationalization
 */

export function configure(options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'i18n'); // eslint-disable-next-line prefer-destructuring

  loggingService = options.loggingService; // eslint-disable-next-line prefer-destructuring

  config = options.config;
  messages = Array.isArray(options.messages) ? mergeMessages(options.messages) : options.messages;

  if (config.ENVIRONMENT !== 'production') {
    Object.keys(messages).forEach(function (key) {
      if (supportedLocales.indexOf(key) < 0) {
        console.warn("Unexpected locale: ".concat(key)); // eslint-disable-line no-console
      }
    });
    supportedLocales.forEach(function (key) {
      if (messages[key] === undefined) {
        console.warn("Missing locale: ".concat(key)); // eslint-disable-line no-console
      }
    });
  }

  handleRtl();
}
//# sourceMappingURL=lib.js.map