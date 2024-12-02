function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* eslint-disable import/extensions */
import LANGUAGES, { langs as languageLangs } from '@cospired/i18n-iso-languages';

// import arLocale from '@cospired/i18n-iso-languages/langs/ar.json';
import enLocale from '@cospired/i18n-iso-languages/langs/en.json';
import esLocale from '@cospired/i18n-iso-languages/langs/es.json';
import frLocale from '@cospired/i18n-iso-languages/langs/fr.json';
// import zhLocale from '@cospired/i18n-iso-languages/langs/zh.json';
// import caLocale from '@cospired/i18n-iso-languages/langs/ca.json';
// import heLocale from '@cospired/i18n-iso-languages/langs/he.json';
// import idLocale from '@cospired/i18n-iso-languages/langs/id.json';
// import koLocale from '@cospired/i18n-iso-languages/langs/ko.json';
import plLocale from '@cospired/i18n-iso-languages/langs/pl.json';
import ptLocale from '@cospired/i18n-iso-languages/langs/pt.json';
// import ruLocale from '@cospired/i18n-iso-languages/langs/ru.json';
// import thLocale from '@cospired/i18n-iso-languages/langs/th.json';
// import ukLocale from '@cospired/i18n-iso-languages/langs/uk.json';

import { getPrimaryLanguageSubtag } from './lib';

/*
 * LANGUAGE LISTS
 *
 * Lists of language names localized in supported languages.
 *
 * TODO: When we start dynamically loading translations only for the current locale, change this.
 * TODO: Also note that a bunch of languages are missing here. They're present but commented out
 * for reference. That's because they're not implemented in this library.  If you read this and it's
 * been a while, go check and see if that's changed!
 */

// LANGUAGES.registerLocale(arLocale);
LANGUAGES.registerLocale(enLocale);
LANGUAGES.registerLocale(esLocale);
LANGUAGES.registerLocale(frLocale);
// LANGUAGES.registerLocale(zhLocale);
// LANGUAGES.registerLocale(caLocale);
// LANGUAGES.registerLocale(heLocale);
// LANGUAGES.registerLocale(idLocale);
// LANGUAGES.registerLocale(koLocale);
LANGUAGES.registerLocale(plLocale);
LANGUAGES.registerLocale(ptLocale);
// LANGUAGES.registerLocale(ruLocale);
// LANGUAGES.registerLocale(thLocale);
// LANGUAGES.registerLocale(ukLocale);

/**
 * Provides a lookup table of language IDs to language names for the current locale.
 *
 * @memberof I18n
 */
export var getLanguageMessages = function getLanguageMessages(locale) {
  var primaryLanguageSubtag = getPrimaryLanguageSubtag(locale);
  var languageCode = languageLangs().includes(primaryLanguageSubtag) ? primaryLanguageSubtag : 'en';
  return LANGUAGES.getNames(languageCode);
};

/**
 * Provides a list of languages represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the language
 *   name // The localized name of the language
 * }
 *
 * TODO: ARCH-878: The list should be sorted alphabetically in the current locale.
 * This is useful for populating dropdowns.
 *
 * @memberof I18n
 */
export var getLanguageList = function getLanguageList(locale) {
  var languageMessages = getLanguageMessages(locale);
  return Object.entries(languageMessages).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      code = _ref2[0],
      name = _ref2[1];
    return {
      code: code,
      name: name
    };
  });
};
//# sourceMappingURL=languages.js.map