/* eslint-disable import/extensions */
import COUNTRIES, { langs as countryLangs } from 'i18n-iso-countries';

import arLocale from 'i18n-iso-countries/langs/ar.json';
import enLocale from 'i18n-iso-countries/langs/en.json';
import esLocale from 'i18n-iso-countries/langs/es.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import zhLocale from 'i18n-iso-countries/langs/zh.json';
import caLocale from 'i18n-iso-countries/langs/ca.json';
import heLocale from 'i18n-iso-countries/langs/he.json';
import idLocale from 'i18n-iso-countries/langs/id.json';
import koLocale from 'i18n-iso-countries/langs/ko.json';
import plLocale from 'i18n-iso-countries/langs/pl.json';
import ptLocale from 'i18n-iso-countries/langs/pt.json';
import ruLocale from 'i18n-iso-countries/langs/ru.json';
import ukLocale from 'i18n-iso-countries/langs/uk.json';

import { getPrimaryLanguageSubtag } from './lib';

/*
 * COUNTRY LISTS
 *
 * Lists of country names localized in supported languages.
 *
 * TODO: When we start dynamically loading translations only for the current locale, change this.
 */

COUNTRIES.registerLocale(arLocale);
COUNTRIES.registerLocale(enLocale);
COUNTRIES.registerLocale(esLocale);
COUNTRIES.registerLocale(frLocale);
COUNTRIES.registerLocale(zhLocale);
COUNTRIES.registerLocale(caLocale);
COUNTRIES.registerLocale(heLocale);
COUNTRIES.registerLocale(idLocale);
COUNTRIES.registerLocale(koLocale);
COUNTRIES.registerLocale(plLocale);
COUNTRIES.registerLocale(ptLocale);
COUNTRIES.registerLocale(ruLocale);
// COUNTRIES.registerLocale(thLocale); // Doesn't exist in lib.
COUNTRIES.registerLocale(ukLocale);

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
