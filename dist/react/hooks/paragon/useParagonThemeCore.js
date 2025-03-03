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
 * Custom React hook that manages the loading and updating of the core Paragon theme CSS and the brand override
 * theme CSS. It ensures that the core theme CSS (both default and brand override) is added to the document
 * `<head>` as `<link>` elements.
 *
 * The function logs and handles fallback logic in case the core theme fails to load.
 *
 * @memberof module:React
 *
 * @param {Object} args - The arguments object containing theme and callback information.
 * @param {Object} args.themeCore - The core theme configuration.
 * @param {string} args.themeCore.urls.default - The URL to the default core theme CSS.
 * @param {string} [args.themeCore.urls.brandOverride] - The URL to the brand override theme CSS (optional).
 * @param {Function} args.onComplete - A callback function that is called once both the core Paragon (default)
 * theme and brand override theme (if provided) are complete.
 */
var useParagonThemeCore = function useParagonThemeCore(_ref) {
  var themeCore = _ref.themeCore,
    onComplete = _ref.onComplete;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isParagonThemeCoreComplete = _useState2[0],
    setIsParagonThemeCoreComplete = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isBrandThemeCoreComplete = _useState4[0],
    setIsBrandThemeCoreComplete = _useState4[1];
  useEffect(function () {
    // Call `onComplete` once both the paragon and brand theme core are complete.
    if (isParagonThemeCoreComplete && isBrandThemeCoreComplete) {
      onComplete();
    }
  }, [isParagonThemeCoreComplete, isBrandThemeCoreComplete, onComplete]);
  useEffect(function () {
    // If there is no config for the core theme url, do nothing.
    if (!(themeCore !== null && themeCore !== void 0 && themeCore.urls)) {
      setIsParagonThemeCoreComplete(true);
      setIsBrandThemeCoreComplete(true);
      return;
    }
    var existingCoreThemeLink = document.head.querySelector("link[href='".concat(themeCore.urls["default"], "']"));
    var brandCoreLink = document.head.querySelector("link[href='".concat(themeCore.urls.brandOverride, "']"));
    if (existingCoreThemeLink) {
      existingCoreThemeLink.rel = 'stylesheet';
      existingCoreThemeLink.removeAttribute('as');
      existingCoreThemeLink.dataset.paragonThemeCore = true;
      if (brandCoreLink) {
        brandCoreLink.rel = 'stylesheet';
        brandCoreLink.removeAttribute('as');
        brandCoreLink.dataset.brandThemeCore = true;
      }
      setIsParagonThemeCoreComplete(true);
      setIsBrandThemeCoreComplete(true);
      return;
    }
    var getParagonThemeCoreLink = function getParagonThemeCoreLink() {
      return document.head.querySelector('link[data-paragon-theme-core="true"]');
    };
    var getExistingCoreThemeLinks = function getExistingCoreThemeLinks(isBrandOverride) {
      var coreThemeLinkSelector = "link[data-".concat(isBrandOverride ? 'brand' : 'paragon', "-theme-core=\"true\"]");
      return document.head.querySelectorAll(coreThemeLinkSelector);
    };
    var _createCoreThemeLink = function createCoreThemeLink(url) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$isFallbackTheme = _ref2.isFallbackThemeUrl,
        isFallbackThemeUrl = _ref2$isFallbackTheme === void 0 ? false : _ref2$isFallbackTheme,
        _ref2$isBrandOverride = _ref2.isBrandOverride,
        isBrandOverride = _ref2$isBrandOverride === void 0 ? false : _ref2$isBrandOverride;
      var coreThemeLink = document.createElement('link');
      coreThemeLink.href = url;
      coreThemeLink.rel = 'stylesheet';
      if (isBrandOverride) {
        coreThemeLink.dataset.brandThemeCore = true;
      } else {
        coreThemeLink.dataset.paragonThemeCore = true;
      }
      coreThemeLink.onload = function () {
        if (isBrandOverride) {
          setIsBrandThemeCoreComplete(true);
        } else {
          setIsParagonThemeCoreComplete(true);
        }
      };
      coreThemeLink.onerror = function () {
        var _PARAGON_THEME$parago, _PARAGON_THEME;
        if (isFallbackThemeUrl) {
          logError('Could not load core theme fallback URL. Aborting.');
          if (isBrandOverride) {
            setIsBrandThemeCoreComplete(true);
          } else {
            setIsParagonThemeCoreComplete(true);
          }
          var otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
          removeExistingLinks(otherExistingLinks);
          return;
        }
        var paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
        var core = (_PARAGON_THEME$parago = (_PARAGON_THEME = PARAGON_THEME) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME[paragonThemeAccessor]) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME.themeUrls) === null || _PARAGON_THEME === void 0 ? void 0 : _PARAGON_THEME.core) !== null && _PARAGON_THEME$parago !== void 0 ? _PARAGON_THEME$parago : null;
        if (core) {
          var coreThemeFallbackUrl = fallbackThemeUrl(core.fileName);
          logInfo("Could not load core theme CSS from ".concat(url, ". Falling back to locally installed core theme CSS: ").concat(coreThemeFallbackUrl));
          coreThemeLink = _createCoreThemeLink(coreThemeFallbackUrl, {
            isFallbackThemeUrl: true,
            isBrandOverride: isBrandOverride
          });
          var _otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
          removeExistingLinks(_otherExistingLinks);
          var foundParagonThemeCoreLink = getParagonThemeCoreLink();
          if (foundParagonThemeCoreLink) {
            foundParagonThemeCoreLink.insertAdjacentElement('afterend', coreThemeLink);
          } else {
            document.head.insertAdjacentElement('afterbegin', coreThemeLink);
          }
        } else {
          logError("Failed to load core theme CSS from ".concat(url, " or fallback URL. Aborting."));
        }
      };
      return coreThemeLink;
    };
    var paragonCoreThemeLink = _createCoreThemeLink(themeCore.urls["default"]);
    document.head.insertAdjacentElement('afterbegin', paragonCoreThemeLink);
    if (themeCore.urls.brandOverride) {
      var brandCoreThemeLink = _createCoreThemeLink(themeCore.urls.brandOverride, {
        isBrandOverride: true
      });
      var foundParagonThemeCoreLink = getParagonThemeCoreLink();
      if (foundParagonThemeCoreLink) {
        foundParagonThemeCoreLink.insertAdjacentElement('afterend', brandCoreThemeLink);
      } else {
        document.head.insertAdjacentElement('afterbegin', brandCoreThemeLink);
      }
    } else {
      setIsBrandThemeCoreComplete(true);
    }
  }, [themeCore === null || themeCore === void 0 ? void 0 : themeCore.urls, onComplete]);
};
export default useParagonThemeCore;
//# sourceMappingURL=useParagonThemeCore.js.map