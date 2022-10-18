import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import merge from 'lodash.merge';

import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/ar';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';
import '@formatjs/intl-pluralrules/locale-data/fr';
import '@formatjs/intl-pluralrules/locale-data/zh';
import '@formatjs/intl-pluralrules/locale-data/ca';
import '@formatjs/intl-pluralrules/locale-data/he';
import '@formatjs/intl-pluralrules/locale-data/id';
import '@formatjs/intl-pluralrules/locale-data/ko';
import '@formatjs/intl-pluralrules/locale-data/pl';
import '@formatjs/intl-pluralrules/locale-data/pt';
import '@formatjs/intl-pluralrules/locale-data/ru';
import '@formatjs/intl-pluralrules/locale-data/th';
import '@formatjs/intl-pluralrules/locale-data/uk';

import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/ar';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/es';
import '@formatjs/intl-relativetimeformat/locale-data/fr';
import '@formatjs/intl-relativetimeformat/locale-data/zh';
import '@formatjs/intl-relativetimeformat/locale-data/ca';
import '@formatjs/intl-relativetimeformat/locale-data/he';
import '@formatjs/intl-relativetimeformat/locale-data/id';
import '@formatjs/intl-relativetimeformat/locale-data/ko';
import '@formatjs/intl-relativetimeformat/locale-data/pl';
import '@formatjs/intl-relativetimeformat/locale-data/pt';
import '@formatjs/intl-relativetimeformat/locale-data/ru';
import '@formatjs/intl-relativetimeformat/locale-data/th';
import '@formatjs/intl-relativetimeformat/locale-data/uk';

const cookies = new Cookies();
const supportedLocales = [
  'ar', // Arabic
  // NOTE: 'en' is not included in this list intentionally, since it's the fallback.
  'es-419', // Spanish, Latin American
  'fa', // Farsi
  'fa-ir', // Farsi, Iran
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
  'uk', // Ukrainian
];
const rtlLocales = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Farsi (not currently supported)
  'fa-ir', // Farsi Iran
  'ur', // Urdu (not currently supported)
];

let config = null;
let loggingService = null;
let messages = null;

/**
 * @memberof module:Internationalization
 *
 * Prior versions of react-intl (our primary implementation of the i18n service) included a
 * PropTypes-based 'shape' for its `intl` object.  This has since been removed.  For legacy
 * compatibility, we include an `intlShape` export that is set to PropTypes.object.  Usage of this
 * export is deprecated.
 *
 * @deprecated
 */
export const intlShape = PropTypes.object;

/**
 *
 * @ignore
 * @returns {LoggingService}
 */
export const getLoggingService = () => loggingService;

/**
 * @memberof module:Internationalization
 */
export const LOCALE_TOPIC = 'LOCALE';

/**
 * @memberof module:Internationalization
 */
export const LOCALE_CHANGED = `${LOCALE_TOPIC}.CHANGED`;

/**
 *
 * @memberof module:Internationalization
 * @returns {Cookies}
 */
export function getCookies() {
  return cookies;
}

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
  }
  // 1. Explicit application request
  if (locale !== undefined) {
    return findSupportedLocale(locale);
  }
  // 2. User setting in cookie
  const cookieLangPref = cookies
    .get(config.LANGUAGE_PREFERENCE_COOKIE_NAME);
  if (cookieLangPref) {
    return findSupportedLocale(cookieLangPref.toLowerCase());
  }
  // 3. Browser language (default)
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
export function getMessages(locale = getLocale()) {
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

const messagesShape = {
  ar: PropTypes.objectOf(PropTypes.string), // Arabic
  en: PropTypes.objectOf(PropTypes.string),
  'es-419': PropTypes.objectOf(PropTypes.string), // Spanish, Latin American
  fr: PropTypes.objectOf(PropTypes.string), // French
  'zh-cn': PropTypes.objectOf(PropTypes.string), // Chinese, Simplified
  ca: PropTypes.objectOf(PropTypes.string), // Catalan
  he: PropTypes.objectOf(PropTypes.string), // Hebrew
  id: PropTypes.objectOf(PropTypes.string), // Indonesian
  'ko-kr': PropTypes.objectOf(PropTypes.string), // Korean (Korea)
  pl: PropTypes.objectOf(PropTypes.string), // Polish
  'pt-br': PropTypes.objectOf(PropTypes.string), // Portuguese (Brazil)
  ru: PropTypes.objectOf(PropTypes.string), // Russian
  th: PropTypes.objectOf(PropTypes.string), // Thai
  uk: PropTypes.objectOf(PropTypes.string), // Ukrainian
};

const optionsShape = {
  config: PropTypes.object.isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
  }).isRequired,
  messages: PropTypes.oneOfType([
    PropTypes.shape(messagesShape),
    PropTypes.arrayOf(PropTypes.shape(messagesShape)),
  ]).isRequired,
};

/**
 *
 *
 * @param {Array} [messagesArray=[]]
 * @returns {Object}
 * @memberof module:Internationalization
 */
export function mergeMessages(messagesArray = []) {
  return Array.isArray(messagesArray) ? merge({}, ...messagesArray) : {};
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
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'i18n');
  // eslint-disable-next-line prefer-destructuring
  loggingService = options.loggingService;
  // eslint-disable-next-line prefer-destructuring
  config = options.config;
  messages = Array.isArray(options.messages) ? mergeMessages(options.messages) : options.messages;

  if (config.ENVIRONMENT !== 'production') {
    Object.keys(messages).forEach((key) => {
      if (supportedLocales.indexOf(key) < 0) {
        console.warn(`Unexpected locale: ${key}`); // eslint-disable-line no-console
      }
    });

    supportedLocales.forEach((key) => {
      if (messages[key] === undefined) {
        console.warn(`Missing locale: ${key}`); // eslint-disable-line no-console
      }
    });
  }

  handleRtl();
}
