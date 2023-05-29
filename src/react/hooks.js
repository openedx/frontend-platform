import {
  useCallback, useEffect, useState, useReducer,
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
      const createCoreThemeLink = (url) => {
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
          if (PARAGON?.themeUrls?.core) {
            const coreThemeFallbackUrl = `${getConfig().BASE_URL}/${PARAGON.themeUrls.core}`;
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
      coreThemeLink = createCoreThemeLink(themeCore?.url);
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
 * Note: only "light" theme variant is currently supported.
 *
 * @memberof module:React
 * @param {object} args
 * @param {object} args.themeVariantUrls An object representing the URLs for each supported theme variant, e.g.: `{ light: 'https://path/to/light.css' }`.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
const useParagonThemeVariants = ({
  themeVariants,
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
      if (themeVariant === 'light') {
        onLoadThemeVariantLight();
      }
    };

    /**
     * Iterate over each theme variant URL and inject it into the HTML document if it doesn't already exist.
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
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${value.url}`);
            if (PARAGON?.themeUrls?.variants?.[themeVariant]) {
              const themeVariantFallbackUrl = `${getConfig().BASE_URL}/${PARAGON.themeUrls.variants[themeVariant]}`;
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
        themeVariantLink = createThemeVariantLink(value.url);
        document.head.insertAdjacentElement(
          'afterbegin',
          themeVariantLink,
        );
      } else if (themeVariantLink.rel !== stylesheetRelForVariant) {
        themeVariantLink.rel = stylesheetRelForVariant;
      }
    });
  }, [themeVariants, currentThemeVariant, onLoadThemeVariantLight]);
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
      return {};
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
  const paragonThemeUrls = getParagonThemeUrls(config);
  const {
    core: themeCore,
    variants: themeVariants,
  } = paragonThemeUrls;

  const initialParagonThemeState = {
    isThemeLoaded: false,
    themeVariant: 'light',
  };
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
    themeCore,
    onLoad: onLoadThemeCore,
  });

  // load the theme variant(s) CSS
  useParagonThemeVariants({
    themeVariants,
    onLoadThemeVariantLight,
    currentThemeVariant: themeState.themeVariant,
  });

  useEffect(() => {
    // theme is already loaded, do nothing
    if (themeState.isThemeLoaded) {
      return;
    }

    // the core theme and light theme variant is still loading, do nothing.
    const hasThemeConfig = (themeCore.url && Object.keys(themeVariants).length > 0);
    if (!hasThemeConfig) {
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
    themeCore.url,
  ]);

  return [themeState, dispatch];
};
