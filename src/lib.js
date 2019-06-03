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

/**
 * For each locale we want to support, react-intl needs 1) the locale-data, which includes
 * information about how to format numbers, handle plurals, etc., and 2) the translations, as an
 * object holding message id / translated string pairs.  A locale string and the messages object are
 * passed into the IntlProvider element that wraps your element hierarchy.
 *
 * Note that react-intl has no way of checking if the translations you give it actually have
 * anything to do with the locale you pass it; it will happily use whatever messages object you pass
 * in.  However, if the locale data for the locale you passed into the IntlProvider was not
 * correctly installed with addLocaleData, all of your translations will fall back to the default
 * (in our case English), *even if you gave IntlProvider the correct messages object for that
 * locale*.
 *
 * Messages are provided to this module via the configure() function below.
 */

const cookies = new Cookies();
const supportedLocales = [
  'ar', // Arabic
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
  'uk', // Ukrainian
];
const rtlLocales = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Farsi (not currently supported)
  'ur', // Urdu (not currently supported)
];

let messages = null;
let config = {
  ENVIRONMENT: null,
  LANGUAGE_PREFERENCE_COOKIE_NAME: null,
};

export function getCookies() {
  return cookies;
}

function validateConfiguration(newConfig) {
  Object.keys(config).forEach((key) => {
    if (newConfig[key] === undefined) {
      throw new Error(`Service configuration error: ${key} is required.`);
    }
  });
}

addLocaleData([
  ...arLocale,
  ...enLocale,
  ...esLocale,
  ...frLocale,
  ...zhLocale,
  ...caLocale,
  ...heLocale,
  ...idLocale,
  ...koLocale,
  ...plLocale,
  ...ptLocale,
  ...ruLocale,
  ...thLocale,
  ...ukLocale,
]);

/**
 * Some of our dependencies function on primary language subtags, rather than full locales.
 * This function strips a locale down to that first subtag.  Depending on the code, this
 * may be 2 or more characters.
 */
export const getPrimaryLanguageSubtag = code => code.split('-')[0];

/**
 * Finds the closest supported locale to the one provided.  This is done in three steps:
 *
 * 1. Returning the locale itself if its exact language code is supported.
 * 2. Returning the primary language subtag of the language code if it is supported (ar for ar-eg,
 * for instance).
 * 3. Returning 'en' if neither of the above produce a supported locale.
 */
export const findSupportedLocale = (locale) => {
  if (messages[locale] !== undefined) {
    return locale;
  }

  if (messages[getPrimaryLanguageSubtag(locale)] !== undefined) {
    return getPrimaryLanguageSubtag(locale);
  }

  return 'en';
};

/**
 * Get the locale from the cookie or, failing that, the browser setting.
 * Gracefully fall back to a more general primary language subtag or to English (en)
 * if we don't support that language.
 *
 * @param locale If a locale is provided, returns the closest supported locale. Optional.
 * @throws An error if i18n has not yet been configured.
 */
export const getLocale = (locale) => {
  if (messages === null) {
    throw new Error('getLocale called before configuring i18n. Call configure with messages first.');
  }
  // 1. Explicit application request
  if (locale !== undefined) {
    return findSupportedLocale(locale);
  }
  // 2. User setting in cookie
  const cookieLangPref = cookies.get(config.LANGUAGE_PREFERENCE_COOKIE_NAME);
  if (cookieLangPref) {
    return findSupportedLocale(cookieLangPref.toLowerCase());
  }
  // 3. Browser language (default)
  // Note that some browers prefer upper case for the region part of the locale, while others don't.
  // Thus the toLowerCase, for consistency.
  // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/language
  return findSupportedLocale(global.navigator.language.toLowerCase());
};

/**
 * Returns messages for the provided locale, or the user's preferred locale if no argument is
 * provided.
 */
export const getMessages = (locale = getLocale()) => messages[locale];

/**
 * Determines if the provided locale is a right-to-left language.
 */
export const isRtl = locale => rtlLocales.includes(locale);

/**
 * Handles applying the RTL stylesheet and "dir=rtl" attribute to the html tag if the current locale
 * is a RTL language.
 */
export const handleRtl = () => {
  if (isRtl(getLocale())) {
    global.document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
  } else {
    global.document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');
  }
};

/**
 * Configures the i18n library with messages for your application.
 *
 * The first is the application configuration object. The second parameter is an
 * object containing messages for each supported locale, indexed by locale name.
 *
 * Example of second parameter:
 *
 * {
 *   en: {
 *     "message.key": "Message Value"
 *   },
 *   'es-419': {
 *     "message.key": "Valor del mensaje"
 *   }
 *   ...
 * }
 *
 * Logs a warning if it detects a locale it doesn't expect (as defined by the supportedLocales list
 * above), or if an expected locale is not provided.
 */
export const configure = (newConfig, msgs) => {
  validateConfiguration(newConfig);
  messages = msgs;
  config = newConfig;

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
};
