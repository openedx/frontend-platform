function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
  var primaryLanguageSubtag = getPrimaryLanguageSubtag(locale);
  var languageCode = countryLangs().includes(primaryLanguageSubtag) ? primaryLanguageSubtag : 'en';
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
  var countryMessages = getCountryMessages(locale);
  return Object.entries(countryMessages).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      code = _ref2[0],
      name = _ref2[1];
    return {
      code: code,
      name: name
    };
  });
}
//# sourceMappingURL=countries.js.map