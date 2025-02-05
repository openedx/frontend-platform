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
* Finds the default theme variant from the given theme variants object. If no default theme exists, the first theme
* variant is returned as a fallback.
* @param {Object.<string, ParagonThemeVariant>|undefined} themeVariants
*
* @returns {ParagonThemeVariant|undefined} The default theme variant.
*/
export const getDefaultThemeVariant = ({ themeVariants, themeVariantDefaults = {} }) => {
  if (!themeVariants) {
    return undefined;
  }

  const themeVariantKeys = Object.keys(themeVariants);

  // Return early if there are no theme variants configured.
  if (themeVariantKeys.length === 0) {
    return undefined;
  }
  // If there is only one theme variant, return it since it's the only one that may be used.
  if (themeVariantKeys.length === 1) {
    const themeVariantKey = themeVariantKeys[0];
    return {
      name: themeVariantKey,
      metadata: themeVariants[themeVariantKey],
    };
  }
  // There's more than one theme variant configured; figured out which one to display based on
  // the following preference rules:
  //   1. Get theme preference from localStorage.
  //   2. Detect user system settings.
  //   3. Use the default theme variant as configured.

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
 * Given the inputs of URLs to the CSS for the core application theme and the theme variants (e.g., light), this hook
 * will inject the CSS as `<link>` elements into the HTML document, loading each theme variant's CSS with an appropriate
 * priority based on whether its the currently active theme variant. This is done using "alternate" stylesheets. That
 * is,the browser will still download the CSS for the non-current theme variants, but at a lower priority than the
 * current theme variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new theme
 * variant will already be loaded.
 *
 * @memberof module:React
 *
 * @returns An array containing 2 elements: 1) an object containing the app
 *  theme state, and 2) a dispatch function to mutate the app theme state.
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
    onLoad: onLoadThemeCore,
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
    onLoad: onLoadThemeVariants,
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
