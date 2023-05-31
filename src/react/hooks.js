import {
  useCallback, useEffect, useState, useReducer, useMemo,
} from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';
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

/**
 * A React hook that tracks user's preferred color scheme (light or dark) and sends respective
 * event to the tracking service.
 *
 * @memberof module:React
 */
export const useTrackColorSchemeChoice = () => {
  useEffect(() => {
    const trackColorSchemeChoice = ({ matches }) => {
      const preferredColorScheme = matches ? 'dark' : 'light';
      sendTrackEvent('openedx.ui.frontend-platform.prefers-color-scheme.selected', { preferredColorScheme });
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      // send user's initial choice
      trackColorSchemeChoice(colorSchemeQuery);
      colorSchemeQuery.addEventListener('change', trackColorSchemeChoice);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', trackColorSchemeChoice);
      }
    };
  }, []);
};

/**
 * Adds/updates a `<link>` element in the HTML document to load the core application theme CSS.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} args.themeCore Object representing the core Paragon theme CSS.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
export const useParagonThemeCore = ({
  themeCore,
  onLoad,
}) => {
  useEffect(() => {
    // If there is no config for the core theme url, do nothing.
    if (!themeCore?.url) {
      return;
    }
    let coreThemeLink = document.head.querySelector(`link[href='${themeCore.url}']`);
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
      const createCoreThemeLink = (url, { isFallbackThemeUrl = false } = {}) => {
        coreThemeLink = document.createElement('link');
        coreThemeLink.href = url;
        coreThemeLink.rel = 'stylesheet';
        coreThemeLink.dataset.paragonThemeCore = true;
        coreThemeLink.onload = () => {
          onLoad();
          removeExistingLinks(existingLinks);
        };
        coreThemeLink.onerror = () => {
          logError(`Failed to load core theme CSS from ${url}`);
          if (isFallbackThemeUrl) {
            logError('Could not load core theme CSS from fallback URL. Aborting.');
            onLoad();
            const otherExistingLinks = getExistingCoreThemeLinks();
            removeExistingLinks(otherExistingLinks);
            return;
          }
          if (PARAGON?.themeUrls?.core) {
            const coreThemeFallbackUrl = `${getConfig().BASE_URL}/${PARAGON.themeUrls.core.fileName}`;
            logInfo(`Falling back to locally installed core theme CSS: ${coreThemeFallbackUrl}`);
            coreThemeLink = createCoreThemeLink(coreThemeFallbackUrl, { isFallbackThemeUrl: true });
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
      coreThemeLink = createCoreThemeLink(themeCore.url);
      document.head.insertAdjacentElement(
        'afterbegin',
        coreThemeLink,
      );
    }
  }, [themeCore?.url, onLoad]);
};

/**
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will still download
 * the CSS for the non-current theme variants, but at a lower priority than the current theme
 * variant's CSS. This ensures that if the theme variant is changed at runtime, the CSS for the new
 * theme variant will already be loaded.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} args.themeVariant An object containing the URLs for each supported theme variant, e.g.: `{ light: { url: 'https://path/to/light.css' } }`.
 * @param {string} args.currentThemeVariant The currently applied theme variant, e.g.: `light`.
 * @param {string} args.onLoad A callback function called when the theme variant(s) CSS is loaded.
 */
const useParagonThemeVariants = ({
  themeVariants,
  currentThemeVariant,
  onLoad,
}) => {
  const [hasThemeVariantLoadedByName, setHasThemeVariantLoadedByName] = useState({});

  useEffect(() => {
    Object.keys(themeVariants || {}).forEach((themeVariant) => {
      setHasThemeVariantLoadedByName((prevState) => ({
        ...prevState,
        [themeVariant]: false,
      }));
    });
  }, [themeVariants]);

  useEffect(() => {
    if (Object.values(hasThemeVariantLoadedByName).some((hasLoaded) => hasLoaded)) {
      onLoad();
    }
  }, [hasThemeVariantLoadedByName, onLoad]);

  useEffect(() => {
    if (!themeVariants) {
      return;
    }

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
      setHasThemeVariantLoadedByName((prevState) => {
        if (themeVariant in prevState) {
          return {
            ...prevState,
            [themeVariant]: true,
          };
        }
        return prevState;
      });
    };

    /**
     * Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
     */
    Object.entries(themeVariants).forEach(([themeVariant, value]) => {
      // If there is no config for the theme variant URL, set the theme variant to loaded and continue.
      if (!value.url) {
        setThemeVariantLoaded(themeVariant);
        return;
      }
      let themeVariantLink = document.head.querySelector(`link[href='${value.url}']`);
      const stylesheetRelForVariant = generateStylesheetRelAttr(themeVariant);
      if (!themeVariantLink) {
        const getExistingThemeVariantLinks = () => document.head.querySelectorAll(`link[data-paragon-theme-variant='${themeVariant}']`);
        // find existing links
        const existingLinks = getExistingThemeVariantLinks();

        // create new link
        const createThemeVariantLink = (url, { isFallbackThemeUrl = false } = {}) => {
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
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${value.url}`);
            if (isFallbackThemeUrl) {
              logError('Could not load theme theme variant CSS from fallback URL. Aborting.');
              setThemeVariantLoaded(themeVariant);
              const otherExistingLinks = getExistingThemeVariantLinks();
              otherExistingLinks.forEach((link) => {
                link.remove();
              });
              return;
            }
            if (PARAGON?.themeUrls?.variants?.[themeVariant]) {
              const themeVariantFallbackUrl = `${getConfig().BASE_URL}/${PARAGON.themeUrls.variants[themeVariant].fileName}`;
              logInfo(`Falling back to locally installed theme variant (${themeVariant}) CSS: ${themeVariantFallbackUrl}`);
              themeVariantLink = createThemeVariantLink(themeVariantFallbackUrl, { isFallbackThemeUrl: true });
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
        themeVariantLink = createThemeVariantLink(value.url);
        document.head.insertAdjacentElement(
          'afterbegin',
          themeVariantLink,
        );
      } else if (themeVariantLink.rel !== stylesheetRelForVariant) {
        themeVariantLink.rel = stylesheetRelForVariant;
      }
    });
  }, [themeVariants, currentThemeVariant, onLoad]);
};

const handleParagonVersionSubstitution = (url) => {
  if (!url || !url.includes('$paragonVersion') || !PARAGON?.version) {
    return url;
  }
  return url.replace('$paragonVersion', PARAGON.version);
};

/**
 * @typedef {Object} ParagonThemeCore
 * @property {string} url
 */

/**
 * @typedef {Object} ParagonThemeVariant
 * @property {string} url
 * @property {boolean} default
 * @property {boolean} dark
 */

/**
 * @typedef {Object} ParagonThemeUrls
 * @property {ParagonThemeCore} core
 * @property {Object.<string, ParagonThemeVariant>} variants
 */

/**
 * Returns an object containing the URLs for the theme's core CSS and any theme variants.
 *
 * @param {*} config
 * @returns {ParagonThemeUrls|undefined} An object containing the URLs for the theme's core CSS and any theme variants.
 */
const useParagonThemeUrls = (config) => useMemo(() => {
  const paragonThemeUrls = config.PARAGON_THEME_URLS || {};
  const coreCssUrl = handleParagonVersionSubstitution(paragonThemeUrls.core);

  const themeVariantsCss = {};
  Object.entries(paragonThemeUrls.variants || {}).forEach(([themeVariant, { url, ...rest }]) => {
    themeVariantsCss[themeVariant] = {
      url: handleParagonVersionSubstitution(url),
      ...rest,
    };
  });

  const hasMissingCssUrls = !coreCssUrl || Object.keys(themeVariantsCss).length === 0;
  if (hasMissingCssUrls) {
    if (!PARAGON) {
      return undefined;
    }
    const themeVariants = {};
    const prependBaseUrl = (url) => `${config.BASE_URL}/${url}`;
    Object.entries(PARAGON.themeUrls.variants).forEach(([themeVariant, { fileName, ...rest }]) => {
      themeVariants[themeVariant] = {
        url: prependBaseUrl(fileName),
        ...rest,
      };
    });
    return {
      core: {
        url: prependBaseUrl(PARAGON.themeUrls.core),
      },
      variants: themeVariants,
    };
  }

  return {
    core: {
      url: handleParagonVersionSubstitution(coreCssUrl),
    },
    variants: themeVariantsCss,
  };
}, [config.BASE_URL, config.PARAGON_THEME_URLS]);

/**
 * Finds the default theme variant from the given theme variants object. If no default theme exists, the first theme
 * variant is returned as a fallback.
 * @param {Object.<string, ParagonThemeVariant>|undefined} themeVariants
 *
 * @returns {ParagonThemeVariant|undefined} The default theme variant.
 */
const getDefaultThemeVariant = (themeVariants) => {
  const themeVariantKeys = Object.keys(themeVariants);
  if (themeVariantKeys.length === 0) {
    return undefined;
  }
  if (themeVariantKeys.length === 1) {
    return {
      name: themeVariantKeys[0],
      metadata: themeVariants[themeVariantKeys[0]],
    };
  }
  const foundDefaultThemeVariant = Object.entries(themeVariants)
    .find(([, { default: isDefault }]) => isDefault === true);

  if (!foundDefaultThemeVariant) {
    return undefined;
  }
  return {
    name: foundDefaultThemeVariant[0],
    metadata: foundDefaultThemeVariant[1],
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
 * @param {object} config An object containing the URLs for the theme's core CSS and any theme (i.e., `getConfig()`)
 *
 * @returns An array containing 2 elements: 1) an object containing the app
 *  theme state, and 2) a dispatch function to mutate the app theme state.
 */
export const useParagonTheme = (config) => {
  const paragonThemeUrls = useParagonThemeUrls(config);
  const {
    core: themeCore,
    variants: themeVariants,
  } = paragonThemeUrls || {};
  const initialParagonThemeState = {
    isThemeLoaded: false,
    themeVariant: getDefaultThemeVariant(themeVariants)?.name,
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

  // load the theme variant(s) CSS
  useParagonThemeVariants({
    themeVariants,
    onLoad: onLoadThemeVariants,
    currentThemeVariant: themeState.themeVariant,
  });

  useEffect(() => {
    // theme is already loaded, do nothing
    if (themeState.isThemeLoaded) {
      return;
    }

    const hasThemeConfig = (themeCore.url && Object.keys(themeVariants).length > 0);
    if (!hasThemeConfig) {
      // no theme URLs to load, set loading to false.
      dispatch(paragonThemeActions.setParagonThemeLoaded(true));
    }

    const isDefaultThemeLoaded = (isCoreThemeLoaded && hasLoadedThemeVariants);
    if (!isDefaultThemeLoaded) {
      return;
    }

    // All application theme URLs are loaded
    dispatch(paragonThemeActions.setParagonThemeLoaded(true));
  }, [
    themeState.isThemeLoaded,
    isCoreThemeLoaded,
    hasLoadedThemeVariants,
    themeCore.url,
    themeVariants,
  ]);

  return [themeState, dispatch];
};
