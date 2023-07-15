import {
  useCallback, useEffect, useState, useReducer, useMemo,
} from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';
import { paragonThemeReducer, paragonThemeActions } from './reducers';
import { logError, logInfo } from '../logging';
import { getConfig } from '../config';
import { SELECTED_THEME_VARIANT_KEY } from './constants';

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

const removeExistingLinks = (existingLinks) => {
  existingLinks.forEach((link) => {
    link.remove();
  });
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
  const [isParagonThemeCoreLoaded, setIsParagonThemeCoreLoaded] = useState(false);
  const [isBrandThemeCoreLoaded, setIsBrandThemeCoreLoaded] = useState(false);

  useEffect(() => {
    // Call `onLoad` once both the paragon and brand theme core are loaded.
    if (isParagonThemeCoreLoaded && isBrandThemeCoreLoaded) {
      onLoad();
    }
  }, [isParagonThemeCoreLoaded, isBrandThemeCoreLoaded, onLoad]);

  useEffect(() => {
    // If there is no config for the core theme url, do nothing.
    if (!themeCore?.urls) {
      setIsParagonThemeCoreLoaded(true);
      setIsBrandThemeCoreLoaded(true);
      return;
    }
    const getParagonThemeCoreLink = () => document.head.querySelector('link[data-paragon-theme-core="true"');
    const existingCoreThemeLink = document.head.querySelector(`link[href='${themeCore.urls.default}']`);
    if (!existingCoreThemeLink) {
      const getExistingCoreThemeLinks = (isBrandOverride) => {
        const coreThemeLinkSelector = `link[data-${isBrandOverride ? 'brand' : 'paragon'}-theme-core="true"]`;
        return document.head.querySelectorAll(coreThemeLinkSelector);
      };
      const createCoreThemeLink = (
        url,
        {
          isFallbackThemeUrl = false,
          isBrandOverride = false,
        } = {},
      ) => {
        let coreThemeLink = document.createElement('link');
        coreThemeLink.href = url;
        coreThemeLink.rel = 'stylesheet';
        if (isBrandOverride) {
          coreThemeLink.dataset.brandThemeCore = true;
        } else {
          coreThemeLink.dataset.paragonThemeCore = true;
        }
        coreThemeLink.onload = () => {
          if (isBrandOverride) {
            setIsBrandThemeCoreLoaded(true);
          } else {
            setIsParagonThemeCoreLoaded(true);
          }
        };
        coreThemeLink.onerror = () => {
          logError(`Failed to load core theme CSS from ${url}`);
          if (isFallbackThemeUrl) {
            logError(`Could not load core theme CSS from ${url} or fallback URL. Aborting.`);
            if (isBrandOverride) {
              setIsBrandThemeCoreLoaded(true);
            } else {
              setIsParagonThemeCoreLoaded(true);
            }
            const otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          const paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          const themeUrls = PARAGON_THEME?.[paragonThemeAccessor]?.themeUrls ?? {};
          if (themeUrls.core) {
            const coreThemeFallbackUrl = `${getConfig().BASE_URL}/${themeUrls.core.fileName}`;
            logInfo(`Falling back to locally installed core theme CSS: ${coreThemeFallbackUrl}`);
            coreThemeLink = createCoreThemeLink(coreThemeFallbackUrl, { isFallbackThemeUrl: true, isBrandOverride });
            const otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            const foundParagonThemCoreLink = getParagonThemeCoreLink();
            if (foundParagonThemCoreLink) {
              foundParagonThemCoreLink.insertAdjacentElement(
                'afterend',
                coreThemeLink,
              );
            } else {
              document.head.insertAdjacentElement(
                'afterbegin',
                coreThemeLink,
              );
            }
          } else {
            logError(`Failed to load core theme CSS from ${url} or fallback URL. Aborting.`);
          }
        };
        return coreThemeLink;
      };

      const paragonCoreThemeLink = createCoreThemeLink(themeCore.urls.default);
      document.head.insertAdjacentElement(
        'afterbegin',
        paragonCoreThemeLink,
      );

      if (themeCore.urls.brandOverride) {
        const brandCoreThemeLink = createCoreThemeLink(themeCore.urls.brandOverride, { isBrandOverride: true });
        const foundParagonThemeCoreLink = getParagonThemeCoreLink();
        if (foundParagonThemeCoreLink) {
          foundParagonThemeCoreLink.insertAdjacentElement(
            'afterend',
            brandCoreThemeLink,
          );
        } else {
          document.head.insertAdjacentElement(
            'afterbegin',
            brandCoreThemeLink,
          );
        }
      } else {
        setIsBrandThemeCoreLoaded(true);
      }
    }
  }, [themeCore?.urls, onLoad]);
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
 * @param {object} [args.themeVariants] An object containing the URLs for each supported theme variant, e.g.: `{ light: { url: 'https://path/to/light.css' } }`.
 * @param {string} [args.currentThemeVariant] The currently applied theme variant, e.g.: `light`.
 * @param {string} args.onLoad A callback function called when the theme variant(s) CSS is loaded.
 */
const useParagonThemeVariants = ({
  themeVariants,
  currentThemeVariant,
  onLoad,
  onDarkModeSystemPreferenceChange,
}) => {
  const [isParagonThemeVariantLoaded, setIsParagonThemeVariantLoaded] = useState(false);
  const [isBrandThemeVariantLoaded, setIsBrandThemeVariantLoaded] = useState(false);

  useEffect(() => {
    const someFn = (colorSchemeQuery) => {
      onDarkModeSystemPreferenceChange(colorSchemeQuery.matches);
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      colorSchemeQuery.addEventListener('change', someFn);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', someFn);
      }
    };
  }, [onDarkModeSystemPreferenceChange]);

  useEffect(() => {
    if (currentThemeVariant && themeVariants?.[currentThemeVariant]) {
      const htmlDataThemeVariantAttr = 'data-paragon-theme-variant';
      document.querySelector('html').setAttribute(htmlDataThemeVariantAttr, currentThemeVariant);
      return () => {
        document.querySelector('html').removeAttribute(htmlDataThemeVariantAttr);
      };
    }
    return () => {}; // no-op
  }, [themeVariants, currentThemeVariant]);

  useEffect(() => {
    // Call `onLoad` once both the paragon and brand theme variant are loaded.
    if (isParagonThemeVariantLoaded && isBrandThemeVariantLoaded) {
      onLoad();
    }
  }, [isParagonThemeVariantLoaded, isBrandThemeVariantLoaded, onLoad]);

  useEffect(() => {
    if (!themeVariants) {
      return;
    }

    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     */
    const generateStylesheetRelAttr = (themeVariant) => (currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet');

    // Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
    Object.entries(themeVariants).forEach(([themeVariant, value]) => {
      // If there is no config for the theme variant URL, set the theme variant to loaded and continue.
      if (!value.urls) {
        setIsParagonThemeVariantLoaded(true);
        setIsBrandThemeVariantLoaded(true);
        return;
      }
      const getParagonThemeVariantLink = () => document.head.querySelector(`link[data-paragon-theme-variant='${themeVariant}']`);
      const existingThemeVariantLink = document.head.querySelector(`link[href='${value.urls.default}']`);
      const existingThemeVariantBrandLink = document.head.querySelector(`link[href='${value.urls.brandOverride}']`);

      const getExistingThemeVariantLinks = (isBrandOverride) => {
        const themeVariantLinkSelector = `link[data-${isBrandOverride ? 'brand' : 'paragon'}-theme-variant='${themeVariant}']`;
        return document.head.querySelectorAll(themeVariantLinkSelector);
      };

      const createThemeVariantLink = (
        url,
        {
          isFallbackThemeUrl = false,
          isBrandOverride = false,
        } = {},
      ) => {
        let themeVariantLink = document.createElement('link');
        themeVariantLink.href = url;
        themeVariantLink.rel = generateStylesheetRelAttr(themeVariant);
        if (isBrandOverride) {
          themeVariantLink.dataset.brandThemeVariant = themeVariant;
        } else {
          themeVariantLink.dataset.paragonThemeVariant = themeVariant;
        }

        themeVariantLink.onload = () => {
          if (themeVariant === currentThemeVariant) {
            if (isBrandOverride) {
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
            }
          }
        };

        themeVariantLink.onerror = () => {
          logError(`Failed to load theme variant (${themeVariant}) CSS from ${value.urls.default}`);
          if (isFallbackThemeUrl) {
            logError(`Could not load theme variant (${themeVariant}) CSS from fallback URL. Aborting.`);
            if (isBrandOverride) {
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
            }
            const otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          const paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          const themeUrls = PARAGON_THEME?.[paragonThemeAccessor]?.themeUrls ?? {};
          if (themeUrls.variants && themeUrls.variants[themeVariant]) {
            const themeVariantFallbackUrl = `${getConfig().BASE_URL}/${themeUrls.variants[themeVariant].fileName}`;
            logInfo(`Falling back to locally installed theme variant (${themeVariant}) CSS: ${themeVariantFallbackUrl}`);
            themeVariantLink = createThemeVariantLink(themeVariantFallbackUrl, {
              isFallbackThemeUrl: true,
              isBrandOverride,
            });
            const otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            const foundParagonThemeVariantLink = getParagonThemeVariantLink();
            if (foundParagonThemeVariantLink) {
              foundParagonThemeVariantLink.insertAdjacentElement(
                'afterend',
                themeVariantLink,
              );
            } else {
              document.head.insertAdjacentElement(
                'afterbegin',
                themeVariantLink,
              );
            }
          } else {
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${url} or fallback URL. Aborting.`);
            if (isBrandOverride) {
              setIsBrandThemeVariantLoaded(true);
            } else {
              setIsParagonThemeVariantLoaded(true);
            }
          }
        };
        return themeVariantLink;
      };

      if (!existingThemeVariantLink) {
        const paragonThemeVariantLink = createThemeVariantLink(value.urls.default);
        document.head.insertAdjacentElement(
          'afterbegin',
          paragonThemeVariantLink,
        );

        if (value.urls.brandOverride) {
          const brandThemeVariantLink = createThemeVariantLink(value.urls.brandOverride, { isBrandOverride: true });
          const foundParagonThemeVariantLink = getParagonThemeVariantLink();
          if (foundParagonThemeVariantLink) {
            foundParagonThemeVariantLink.insertAdjacentElement(
              'afterend',
              brandThemeVariantLink,
            );
          } else {
            document.head.insertAdjacentElement(
              'afterbegin',
              brandThemeVariantLink,
            );
          }
        } else {
          setIsBrandThemeVariantLoaded(true);
        }
      } else {
        const updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);
        existingThemeVariantLink.rel = updatedStylesheetRel;
        existingThemeVariantBrandLink.rel = updatedStylesheetRel;
      }
    });
  }, [themeVariants, currentThemeVariant, onLoad]);
};

const handleVersionSubstitution = ({ url, wildcardKeyword, localVersion }) => {
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replace(wildcardKeyword, localVersion);
};

/**
 * @typedef {Object} ParagonThemeUrl
 * @property {string} default The default URL for Paragon.
 * @property {string} brandOverride The URL for a brand override.
 */

/**
 * @typedef {Object} ParagonThemeCore
 * @property {ParagonThemeUrl|string} url
 */

/**
 * @typedef {Object} ParagonThemeVariant
 * @property {ParagonThemeUrl|string} url
 * @property {boolean} default Whether this is the default theme variant.
 * @property {boolean} dark Whether this is the dark theme variant to use for `prefers-color-scheme: "dark"`.
 */

/**
 * @typedef {Object} ParagonThemeUrls
 * @property {ParagonThemeCore} core
 * @property {Object.<string, string>} defaults
 * @property {Object.<string, ParagonThemeVariant>} variants
 */

/**
 * Returns an object containing the URLs for the theme's core CSS and any theme variants.
 *
 * @param {*} config
 * @returns {ParagonThemeUrls|undefined} An object containing the URLs for the theme's core CSS and any theme variants.
 */
const useParagonThemeUrls = (config) => useMemo(() => {
  if (!config.PARAGON_THEME_URLS) {
    return undefined;
  }
  /** @type {ParagonThemeUrls} */
  const paragonThemeUrls = config.PARAGON_THEME_URLS;
  const paragonCoreCssUrl = typeof paragonThemeUrls.core.urls === 'object' ? paragonThemeUrls.core.urls.default : paragonThemeUrls.core.url;
  const brandCoreCssUrl = typeof paragonThemeUrls.core.urls === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;
  const defaultThemeVariants = paragonThemeUrls.defaults;

  // Local versions of @edx/paragon and @edx/brand
  const localParagonVersion = PARAGON_THEME?.paragon?.version;
  const localBrandVersion = PARAGON_THEME?.brand?.version;

  const coreCss = {
    default: handleVersionSubstitution({ url: paragonCoreCssUrl, wildcardKeyword: '$paragonVersion', localVersion: localParagonVersion }),
    brandOverride: handleVersionSubstitution({ url: brandCoreCssUrl, wildcardKeyword: '$brandVersion', localVersion: localBrandVersion }),
  };

  const themeVariantsCss = {};
  const themeVariantsEntries = Object.entries(paragonThemeUrls.variants || {});
  themeVariantsEntries.forEach(([themeVariant, { url, urls }]) => {
    const themeVariantMetadata = { urls: null };
    if (url) {
      themeVariantMetadata.urls = {
        default: handleVersionSubstitution({
          url,
          wildcardKeyword: '$paragonVersion',
          localVersion: localParagonVersion,
        }),
      };
    } else {
      themeVariantMetadata.urls = {
        default: handleVersionSubstitution({
          url: urls.default,
          wildcardKeyword: '$paragonVersion',
          localVersion: localParagonVersion,
        }),
        brandOverride: handleVersionSubstitution({ url: urls.brandOverride, wildcardKeyword: '$brandVersion', localVersion: localBrandVersion }),
      };
    }
    themeVariantsCss[themeVariant] = themeVariantMetadata;
  });

  const hasMissingCssUrls = !coreCss.default || Object.keys(themeVariantsCss).length === 0;
  console.log('hasMissingCssUrls', hasMissingCssUrls);
  if (hasMissingCssUrls) {
    if (!PARAGON_THEME) {
      return undefined;
    }
    const themeVariants = {};
    const prependBaseUrl = (url) => `${config.BASE_URL}/${url}`;
    themeVariantsEntries.forEach(([themeVariant, { fileName, ...rest }]) => {
      themeVariants[themeVariant] = {
        url: prependBaseUrl(fileName),
        ...rest,
      };
    });
    return {
      core: { urls: coreCss },
      defaults: defaultThemeVariants,
      variants: themeVariants,
    };
  }

  return {
    core: { urls: coreCss },
    defaults: defaultThemeVariants,
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
const getDefaultThemeVariant = ({ themeVariants, themeVariantDefaults = {} }) => {
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

  // Otherwise, detect system preference via `prefers-color-scheme` media query and use
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

  // Otherwise, fallback to using the default light theme variant as configured.
  const defaultLightThemeVariant = themeVariantDefaults.light;
  const lightThemeVariantMetadata = themeVariants[defaultLightThemeVariant];
  if (!defaultLightThemeVariant || !lightThemeVariantMetadata) {
    return undefined;
  }
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
 * @param {object} config An object containing the URLs for the theme's core CSS and any theme (i.e., `getConfig()`)
 *
 * @returns An array containing 2 elements: 1) an object containing the app
 *  theme state, and 2) a dispatch function to mutate the app theme state.
 */
export const useParagonTheme = (config) => {
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
    if (prefersDarkMode && themeVariantDefaults.dark) {
      dispatch(paragonThemeActions.setParagonThemeVariant(themeVariantDefaults.dark));
    } else if (!prefersDarkMode && themeVariantDefaults.light) {
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
