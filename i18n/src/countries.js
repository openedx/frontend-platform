/**
 *  COUNTRY LISTS
 *
 *  Lists of country names localized in supported languages.
 *
 * TODO: When we start dynamically loading translations only for the current locale, change this.
 * */

import COUNTRIES, { langs as countryLangs } from 'i18n-iso-countries';

import { getPrimaryLanguageSubtag } from './lib';

COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ar.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/en.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/es.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/fr.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/zh.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ca.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/he.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/id.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ko.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pl.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/pt.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ru.json'));
// COUNTRIES.registerLocale(require('i18n-iso-countries/langs/th.json')); // Doesn't exist in lib.
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/uk.json'));

/**
 * Provides a lookup table of country IDs to country names for the current locale.
 */
export const getCountryMessages = (locale) => {
  const primaryLanguageSubtag = getPrimaryLanguageSubtag(locale);
  const languageCode = countryLangs().includes(primaryLanguageSubtag) ? primaryLanguageSubtag : 'en';

  return COUNTRIES.getNames(languageCode);
};

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
 */
export const getCountryList = (locale) => {
  const countryMessages = getCountryMessages(locale);
  return Object.entries(countryMessages).map(([code, name]) => ({ code, name }));
};
