function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/* eslint-disable import/extensions */
import LANGUAGES, { langs as languageLangs } from '@cospired/i18n-iso-languages';
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

// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ar.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/es.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/fr.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/zh.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ca.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/he.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/id.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ko.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/pl.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/pt.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/ru.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/th.json'));
// LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/uk.json'));

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