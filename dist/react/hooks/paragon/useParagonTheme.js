function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useCallback, useEffect, useReducer, useState } from 'react';
import { SELECTED_THEME_VARIANT_KEY } from '../../constants';
import { logError } from '../../../logging';
import { paragonThemeActions, paragonThemeReducer } from '../../reducers';
import { isEmptyObject } from './utils';
import useParagonThemeCore from './useParagonThemeCore';
import useParagonThemeUrls from './useParagonThemeUrls';
import useParagonThemeVariants from './useParagonThemeVariants';

/**
* Finds the default theme variant from the given theme variants object. If no default theme exists, the light theme
* variant is returned as a fallback.
*
* It prioritizes:
*   1. A persisted theme variant from localStorage.
*   2. A system preference (`prefers-color-scheme`).
*   3. The configured default theme variant.
*
* @param {Object.<string, ParagonThemeVariant>|undefined} themeVariants - An object where the keys are theme variant
* names (e.g., "light", "dark") and the values are objects containing URLs for theme CSS files.
* @param {Object} [options.themeVariantDefaults={}] - An object containing default theme variant preferences.
*
* @returns {Object|undefined} The default theme variant, or `undefined` if no valid theme variant is found.
*
*/
export var getDefaultThemeVariant = function getDefaultThemeVariant(_ref) {
  var _window$matchMedia, _window;
  var themeVariants = _ref.themeVariants,
    _ref$themeVariantDefa = _ref.themeVariantDefaults,
    themeVariantDefaults = _ref$themeVariantDefa === void 0 ? {} : _ref$themeVariantDefa;
  if (!themeVariants) {
    return undefined;
  }
  var themeVariantKeys = Object.keys(themeVariants);

  // If there is only one theme variant, return it since it's the only one that may be used.
  if (themeVariantKeys.length === 1) {
    var themeVariantKey = themeVariantKeys[0];
    return {
      name: themeVariantKey,
      metadata: themeVariants[themeVariantKey]
    };
  }

  // Prioritize persisted localStorage theme variant preference.
  var persistedSelectedParagonThemeVariant = localStorage.getItem(SELECTED_THEME_VARIANT_KEY);
  if (persistedSelectedParagonThemeVariant && themeVariants[persistedSelectedParagonThemeVariant]) {
    return {
      name: persistedSelectedParagonThemeVariant,
      metadata: themeVariants[persistedSelectedParagonThemeVariant]
    };
  }

  // Then, detect system preference via `prefers-color-scheme` media query and use
  // the default dark theme variant, if one exists.
  var hasDarkSystemPreference = !!((_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && (_window$matchMedia = _window$matchMedia.call(_window, '(prefers-color-scheme: dark)')) !== null && _window$matchMedia !== void 0 && _window$matchMedia.matches);
  var defaultDarkThemeVariant = themeVariantDefaults.dark;
  var darkThemeVariantMetadata = themeVariants[defaultDarkThemeVariant];
  if (hasDarkSystemPreference && defaultDarkThemeVariant && darkThemeVariantMetadata) {
    return {
      name: defaultDarkThemeVariant,
      metadata: darkThemeVariantMetadata
    };
  }
  var defaultLightThemeVariant = themeVariantDefaults.light;
  var lightThemeVariantMetadata = themeVariants[defaultLightThemeVariant];

  // Handle edge case where the default light theme variant is not configured or provided.
  if (!defaultLightThemeVariant || !lightThemeVariantMetadata) {
    return undefined;
  }

  // Otherwise, fallback to using the default light theme variant as configured.
  return {
    name: defaultLightThemeVariant,
    metadata: lightThemeVariantMetadata
  };
};

/**
 * A custom React hook that manages the application's theme state and injects the appropriate CSS for the theme core
 * and theme variants (e.g., light and dark modes) into the HTML document. It handles dynamically loading the theme
 * CSS based on the current theme variant, and ensures that the theme variant's CSS is preloaded for runtime theme
 * switching.This is done using "alternate" stylesheets. That is, the browser will download the CSS for the
 * non-current theme variants with a lower priority than the current one.
 *
 * The hook also responds to system theme preference changes (e.g., via the `prefers-color-scheme` media query),
 * and can automatically switch the theme based on the system's dark mode or light mode preference.
 *
 * @memberof module:React
 *
 * @returns {Array} - An array containing:
 *  1. An object representing the current theme state.
 *  2. A dispatch function to mutate the app theme state (e.g., change the theme variant).
 *
 * * @example
 * const [themeState, dispatch] = useParagonTheme();
 * console.log(themeState.isThemeLoaded); // true when the theme has been successfully loaded.
 *
 * // Dispatch an action to change the theme variant
 * dispatch(paragonThemeActions.setParagonThemeVariant('dark'));
 */
var useParagonTheme = function useParagonTheme() {
  var _getDefaultThemeVaria;
  var paragonThemeUrls = useParagonThemeUrls();
  var _ref2 = paragonThemeUrls || {},
    themeCore = _ref2.core,
    themeVariantDefaults = _ref2.defaults,
    themeVariants = _ref2.variants;
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
    onComplete: onLoadThemeCore
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
    onComplete: onLoadThemeVariants,
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