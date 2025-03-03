var _excluded = ["fileName"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
import { useMemo } from 'react';
import { fallbackThemeUrl, isEmptyObject } from './utils';
import { getConfig } from '../../../config';

/**
 * Replaces a wildcard in the URL string with a provided local version string.
 * This is typically used to substitute a version placeholder (e.g., `$paragonVersion`)
 * in URLs with actual version values.
 *
 * @param {Object} args - The arguments object for version substitution.
 * @param {string} args.url - The URL string that may contain a wildcard keyword (e.g., `$paragonVersion`).
 * @param {string} args.wildcardKeyword - The keyword (e.g., `$paragonVersion`) in the URL to be replaced
 * with the local version.
 * @param {string} args.localVersion - The local version string to replace the wildcard with.
 *
 * @returns {string} The URL with the wildcard keyword replaced by the provided version string.
 * If the conditions are not met (e.g., missing URL or version), the original URL is returned.
 *
 * @example
 * const url = 'https://cdn.example.com/$paragonVersion/theme.css';
 * const version = '1.0.0';
 * const updatedUrl = handleVersionSubstitution({ url, wildcardKeyword: '$paragonVersion', localVersion: version });
 * console.log(updatedUrl); // Outputs: 'https://cdn.example.com/1.0.0/theme.css'
 */
export var handleVersionSubstitution = function handleVersionSubstitution(_ref) {
  var url = _ref.url,
    wildcardKeyword = _ref.wildcardKeyword,
    localVersion = _ref.localVersion;
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replaceAll(wildcardKeyword, localVersion);
};

/**
 * Custom React hook that retrieves the Paragon theme URLs, including the core theme CSS and any theme variants.
 * It supports version substitution for the Paragon and brand versions and returns a structured object containing
 * the URLs. The hook also handles fallback scenarios when the URLs are unavailable in the configuration or when
 * version substitution is required.
 *
 * @returns {Object|undefined} An object containing:
 *   - `core`: The core theme URLs (including default and brand override).
 *   - `defaults`: Any default theme variants.
 *   - `variants`: The URLs for any additional theme variants (default and brand override).
 *
 *   If the required URLs are not available or cannot be determined, `undefined` is returned.
 *
 * @example
 * const themeUrls = useParagonThemeUrls();
 * if (themeUrls) {
 *   console.log(themeUrls.core.urls.default); // Outputs the URL of the core theme CSS
 *   console.log(themeUrls.variants['dark'].urls.default); // Outputs the URL of the dark theme variant CSS
 * }
 *
 */
var useParagonThemeUrls = function useParagonThemeUrls() {
  return useMemo(function () {
    var _paragonThemeUrls$cor, _paragonThemeUrls$cor2, _paragonThemeUrls$cor3, _PARAGON_THEME, _PARAGON_THEME2;
    var _getConfig = getConfig(),
      paragonThemeUrls = _getConfig.PARAGON_THEME_URLS;
    if (!paragonThemeUrls) {
      return undefined;
    }
    var paragonCoreCssUrl = _typeof(paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor = paragonThemeUrls.core) === null || _paragonThemeUrls$cor === void 0 ? void 0 : _paragonThemeUrls$cor.urls) === 'object' ? paragonThemeUrls.core.urls["default"] : paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor2 = paragonThemeUrls.core) === null || _paragonThemeUrls$cor2 === void 0 ? void 0 : _paragonThemeUrls$cor2.url;
    var brandCoreCssUrl = _typeof(paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor3 = paragonThemeUrls.core) === null || _paragonThemeUrls$cor3 === void 0 ? void 0 : _paragonThemeUrls$cor3.urls) === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;
    var defaultThemeVariants = paragonThemeUrls.defaults;

    // Local versions of @openedx/paragon and @edx/brand
    // these are only used when passed into handleVersionSubstitution
    // which does not attempt substitution using falsy value
    var localParagonVersion = (_PARAGON_THEME = PARAGON_THEME) === null || _PARAGON_THEME === void 0 || (_PARAGON_THEME = _PARAGON_THEME.paragon) === null || _PARAGON_THEME === void 0 ? void 0 : _PARAGON_THEME.version;
    var localBrandVersion = (_PARAGON_THEME2 = PARAGON_THEME) === null || _PARAGON_THEME2 === void 0 || (_PARAGON_THEME2 = _PARAGON_THEME2.brand) === null || _PARAGON_THEME2 === void 0 ? void 0 : _PARAGON_THEME2.version;
    var coreCss = {
      "default": handleVersionSubstitution({
        url: paragonCoreCssUrl,
        wildcardKeyword: '$paragonVersion',
        localVersion: localParagonVersion
      }),
      brandOverride: handleVersionSubstitution({
        url: brandCoreCssUrl,
        wildcardKeyword: '$brandVersion',
        localVersion: localBrandVersion
      })
    };
    var themeVariantsCss = {};
    var themeVariantsEntries = Object.entries(paragonThemeUrls.variants || {});
    themeVariantsEntries.forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
        themeVariant = _ref3[0],
        _ref3$ = _ref3[1],
        url = _ref3$.url,
        urls = _ref3$.urls;
      var themeVariantMetadata = {
        urls: null
      };
      if (url) {
        themeVariantMetadata.urls = {
          "default": handleVersionSubstitution({
            url: url,
            wildcardKeyword: '$paragonVersion',
            localVersion: localParagonVersion
          })
        };
      } else {
        themeVariantMetadata.urls = {
          "default": handleVersionSubstitution({
            url: urls["default"],
            wildcardKeyword: '$paragonVersion',
            localVersion: localParagonVersion
          }),
          brandOverride: handleVersionSubstitution({
            url: urls.brandOverride,
            wildcardKeyword: '$brandVersion',
            localVersion: localBrandVersion
          })
        };
      }
      themeVariantsCss[themeVariant] = themeVariantMetadata;
    });

    // If we don't have  the core default or any theme variants, use the PARAGON_THEME
    if (!coreCss["default"] || isEmptyObject(themeVariantsCss) || isEmptyObject(defaultThemeVariants)) {
      var _PARAGON_THEME$parago, _PARAGON_THEME$parago2, _PARAGON_THEME$parago3;
      var localCoreUrl = (_PARAGON_THEME$parago = PARAGON_THEME.paragon) === null || _PARAGON_THEME$parago === void 0 || (_PARAGON_THEME$parago = _PARAGON_THEME$parago.themeUrls) === null || _PARAGON_THEME$parago === void 0 ? void 0 : _PARAGON_THEME$parago.core;
      var localThemeVariants = (_PARAGON_THEME$parago2 = PARAGON_THEME.paragon) === null || _PARAGON_THEME$parago2 === void 0 || (_PARAGON_THEME$parago2 = _PARAGON_THEME$parago2.themeUrls) === null || _PARAGON_THEME$parago2 === void 0 ? void 0 : _PARAGON_THEME$parago2.variants;
      var localDefaultThemeVariants = (_PARAGON_THEME$parago3 = PARAGON_THEME.paragon) === null || _PARAGON_THEME$parago3 === void 0 || (_PARAGON_THEME$parago3 = _PARAGON_THEME$parago3.themeUrls) === null || _PARAGON_THEME$parago3 === void 0 ? void 0 : _PARAGON_THEME$parago3.defaults;
      if (isEmptyObject(localCoreUrl) || isEmptyObject(localThemeVariants)) {
        return undefined;
      }
      if (!coreCss["default"]) {
        coreCss["default"] = fallbackThemeUrl(localCoreUrl === null || localCoreUrl === void 0 ? void 0 : localCoreUrl.fileName);
      }
      if (isEmptyObject(themeVariantsCss)) {
        Object.entries(localThemeVariants).forEach(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
            themeVariant = _ref6[0],
            _ref4 = _ref6[1];
          var fileName = _ref4.fileName,
            rest = _objectWithoutProperties(_ref4, _excluded);
          themeVariantsCss[themeVariant] = {
            urls: _objectSpread({
              "default": fallbackThemeUrl(fileName)
            }, rest.urls)
          };
        });
      }
      return {
        core: {
          urls: coreCss
        },
        defaults: defaultThemeVariants || localDefaultThemeVariants,
        variants: themeVariantsCss
      };
    }
    return {
      core: {
        urls: coreCss
      },
      defaults: defaultThemeVariants,
      variants: themeVariantsCss
    };
  }, []);
};
export default useParagonThemeUrls;
//# sourceMappingURL=useParagonThemeUrls.js.map