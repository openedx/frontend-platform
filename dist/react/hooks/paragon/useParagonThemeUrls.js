var _excluded = ["fileName"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
import { useMemo } from 'react';
import { fallbackThemeUrl, handleVersionSubstitution, isEmptyObject } from './utils';

/**
 * Returns an object containing the URLs for the theme's core CSS and any theme variants.
 *
 * @param {*} config
 * @returns {ParagonThemeUrls|undefined} An object containing the URLs for the theme's core CSS and any theme variants.
 */
var useParagonThemeUrls = function useParagonThemeUrls(config) {
  return useMemo(function () {
    var _paragonThemeUrls$cor, _paragonThemeUrls$cor2, _paragonThemeUrls$cor3, _PARAGON_THEME, _PARAGON_THEME2;
    if (!(config !== null && config !== void 0 && config.PARAGON_THEME_URLS)) {
      return undefined;
    }
    var paragonThemeUrls = config.PARAGON_THEME_URLS;
    var paragonCoreCssUrl = _typeof(paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor = paragonThemeUrls.core) === null || _paragonThemeUrls$cor === void 0 ? void 0 : _paragonThemeUrls$cor.urls) === 'object' ? paragonThemeUrls.core.urls["default"] : paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor2 = paragonThemeUrls.core) === null || _paragonThemeUrls$cor2 === void 0 ? void 0 : _paragonThemeUrls$cor2.url;
    var brandCoreCssUrl = _typeof(paragonThemeUrls === null || paragonThemeUrls === void 0 || (_paragonThemeUrls$cor3 = paragonThemeUrls.core) === null || _paragonThemeUrls$cor3 === void 0 ? void 0 : _paragonThemeUrls$cor3.urls) === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;
    var defaultThemeVariants = paragonThemeUrls.defaults;

    // Local versions of @openedx/paragon and @edx/brand
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
    themeVariantsEntries.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        themeVariant = _ref2[0],
        _ref2$ = _ref2[1],
        url = _ref2$.url,
        urls = _ref2$.urls;
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
    if (!coreCss["default"] || isEmptyObject(themeVariantsCss)) {
      var _PARAGON_THEME$parago, _PARAGON_THEME$parago2;
      var localCoreUrl = (_PARAGON_THEME$parago = PARAGON_THEME.paragon) === null || _PARAGON_THEME$parago === void 0 || (_PARAGON_THEME$parago = _PARAGON_THEME$parago.themeUrls) === null || _PARAGON_THEME$parago === void 0 ? void 0 : _PARAGON_THEME$parago.core;
      var localThemeVariants = (_PARAGON_THEME$parago2 = PARAGON_THEME.paragon) === null || _PARAGON_THEME$parago2 === void 0 || (_PARAGON_THEME$parago2 = _PARAGON_THEME$parago2.themeUrls) === null || _PARAGON_THEME$parago2 === void 0 ? void 0 : _PARAGON_THEME$parago2.variants;
      if (isEmptyObject(localCoreUrl) || isEmptyObject(localThemeVariants)) {
        return undefined;
      }
      if (!coreCss["default"]) {
        coreCss["default"] = fallbackThemeUrl(localCoreUrl === null || localCoreUrl === void 0 ? void 0 : localCoreUrl.fileName);
      }
      if (isEmptyObject(themeVariantsCss)) {
        Object.entries(localThemeVariants).forEach(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
            themeVariant = _ref5[0],
            _ref3 = _ref5[1];
          var fileName = _ref3.fileName,
            rest = _objectWithoutProperties(_ref3, _excluded);
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
        defaults: defaultThemeVariants,
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
  }, [config === null || config === void 0 ? void 0 : config.PARAGON_THEME_URLS]);
};
export default useParagonThemeUrls;
//# sourceMappingURL=useParagonThemeUrls.js.map