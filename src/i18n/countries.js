import COUNTRIES, { langs as countryLangs } from 'i18n-iso-countries';

import { getPrimaryLanguageSubtag } from './lib';

/*
 * COUNTRY LISTS
 *
 * Lists of country names localized in supported languages.
 *
 * TODO: When we start dynamically loading translations only for the current locale, change this.
 */

COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ar'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/en'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/es'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/fr'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/zh'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ca'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/he'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/id'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ko'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pl'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pt'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ru'));
// COUNTRIES.registerLocale(require('i18n-iso-countries/langs/th.json')); // Doesn't exist in lib.
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/uk'));

/**
 * Provides a lookup table of country IDs to country names for the current locale.
 *
 * @memberof module:I18n
 */
export function getCountryMessages(locale) {
  const primaryLanguageSubtag = getPrimaryLanguageSubtag(locale);
  const languageCode = countryLangs().includes(primaryLanguageSubtag) ? primaryLanguageSubtag : 'en';

  return COUNTRIES.getNames(languageCode);
}

/**
 * Provides a list of countries represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the country
 *   name // The localized name of the country
 * }
 *
 * TODO: ARCH-878: The list should be sorted alphabetically in the current locale.
 * This is useful for populating dropdowns.
 *
 * @memberof module:I18n
 */
export function getCountryList(locale) {
  const countryMessages = getCountryMessages(locale);
  return Object.entries(countryMessages).map(([code, name]) => ({ code, name }));
}
