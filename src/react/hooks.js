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
import { logError, logInfo } from '../logging';
import { getConfig } from '../config';

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
      const getExistingCoreThemeLinks = () => document.head.querySelectorAll('link[data-paragon-theme-core="true"]');
      const removeExistingLinks = (existingLinks) => {
        existingLinks.forEach((link) => {
          link.remove();
        });
      };
      // find existing links
      const existingLinks = getExistingCoreThemeLinks();

      // create new link
      const createCoreThemeLink = (url) => {
        coreThemeLink = document.createElement('link');
        coreThemeLink.href = url;
        console.log('createCoreThemeLink', url);
        coreThemeLink.rel = 'stylesheet';
        coreThemeLink.dataset.paragonThemeCore = true;
        coreThemeLink.onload = () => {
          onLoad();
          removeExistingLinks(existingLinks);
        };
        coreThemeLink.onerror = () => {
          logError(`Failed to load core theme CSS from ${url}`);
          if (PARAGON?.themeUrls?.core?.outputChunkName) {
            const coreOutputChunkCss = `${PARAGON.themeUrls.core.outputChunkName}.css`;
            const coreThemeFallbackUrl = `${getConfig().BASE_URL}/${coreOutputChunkCss}`;
            logInfo(`Falling back to locally installed core theme CSS: ${coreThemeFallbackUrl}`);
            coreThemeLink = createCoreThemeLink(coreThemeFallbackUrl);
            const otherExistingLinks = getExistingCoreThemeLinks();
            removeExistingLinks(otherExistingLinks);
            document.head.insertAdjacentElement(
              'afterbegin',
              coreThemeLink,
            );
          }
        };
        return coreThemeLink;
      };
      coreThemeLink = createCoreThemeLink(coreThemeUrl);
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
        const getExistingThemeVariantLinks = () => document.head.querySelectorAll(`link[data-paragon-theme-variant='${themeVariant}']`);
        // find existing links
        const existingLinks = getExistingThemeVariantLinks();

        // create new link
        const createThemeVariantLink = (url) => {
          themeVariantLink = document.createElement('link');
          themeVariantLink.href = url;
          themeVariantLink.rel = 'stylesheet';
          themeVariantLink.dataset.paragonThemeVariant = themeVariant;
          themeVariantLink.onload = () => {
            setThemeVariantLoaded(themeVariant);
            existingLinks.forEach((link) => {
              link.remove();
            });
          };
          themeVariantLink.onerror = () => {
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${themeVariantUrl}`);
            if (PARAGON?.themeUrls?.variants?.[themeVariant]?.outputChunkName) {
              const themeVariantOutputChunkCss = `${PARAGON?.themeUrls?.variants?.[themeVariant]?.outputChunkName}.css`;
              const themeVariantFallbackUrl = `${getConfig().BASE_URL}/${themeVariantOutputChunkCss}`;
              logInfo(`Falling back to locally installed theme variant (${themeVariant}) CSS: ${themeVariantFallbackUrl}`);
              themeVariantLink = createThemeVariantLink(themeVariantFallbackUrl);
              const otherExistingLinks = getExistingThemeVariantLinks();
              otherExistingLinks.forEach((link) => {
                link.remove();
              });
              document.head.insertAdjacentElement(
                'afterbegin',
                themeVariantLink,
              );
            }
          };
          return themeVariantLink;
        };
        themeVariantLink = createThemeVariantLink(themeVariantUrl);
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

const handleParagonVersionSubstitution = (url) => {
  if (!url || !url.includes('$paragonVersion') || !PARAGON?.version) {
    return url;
  }
  return url.replace('$paragonVersion', PARAGON.version);
};

/**
 * TODO
 * @param {*} config
 * @returns An object containing the URLs for the theme's core CSS and any theme variants.
 */
const getParagonThemeUrls = (config) => {
  const coreCssUrl = config.PARAGON_THEME_URLS?.[PARAGON_THEME_CORE] ?? config.PARAGON_THEME_CORE_URL;
  const lightThemeVariantCssUrl = (
    config.PARAGON_THEME_URLS?.variants?.[PARAGON_THEME_VARIANT_LIGHT] ?? config.PARAGON_THEME_VARIANTS_LIGHT_URL
  );
  return {
    [PARAGON_THEME_CORE]: handleParagonVersionSubstitution(coreCssUrl),
    variants: {
      [PARAGON_THEME_VARIANT_LIGHT]: handleParagonVersionSubstitution(lightThemeVariantCssUrl),
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
