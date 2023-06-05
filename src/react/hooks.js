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
}) => {
  const [isParagonThemeVariantLoaded, setIsParagonThemeVariantLoaded] = useState(false);
  const [isBrandThemeVariantLoaded, setIsBrandThemeVariantLoaded] = useState(false);

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

    /**
     * Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
     */
    Object.entries(themeVariants).forEach(([themeVariant, value]) => {
      // If there is no config for the theme variant URL, set the theme variant to loaded and continue.
      if (!value.urls) {
        setIsParagonThemeVariantLoaded(true);
        setIsBrandThemeVariantLoaded(true);
        return;
      }
      const getParagonThemeVariantLink = () => document.head.querySelector(`link[data-paragon-theme-variant='${themeVariant}']`);
      const existingThemeVariantLink = document.head.querySelector(`link[href='${value.urls.default}']`);
      const stylesheetRelForVariant = generateStylesheetRelAttr(themeVariant);
      if (!existingThemeVariantLink) {
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
          themeVariantLink.rel = 'stylesheet';
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
            } else {
              const existingLinks = getExistingThemeVariantLinks(isBrandOverride);
              removeExistingLinks(existingLinks);
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
            if (themeUrls.variants) {
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
            }
          };
          return themeVariantLink;
        };

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
      } else if (existingThemeVariantLink.rel !== stylesheetRelForVariant) {
        existingThemeVariantLink.rel = stylesheetRelForVariant;
      }
    });
  }, [themeVariants, currentThemeVariant, onLoad]);
};

const handleParagonVersionSubstitution = (url, { isBrandOverride = false } = {}) => {
  const localVersion = isBrandOverride ? PARAGON_THEME?.brand?.version : PARAGON_THEME?.paragon?.version;
  const wildcardKeyword = isBrandOverride ? '$brandVersion' : '$paragonVersion';
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
  const coreCss = {
    default: handleParagonVersionSubstitution(paragonCoreCssUrl),
    brandOverride: handleParagonVersionSubstitution(brandCoreCssUrl, { isBrandOverride: true }),
  };

  const themeVariantsCss = {};
  const themeVariantsEntries = Object.entries(paragonThemeUrls.variants || {});
  themeVariantsEntries.forEach(([themeVariant, {
    url, urls, default: isDefaultThemeVariant, dark,
  }]) => {
    const themeVariantMetadata = {
      default: isDefaultThemeVariant,
      dark,
    };
    if (url) {
      themeVariantMetadata.urls = {
        default: handleParagonVersionSubstitution(url),
      };
    } else {
      themeVariantMetadata.urls = {
        default: handleParagonVersionSubstitution(urls.default),
        brandOverride: handleParagonVersionSubstitution(urls.brandOverride, { isBrandOverride: true }),
      };
    }
    themeVariantsCss[themeVariant] = themeVariantMetadata;
  });

  const hasMissingCssUrls = !coreCss.default || Object.keys(themeVariantsCss).length === 0;
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
      variants: themeVariants,
    };
  }

  return {
    core: { urls: coreCss },
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
  if (!themeVariants) {
    return undefined;
  }
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
  const foundDefaultThemeVariant = Object.values(themeVariants)
    .find(({ default: isDefault }) => isDefault === true);

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

    const hasThemeConfig = (themeCore?.urls && Object.keys(themeVariants).length > 0);
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
    themeCore?.urls,
    themeVariants,
  ]);

  return [themeState, dispatch];
};
