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
 * Adds/updates a `<link>` element in the HTML document to load the core application theme CSS.
 *
 * @memberof module:React
 *
 * @param {object} args
 * @param {object} args.themeCore Object representing the core Paragon theme CSS.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
var useParagonThemeCore = function useParagonThemeCore(_ref) {
  var themeCore = _ref.themeCore,
    onLoad = _ref.onLoad;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isParagonThemeCoreLoaded = _useState2[0],
    setIsParagonThemeCoreLoaded = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isBrandThemeCoreLoaded = _useState4[0],
    setIsBrandThemeCoreLoaded = _useState4[1];
  useEffect(function () {
    // Call `onLoad` once both the paragon and brand theme core are loaded.
    if (isParagonThemeCoreLoaded && isBrandThemeCoreLoaded) {
      onLoad();
    }
  }, [isParagonThemeCoreLoaded, isBrandThemeCoreLoaded, onLoad]);
  useEffect(function () {
    // If there is no config for the core theme url, do nothing.
    if (!(themeCore !== null && themeCore !== void 0 && themeCore.urls)) {
      setIsParagonThemeCoreLoaded(true);
      setIsBrandThemeCoreLoaded(true);
      return;
    }
    var getParagonThemeCoreLink = function getParagonThemeCoreLink() {
      return document.head.querySelector('link[data-paragon-theme-core="true"]');
    };
    var existingCoreThemeLink = document.head.querySelector("link[href='".concat(themeCore.urls["default"], "']"));
    var brandCoreLink = document.head.querySelector("link[href='".concat(themeCore.urls.brandOverride, "']"));
    if (!existingCoreThemeLink) {
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
            setIsBrandThemeCoreLoaded(true);
          } else {
            setIsParagonThemeCoreLoaded(true);
          }
        };
        coreThemeLink.onerror = function () {
          var _PARAGON_THEME$parago, _PARAGON_THEME;
          logError("Failed to load core theme CSS from ".concat(url));
          if (isFallbackThemeUrl) {
            logError("Could not load core theme CSS from ".concat(url, " or fallback URL. Aborting."));
            if (isBrandOverride) {
              setIsBrandThemeCoreLoaded(true);
            } else {
              setIsParagonThemeCoreLoaded(true);
            }
            var otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          var paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          var themeUrls = (_PARAGON_THEME$parago = (_PARAGON_THEME = PARAGON_THEME) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME[paragonThemeAccessor]) === null || _PARAGON_THEME === void 0 ? void 0 : _PARAGON_THEME.themeUrls) !== null && _PARAGON_THEME$parago !== void 0 ? _PARAGON_THEME$parago : {};
          if (themeUrls.core) {
            var coreThemeFallbackUrl = fallbackThemeUrl(themeUrls.core.fileName);
            logInfo("Falling back to locally installed core theme CSS: ".concat(coreThemeFallbackUrl));
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
        setIsBrandThemeCoreLoaded(true);
      }
    } else {
      existingCoreThemeLink.rel = 'stylesheet';
      existingCoreThemeLink.removeAttribute('as');
      existingCoreThemeLink.dataset.paragonThemeCore = true;
      if (brandCoreLink) {
        brandCoreLink.rel = 'stylesheet';
        brandCoreLink.removeAttribute('as');
        brandCoreLink.dataset.brandThemeCore = true;
      }
      setIsParagonThemeCoreLoaded(true);
      setIsBrandThemeCoreLoaded(true);
    }
  }, [themeCore === null || themeCore === void 0 ? void 0 : themeCore.urls, onLoad]);
};
export default useParagonThemeCore;
//# sourceMappingURL=useParagonThemeCore.js.map