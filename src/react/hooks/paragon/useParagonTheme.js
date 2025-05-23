import {
  useCallback, useEffect, useReducer, useState,
} from 'react';

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
export const getDefaultThemeVariant = ({ themeVariants, themeVariantDefaults = {} }) => {
  if (!themeVariants) {
    return undefined;
  }

  const themeVariantKeys = Object.keys(themeVariants);

  // If there is only one theme variant, return it since it's the only one that may be used.
  if (themeVariantKeys.length === 1) {
    const themeVariantKey = themeVariantKeys[0];
    return {
      name: themeVariantKey,
      metadata: themeVariants[themeVariantKey],
    };
  }

  // Prioritize persisted localStorage theme variant preference.
  const persistedSelectedParagonThemeVariant = localStorage.getItem(SELECTED_THEME_VARIANT_KEY);
  if (persistedSelectedParagonThemeVariant && themeVariants[persistedSelectedParagonThemeVariant]) {
    return {
      name: persistedSelectedParagonThemeVariant,
      metadata: themeVariants[persistedSelectedParagonThemeVariant],
    };
  }

  // Then, detect system preference via `prefers-color-scheme` media query and use
  // the default dark theme variant, if one exists.
  const hasDarkSystemPreference = !!window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const defaultDarkThemeVariant = themeVariantDefaults.dark;
  const darkThemeVariantMetadata = themeVariants[defaultDarkThemeVariant];

  if (hasDarkSystemPreference && defaultDarkThemeVariant && darkThemeVariantMetadata) {
    return {
      name: defaultDarkThemeVariant,
      metadata: darkThemeVariantMetadata,
    };
  }

  const defaultLightThemeVariant = themeVariantDefaults.light;
  const lightThemeVariantMetadata = themeVariants[defaultLightThemeVariant];

  // Handle edge case where the default light theme variant is not configured or provided.
  if (!defaultLightThemeVariant || !lightThemeVariantMetadata) {
    return undefined;
  }

  // Otherwise, fallback to using the default light theme variant as configured.
  return {
    name: defaultLightThemeVariant,
    metadata: lightThemeVariantMetadata,
  };
};

/**
 * A custom React hook that manages the application's theme state and injects the appropriate CSS for the theme core
 * and theme variants (e.g., light and dark modes) into the HTML document. It handles dynamically loading the theme
 * CSS based on the current theme variant, and ensures that the theme variant's CSS is preloaded for runtime theme
 * switching. This is done using "alternate" stylesheets. That is, the browser will download the CSS for the
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
const useParagonTheme = () => {
  const paragonThemeUrls = useParagonThemeUrls();
  const {
    core: themeCore,
    defaults: themeVariantDefaults,
    variants: themeVariants,
  } = paragonThemeUrls || {};
  const initialParagonThemeState = {
    isThemeLoaded: false,
    themeVariant: getDefaultThemeVariant({ themeVariants, themeVariantDefaults })?.name,
  };
  const [themeState, dispatch] = useReducer(paragonThemeReducer, initialParagonThemeState);

  const [isCoreThemeLoaded, setIsCoreThemeLoaded] = useState(false);
  const onLoadThemeCore = useCallback(() => {
    setIsCoreThemeLoaded(true);
  }, []);

  const [hasLoadedThemeVariants, setHasLoadedThemeVariants] = useState(false);
  const onLoadThemeVariants = useCallback(() => {
    setHasLoadedThemeVariants(true);
  }, []);

  // load the core theme CSS
  useParagonThemeCore({
    themeCore,
    onComplete: onLoadThemeCore,
  });

  // respond to system preference changes with regard to `prefers-color-scheme: dark`.
  const handleDarkModeSystemPreferenceChange = useCallback((prefersDarkMode) => {
    // Ignore system preference change if the theme variant is already set in localStorage.
    if (localStorage.getItem(SELECTED_THEME_VARIANT_KEY)) {
      return;
    }

    if (prefersDarkMode && themeVariantDefaults?.dark) {
      dispatch(paragonThemeActions.setParagonThemeVariant(themeVariantDefaults.dark));
    } else if (!prefersDarkMode && themeVariantDefaults?.light) {
      dispatch(paragonThemeActions.setParagonThemeVariant(themeVariantDefaults.light));
    } else {
      logError(`Could not set theme variant based on system preference (prefers dark mode: ${prefersDarkMode})`, themeVariantDefaults, themeVariants);
    }
  }, [themeVariantDefaults, themeVariants]);

  // load the theme variant(s) CSS
  useParagonThemeVariants({
    themeVariants,
    onComplete: onLoadThemeVariants,
    currentThemeVariant: themeState.themeVariant,
    onDarkModeSystemPreferenceChange: handleDarkModeSystemPreferenceChange,
  });

  useEffect(() => {
    // theme is already loaded, do nothing
    if (themeState.isThemeLoaded) {
      return;
    }

    const hasThemeConfig = (themeCore?.urls && !isEmptyObject(themeVariants));
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
  }, [
    themeState.isThemeLoaded,
    isCoreThemeLoaded,
    hasLoadedThemeVariants,
    themeCore?.urls,
    themeVariants,
  ]);

  return [themeState, dispatch];
};

export default useParagonTheme;
