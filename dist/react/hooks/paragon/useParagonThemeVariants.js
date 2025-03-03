function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useEffect, useState } from 'react';
import { logError, logInfo } from '../../../logging';
import { fallbackThemeUrl, removeExistingLinks } from './utils';

/**
 * A custom React hook that manages the loading of theme variant CSS files dynamically.
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will download
 * the CSS for the non-current theme variants, but at a lower priority than the current one.
 * This ensures that if the theme variant is changed at runtime, the new theme's CSS will already be loaded.
 *
 * The hook also listens for changes in the system's preference and triggers the provided callback accordingly.
 *
 * @memberof module:React
 * @param {object} args Configuration object for theme variants and related settings.
 * @param {object} [args.themeVariants] An object containing the URLs for each supported theme variant,
 * e.g.: `{ light: { url: 'https://path/to/light.css' } }`.
 * @param {string} [args.currentThemeVariant] The currently applied theme variant, e.g.: `light`.
 * @param {function} args.onComplete A callback function called when the theme variant(s) CSS is (are) complete.
 * @param {function} [args.onDarkModeSystemPreferenceChange] A callback function that is triggered
 * when the system's preference changes.
 */
var useParagonThemeVariants = function useParagonThemeVariants(_ref) {
  var themeVariants = _ref.themeVariants,
    currentThemeVariant = _ref.currentThemeVariant,
    onComplete = _ref.onComplete,
    onDarkModeSystemPreferenceChange = _ref.onDarkModeSystemPreferenceChange;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isParagonThemeVariantComplete = _useState2[0],
    setIsParagonThemeVariantComplete = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isBrandThemeVariantComplete = _useState4[0],
    setIsBrandThemeVariantComplete = _useState4[1];

  // Effect hook that listens for changes in the system's dark mode preference.
  useEffect(function () {
    var _window$matchMedia, _window;
    var changeColorScheme = function changeColorScheme(colorSchemeQuery) {
      onDarkModeSystemPreferenceChange(colorSchemeQuery.matches);
    };
    var colorSchemeQuery = (_window$matchMedia = (_window = window).matchMedia) === null || _window$matchMedia === void 0 ? void 0 : _window$matchMedia.call(_window, '(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      colorSchemeQuery.addEventListener('change', changeColorScheme);
    }
    return function () {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', changeColorScheme);
      }
    };
  }, [onDarkModeSystemPreferenceChange]);

  // Effect hook to set the theme current variant on the HTML element.
  useEffect(function () {
    if (currentThemeVariant && themeVariants !== null && themeVariants !== void 0 && themeVariants[currentThemeVariant]) {
      var htmlDataThemeVariantAttr = 'data-paragon-theme-variant';
      document.querySelector('html').setAttribute(htmlDataThemeVariantAttr, currentThemeVariant);
      return function () {
        document.querySelector('html').removeAttribute(htmlDataThemeVariantAttr);
      };
    }
    return function () {}; // Cleanup: no action needed when theme variant is not set
  }, [themeVariants, currentThemeVariant]);

  // Effect hook that calls `onComplete` when both paragon and brand theme variants are completed the processing.
  useEffect(function () {
    if (isParagonThemeVariantComplete && isBrandThemeVariantComplete) {
      onComplete();
    }
  }, [isParagonThemeVariantComplete, isBrandThemeVariantComplete, onComplete]);
  useEffect(function () {
    if (!themeVariants) {
      return;
    }

    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     *
     * @param {string} themeVariant The key representing a theme variant (e.g., `light`, `dark`).
     * @returns {string} The value for the `rel` attribute, either 'stylesheet' or 'alternate stylesheet'.
     */
    var generateStylesheetRelAttr = function generateStylesheetRelAttr(themeVariant) {
      return currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet';
    };

    // Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
    Object.entries(themeVariants).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        themeVariant = _ref3[0],
        value = _ref3[1];
      // If there is no config for the theme variant URL, set the theme variant to complete and continue.
      if (!value.urls) {
        setIsParagonThemeVariantComplete(true);
        setIsBrandThemeVariantComplete(true);
        return;
      }
      var getParagonThemeVariantLink = function getParagonThemeVariantLink() {
        return document.head.querySelector("link[data-paragon-theme-variant='".concat(themeVariant, "']"));
      };
      var existingThemeVariantLink = document.head.querySelector("link[href='".concat(value.urls["default"], "']"));
      var existingThemeVariantBrandLink = document.head.querySelector("link[href='".concat(value.urls.brandOverride, "']"));
      var getExistingThemeVariantLinks = function getExistingThemeVariantLinks(isBrandOverride) {
        var themeVariantLinkSelector = "link[data-".concat(isBrandOverride ? 'brand' : 'paragon', "-theme-variant='").concat(themeVariant, "']");
        return document.head.querySelectorAll(themeVariantLinkSelector);
      };
      var _createThemeVariantLink = function createThemeVariantLink(url) {
        var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$isFallbackTheme = _ref4.isFallbackThemeUrl,
          isFallbackThemeUrl = _ref4$isFallbackTheme === void 0 ? false : _ref4$isFallbackTheme,
          _ref4$isBrandOverride = _ref4.isBrandOverride,
          isBrandOverride = _ref4$isBrandOverride === void 0 ? false : _ref4$isBrandOverride;
        var themeVariantLink = document.createElement('link');
        themeVariantLink.href = url;
        themeVariantLink.rel = generateStylesheetRelAttr(themeVariant);
        if (isBrandOverride) {
          themeVariantLink.dataset.brandThemeVariant = themeVariant;
        } else {
          themeVariantLink.dataset.paragonThemeVariant = themeVariant;
        }
        themeVariantLink.onload = function () {
          if (themeVariant === currentThemeVariant) {
            if (isBrandOverride) {
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
          }
        };
        themeVariantLink.onerror = function () {
          var _PARAGON_THEME$parago, _PARAGON_THEME;
          var paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          if (isFallbackThemeUrl) {
            logError("Could not load theme variant (".concat(paragonThemeAccessor, " - ").concat(themeVariant, ") CSS from fallback URL. Aborting."));
            if (isBrandOverride) {
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
            var otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          var variants = (_PARAGON_THEME$parago = (_PARAGON_THEME = PARAGON_THEME) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME[paragonThemeAccessor]) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME.themeUrls) === null || _PARAGON_THEME === void 0 ? void 0 : _PARAGON_THEME.variants) !== null && _PARAGON_THEME$parago !== void 0 ? _PARAGON_THEME$parago : {};
          if (variants[themeVariant]) {
            var themeVariantFallbackUrl = fallbackThemeUrl(variants[themeVariant].fileName);
            logInfo("Failed to load theme variant (".concat(themeVariant, ") CSS from ").concat(isBrandOverride ? value.urls.brandOverride : value.urls["default"], ". Falling back to locally installed theme variant: ").concat(themeVariantFallbackUrl));
            themeVariantLink = _createThemeVariantLink(themeVariantFallbackUrl, {
              isFallbackThemeUrl: true,
              isBrandOverride: isBrandOverride
            });
            var _otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(_otherExistingLinks);
            var foundParagonThemeVariantLink = getParagonThemeVariantLink();
            if (foundParagonThemeVariantLink) {
              foundParagonThemeVariantLink.insertAdjacentElement('afterend', themeVariantLink);
            } else {
              document.head.insertAdjacentElement('afterbegin', themeVariantLink);
            }
          } else {
            logError("Failed to load theme variant (".concat(themeVariant, ") CSS from ").concat(url, " and locally installed fallback URL is not available. Aborting."));
            if (isBrandOverride) {
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
          }
        };
        return themeVariantLink;
      };
      var insertBrandThemeVariantLink = function insertBrandThemeVariantLink() {
        var updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);
        if (existingThemeVariantBrandLink) {
          existingThemeVariantBrandLink.rel = updatedStylesheetRel;
          existingThemeVariantBrandLink.removeAttribute('as');
          existingThemeVariantBrandLink.dataset.brandThemeVariant = themeVariant;
          return;
        }
        if (value.urls.brandOverride) {
          var brandThemeVariantLink = _createThemeVariantLink(value.urls.brandOverride, {
            isBrandOverride: true
          });
          var foundParagonThemeVariantLink = getParagonThemeVariantLink();
          if (foundParagonThemeVariantLink) {
            foundParagonThemeVariantLink.insertAdjacentElement('afterend', brandThemeVariantLink);
          } else {
            document.head.insertAdjacentElement('afterbegin', brandThemeVariantLink);
          }
        }
        setIsBrandThemeVariantComplete(true);
      };
      if (!existingThemeVariantLink) {
        var paragonThemeVariantLink = _createThemeVariantLink(value.urls["default"]);
        document.head.insertAdjacentElement('afterbegin', paragonThemeVariantLink);
        insertBrandThemeVariantLink(existingThemeVariantBrandLink);
      } else {
        var updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);
        existingThemeVariantLink.rel = updatedStylesheetRel;
        existingThemeVariantLink.removeAttribute('as');
        existingThemeVariantLink.dataset.paragonThemeVariant = themeVariant;
        insertBrandThemeVariantLink(existingThemeVariantBrandLink);
      }
      setIsParagonThemeVariantComplete(true);
      setIsBrandThemeVariantComplete(true);
    });
  }, [themeVariants, currentThemeVariant, onComplete]);
};
export default useParagonThemeVariants;
//# sourceMappingURL=useParagonThemeVariants.js.map