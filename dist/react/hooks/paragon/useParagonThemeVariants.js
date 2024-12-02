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
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will still download
 * the CSS for the non-current theme variants, but at a lower priority than the current theme
 * variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new
 * theme variant will already be loaded.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} [args.themeVariants] An object containing the URLs for each supported theme variant, e.g.: `{ light: { url: 'https://path/to/light.css' } }`.
 * @param {string} [args.currentThemeVariant] The currently applied theme variant, e.g.: `light`.
 * @param {string} args.onLoad A callback function called when the theme variant(s) CSS is loaded.
 */
var useParagonThemeVariants = function useParagonThemeVariants(_ref) {
  var themeVariants = _ref.themeVariants,
    currentThemeVariant = _ref.currentThemeVariant,
    onLoad = _ref.onLoad,
    onDarkModeSystemPreferenceChange = _ref.onDarkModeSystemPreferenceChange;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isParagonThemeVariantLoaded = _useState2[0],
    setIsParagonThemeVariantLoaded = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isBrandThemeVariantLoaded = _useState4[0],
    setIsBrandThemeVariantLoaded = _useState4[1];
  useEffect(function () {
    var _window$matchMedia, _window;
    var someFn = function someFn(colorSchemeQuery) {
      onDarkModeSystemPreferenceChange(colorSchemeQuery.matches);
    };
    var colorSchemeQuery = (_window$matchMedia = (_window = window).matchMedia) === null || _window$matchMedia === void 0 ? void 0 : _window$matchMedia.call(_window, '(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      colorSchemeQuery.addEventListener('change', someFn);
    }
    return function () {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', someFn);
      }
    };
  }, [onDarkModeSystemPreferenceChange]);
  useEffect(function () {
    if (currentThemeVariant && themeVariants !== null && themeVariants !== void 0 && themeVariants[currentThemeVariant]) {
      var htmlDataThemeVariantAttr = 'data-paragon-theme-variant';
      document.querySelector('html').setAttribute(htmlDataThemeVariantAttr, currentThemeVariant);
      return function () {
        document.querySelector('html').removeAttribute(htmlDataThemeVariantAttr);
      };
    }
    return function () {}; // no-op
  }, [themeVariants, currentThemeVariant]);
  useEffect(function () {
    // Call `onLoad` once both the paragon and brand theme variant are loaded.
    if (isParagonThemeVariantLoaded && isBrandThemeVariantLoaded) {
      onLoad();
    }
  }, [isParagonThemeVariantLoaded, isBrandThemeVariantLoaded, onLoad]);
  useEffect(function () {
    if (!themeVariants) {
      return;
    }

    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     */
    var generateStylesheetRelAttr = function generateStylesheetRelAttr(themeVariant) {
      return currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet';
    };

    // Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
    Object.entries(themeVariants).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        themeVariant = _ref3[0],
        value = _ref3[1];
      // If there is no config for the theme variant URL, set the theme variant to loaded and continue.
      if (!value.urls) {
        setIsParagonThemeVariantLoaded(true);
        setIsBrandThemeVariantLoaded(true);
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
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
            }
          }
        };
        themeVariantLink.onerror = function () {
          var _PARAGON_THEME$parago, _PARAGON_THEME;
          logError("Failed to load theme variant (".concat(themeVariant, ") CSS from ").concat(value.urls["default"]));
          if (isFallbackThemeUrl) {
            logError("Could not load theme variant (".concat(themeVariant, ") CSS from fallback URL. Aborting."));
            if (isBrandOverride) {
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
            }
            var otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          var paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          var themeUrls = (_PARAGON_THEME$parago = (_PARAGON_THEME = PARAGON_THEME) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME[paragonThemeAccessor]) === null || _PARAGON_THEME === void 0 ? void 0 : _PARAGON_THEME.themeUrls) !== null && _PARAGON_THEME$parago !== void 0 ? _PARAGON_THEME$parago : {};
          if (themeUrls.variants && themeUrls.variants[themeVariant]) {
            var themeVariantFallbackUrl = fallbackThemeUrl(themeUrls.variants[themeVariant].fileName);
            logInfo("Falling back to locally installed theme variant (".concat(themeVariant, ") CSS: ").concat(themeVariantFallbackUrl));
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
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
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
        setIsBrandThemeVariantLoaded(true);
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
      setIsParagonThemeVariantLoaded(true);
      setIsBrandThemeVariantLoaded(true);
    });
  }, [themeVariants, currentThemeVariant, onLoad]);
};
export default useParagonThemeVariants;
//# sourceMappingURL=useParagonThemeVariants.js.map