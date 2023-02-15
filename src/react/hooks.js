import {
  useCallback, useEffect, useState, useReducer,
} from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { APP_THEME_CORE, APP_THEME_LIGHT } from './constants';
import { appThemeReducer, appThemeActions } from './reducers';

/**
 * A React hook that allows functional components to subscribe to application events.  This should
 * be used sparingly - for the most part, Context should be used higher-up in the application to
 * provide necessary data to a given component, rather than utilizing a non-React-like Pub/Sub
 * mechanism.
 *
 * @memberof module:React
 * @param {string} type
 * @param {function} callback
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, [callback, type]);
};

const initialAppThemeState = {
  isThemeLoaded: false,
  themeVariant: APP_THEME_LIGHT,
};

/**
 * Adds/updates a `<link>` element in the HTML document to load the core application theme CSS.
 *
 * @memberof module:React
 * @param {object} args
 * @param {string} args.coreThemeUrl The url of the core theme CSS.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
export const useAppThemeCore = ({
  coreThemeUrl,
  onLoad,
}) => {
  useEffect(() => {
    // If the config for either the core theme url, do nothing.
    if (!coreThemeUrl) {
      return;
    }
    let coreThemeLink = document.head.querySelector(`link[href='${coreThemeUrl}']`);
    if (!coreThemeLink) {
      coreThemeLink = document.createElement('link');
      coreThemeLink.href = coreThemeUrl;
      coreThemeLink.rel = 'stylesheet';
      coreThemeLink.onload = () => {
        onLoad();
      };
      document.head.insertAdjacentElement(
        'beforeend',
        coreThemeLink,
      );
    }
  }, [coreThemeUrl, onLoad]);
};

/**
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will still download
 * the CSS for the non-current theme variants, but at a lower priority than the current theme
 * variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new
 * theme variant will already be loaded.
 *
 * Note: only "light" theme variant is currently supported.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} args.themeVariantUrls An object representing the URLs for each supported theme variant, e.g.: `{ light: 'https://path/to/light.css' }`.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
const useAppThemeVariants = ({
  themeVariantUrls,
  currentThemeVariant,
  onLoadVariantLight,
}) => {
  useEffect(() => {
    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     */
    const generateStylesheetRelAttr = (themeVariant) => (currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet');

    /**
     * A helper function to determine which theme variant callback should be used
     * based on the current theme variant.
     */
    const setThemeVariantLoaded = (themeVariant) => {
      if (themeVariant === APP_THEME_LIGHT) {
        onLoadVariantLight();
      }
    };

    /**
     * Iterate over each theme variant URL and inject it into the HTML document if it doesn't already exist.
     */
    Object.entries(themeVariantUrls).forEach(([themeVariant, themeVariantUrl]) => {
      if (!themeVariantUrl) {
        setThemeVariantLoaded(themeVariant);
        return;
      }
      let themeVariantLink = document.head.querySelector(`link[href='${themeVariantUrl}']`);
      const stylesheetRelForVariant = generateStylesheetRelAttr(themeVariant);
      if (!themeVariantLink) {
        themeVariantLink = document.createElement('link');
        themeVariantLink.href = themeVariantUrl;
        themeVariantLink.rel = stylesheetRelForVariant;
        themeVariantLink.onload = () => {
          setThemeVariantLoaded(themeVariant);
        };
        document.head.insertAdjacentElement(
          'beforeend',
          themeVariantLink,
        );
      } else if (themeVariantLink.rel !== stylesheetRelForVariant) {
        themeVariantLink.rel = stylesheetRelForVariant;
      }
    });
  }, [themeVariantUrls, currentThemeVariant, onLoadVariantLight]);
};

/**
 * Given the inputs of URLs to the CSS for the core application theme and the theme variants (e.g., light), this hook
 * will inject the CSS as `<link>` elements into the HTML document, loading each theme variant's CSS with an appropriate
 * priority based on whether its the currently active theme variant. This is done using "alternate" stylesheets. That
 * is,the browser will still download the CSS for the non-current theme variants, but at a lower priority than the
 * current theme variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new theme
 * variant will already be loaded.
 *
 * Note: only "light" theme variant is currently supported, though the intent is also support "dark" theme
 * variant in the future.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} args.themeUrls Should contain the URLs for the theme's core CSS and any theme
 *  variants, e.g. `{ core: 'https://path/to/core.css', variants: { light: 'https://path/to/light.css' } }`.
 *
 * @returns An array containing 2 elements: 1) an object containing the app
 *  theme state, and 2) a dispatch function to mutate the app theme state.
 */
export const useAppTheme = ({
  themeUrls: {
    [APP_THEME_CORE]: coreThemeUrl,
    variants: themeVariantUrls,
  },
}) => {
  const [appThemeState, dispatch] = useReducer(appThemeReducer, initialAppThemeState);

  const [isCoreThemeLoaded, setIsCoreThemeLoaded] = useState(false);
  const [isLightVariantLoaded, setIsLightVariantLoaded] = useState(false);

  const onThemeCoreLoad = useCallback(() => {
    setIsCoreThemeLoaded(true);
  }, []);

  const onLoadThemeVariantLight = useCallback(() => {
    setIsLightVariantLoaded(true);
  }, []);

  // load the core theme CSS
  useAppThemeCore({
    coreThemeUrl,
    onLoad: onThemeCoreLoad,
  });

  // load the theme variant(s) CSS
  useAppThemeVariants({
    themeVariantUrls,
    onLoadVariantLight: onLoadThemeVariantLight,
  });

  useEffect(() => {
    // theme is already loaded, do nothing
    if (appThemeState.isThemeLoaded) {
      return;
    }

    // the core theme and light theme variant is still loading, do nothing.
    const isDefaultThemeLoaded = (isCoreThemeLoaded && isLightVariantLoaded);
    if (!isDefaultThemeLoaded) {
      return;
    }

    // All application theme URLs are loaded
    dispatch(appThemeActions.setAppThemeLoaded(true));
  }, [
    appThemeState.isThemeLoaded,
    isCoreThemeLoaded,
    isLightVariantLoaded,
    themeVariantUrls,
  ]);

  return [appThemeState, dispatch];
};
