import {
  useCallback, useEffect, useReducer, useState,
} from 'react';
import useParagonThemeUrls from './useParagonThemeUrls';
import { getDefaultThemeVariant } from './utils';
import { paragonThemeActions, paragonThemeReducer } from '../../reducers';
import useParagonThemeCore from './useParagonThemeCore';
import { SELECTED_THEME_VARIANT_KEY } from '../../constants';
import { logError } from '../../../logging';
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
const useParagonTheme = (config) => {
  const paragonThemeUrls = useParagonThemeUrls(config);
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

    const hasThemeConfig = (themeCore?.urls && Object.keys(themeVariants).length > 0);
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
