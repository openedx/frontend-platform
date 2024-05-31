function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { useCallback, useEffect, useReducer, useState } from 'react';
import { SELECTED_THEME_VARIANT_KEY } from '../../constants';
import { logError } from '../../../logging';
import { paragonThemeActions, paragonThemeReducer } from '../../reducers';
import { getDefaultThemeVariant, isEmptyObject } from './utils';
import useParagonThemeCore from './useParagonThemeCore';
import useParagonThemeUrls from './useParagonThemeUrls';
import useParagonThemeVariants from './useParagonThemeVariants';

/**
 * Given the inputs of URLs to the CSS for the core application theme and the theme variants (e.g., light), this hook
 * will inject the CSS as `<link>` elements into the HTML document, loading each theme variant's CSS with an appropriate
 * priority based on whether its the currently active theme variant. This is done using "alternate" stylesheets. That
 * is,the browser will still download the CSS for the non-current theme variants, but at a lower priority than the
 * current theme variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new theme
 * variant will already be loaded.
 *
 * @memberof module:React
 * @param {object} config An object containing the URLs for the theme's core CSS and any theme (i.e., `getConfig()`)
 *
 * @returns An array containing 2 elements: 1) an object containing the app
 *  theme state, and 2) a dispatch function to mutate the app theme state.
 */
var useParagonTheme = function useParagonTheme(config) {
  var _getDefaultThemeVaria;
  var paragonThemeUrls = useParagonThemeUrls(config);
  var _ref = paragonThemeUrls || {},
    themeCore = _ref.core,
    themeVariantDefaults = _ref.defaults,
    themeVariants = _ref.variants;
  var initialParagonThemeState = {
    isThemeLoaded: false,
    themeVariant: (_getDefaultThemeVaria = getDefaultThemeVariant({
      themeVariants: themeVariants,
      themeVariantDefaults: themeVariantDefaults
    })) === null || _getDefaultThemeVaria === void 0 ? void 0 : _getDefaultThemeVaria.name
  };
  var _useReducer = useReducer(paragonThemeReducer, initialParagonThemeState),
    _useReducer2 = _slicedToArray(_useReducer, 2),
    themeState = _useReducer2[0],
    dispatch = _useReducer2[1];
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isCoreThemeLoaded = _useState2[0],
    setIsCoreThemeLoaded = _useState2[1];
  var onLoadThemeCore = useCallback(function () {
    setIsCoreThemeLoaded(true);
  }, []);
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    hasLoadedThemeVariants = _useState4[0],
    setHasLoadedThemeVariants = _useState4[1];
  var onLoadThemeVariants = useCallback(function () {
    setHasLoadedThemeVariants(true);
  }, []);

  // load the core theme CSS
  useParagonThemeCore({
    themeCore: themeCore,
    onLoad: onLoadThemeCore
  });

  // respond to system preference changes with regard to `prefers-color-scheme: dark`.
  var handleDarkModeSystemPreferenceChange = useCallback(function (prefersDarkMode) {
    // Ignore system preference change if the theme variant is already set in localStorage.
    if (localStorage.getItem(SELECTED_THEME_VARIANT_KEY)) {
      return;
    }
    if (prefersDarkMode && themeVariantDefaults !== null && themeVariantDefaults !== void 0 && themeVariantDefaults.dark) {
      dispatch(paragonThemeActions.setParagonThemeVariant(themeVariantDefaults.dark));
    } else if (!prefersDarkMode && themeVariantDefaults !== null && themeVariantDefaults !== void 0 && themeVariantDefaults.light) {
      dispatch(paragonThemeActions.setParagonThemeVariant(themeVariantDefaults.light));
    } else {
      logError("Could not set theme variant based on system preference (prefers dark mode: ".concat(prefersDarkMode, ")"), themeVariantDefaults, themeVariants);
    }
  }, [themeVariantDefaults, themeVariants]);

  // load the theme variant(s) CSS
  useParagonThemeVariants({
    themeVariants: themeVariants,
    onLoad: onLoadThemeVariants,
    currentThemeVariant: themeState.themeVariant,
    onDarkModeSystemPreferenceChange: handleDarkModeSystemPreferenceChange
  });
  useEffect(function () {
    // theme is already loaded, do nothing
    if (themeState.isThemeLoaded) {
      return;
    }
    var hasThemeConfig = (themeCore === null || themeCore === void 0 ? void 0 : themeCore.urls) && !isEmptyObject(themeVariants);
    if (!hasThemeConfig) {
      // no theme URLs to load, set loading to false.
      dispatch(paragonThemeActions.setParagonThemeLoaded(true));
    }

    // Return early if neither the core theme CSS nor any theme variant CSS is loaded.
    if (!isCoreThemeLoaded || !hasLoadedThemeVariants) {
      return;
    }

    // All application theme URLs are loaded
    dispatch(paragonThemeActions.setParagonThemeLoaded(true));
  }, [themeState.isThemeLoaded, isCoreThemeLoaded, hasLoadedThemeVariants, themeCore === null || themeCore === void 0 ? void 0 : themeCore.urls, themeVariants]);
  return [themeState, dispatch];
};
export default useParagonTheme;
//# sourceMappingURL=useParagonTheme.js.map