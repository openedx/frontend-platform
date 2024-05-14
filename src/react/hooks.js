import {
  useCallback, useEffect, useState, useReducer,
} from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';
import {
  PARAGON_THEME_CORE,
  PARAGON_THEME_VARIANT_LIGHT,
} from './constants';
import { paragonThemeReducer, paragonThemeActions } from './reducers';

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

const initialParagonThemeState = {
  isThemeLoaded: false,
  themeVariant: PARAGON_THEME_VARIANT_LIGHT,
};

/**
 * Adds/updates a `<link>` element in the HTML document to load the core application theme CSS.
 *
 * @memberof module:React
 * @param {object} args
 * @param {string} args.coreThemeUrl The url of the core theme CSS.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
export const useParagonThemeCore = ({
  coreThemeUrl,
  onLoad,
}) => {
  useEffect(() => {
    // If there is no config for the core theme url, do nothing.
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
        'afterbegin',
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
const useParagonThemeVariants = ({
  themeVariantUrls,
  currentThemeVariant,
  onLoadThemeVariantLight,
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
      if (themeVariant === PARAGON_THEME_VARIANT_LIGHT) {
        onLoadThemeVariantLight();
      }
    };

    /**
     * Iterate over each theme variant URL and inject it into the HTML document if it doesn't already exist.
     */
    Object.entries(themeVariantUrls).forEach(([themeVariant, themeVariantUrl]) => {
      // If there is no config for the theme variant URL, set the theme variant to loaded and continue.
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
          'afterbegin',
          themeVariantLink,
        );
      } else if (themeVariantLink.rel !== stylesheetRelForVariant) {
        themeVariantLink.rel = stylesheetRelForVariant;
      }
    });
  }, [themeVariantUrls, currentThemeVariant, onLoadThemeVariantLight]);
};

/**
 * TODO
 * @param {*} config
 * @returns
 */
const getParagonThemeUrls = (config) => {
  if (config.PARAGON_THEME_URLS) {
    return config.PARAGON_THEME_URLS;
  }
  return {
    [PARAGON_THEME_CORE]: config.PARAGON_THEME_CORE_URL,
    // [PARAGON_THEME_CORE]: undefined,
    variants: {
      [PARAGON_THEME_VARIANT_LIGHT]: config.PARAGON_THEME_VARIANTS_LIGHT_URL,
      // [PARAGON_THEME_VARIANT_LIGHT]: undefined,
    },
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
export const useParagonTheme = (config) => {
  const paragonThemeUrls = getParagonThemeUrls(config);
  const {
    core: coreThemeUrl,
    variants: themeVariantUrls,
  } = paragonThemeUrls;

  const [themeState, dispatch] = useReducer(paragonThemeReducer, initialParagonThemeState);

  const [isCoreThemeLoaded, setIsCoreThemeLoaded] = useState(false);
  const [isLightThemeVariantLoaded, setIsLightThemeVariantLoaded] = useState(false);

  const onLoadThemeCore = useCallback(() => {
    setIsCoreThemeLoaded(true);
  }, []);

  const onLoadThemeVariantLight = useCallback(() => {
    setIsLightThemeVariantLoaded(true);
  }, []);

  // load the core theme CSS
  useParagonThemeCore({
    coreThemeUrl,
    onLoad: onLoadThemeCore,
  });

  // load the theme variant(s) CSS
  useParagonThemeVariants({
    themeVariantUrls,
    onLoadThemeVariantLight,
    currentThemeVariant: themeState.themeVariant,
  });

  useEffect(() => {
    // theme is already loaded, do nothing
    if (themeState.isThemeLoaded) {
      return;
    }

    // the core theme and light theme variant is still loading, do nothing.
    const hasDefaultThemeConfig = (coreThemeUrl && themeVariantUrls[PARAGON_THEME_VARIANT_LIGHT]);
    if (!hasDefaultThemeConfig) {
      // no theme URLs to load, set loading to false.
      dispatch(paragonThemeActions.setParagonThemeLoaded(true));
    }

    const isDefaultThemeLoaded = (isCoreThemeLoaded && isLightThemeVariantLoaded);
    if (!isDefaultThemeLoaded) {
      return;
    }

    // All application theme URLs are loaded
    dispatch(paragonThemeActions.setParagonThemeLoaded(true));
  }, [
    themeState.isThemeLoaded,
    isCoreThemeLoaded,
    isLightThemeVariantLoaded,
    themeVariantUrls,
    coreThemeUrl,
  ]);

  return [themeState, dispatch];
};
