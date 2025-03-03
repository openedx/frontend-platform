import { useEffect, useState } from 'react';

import { logError, logInfo } from '../../../logging';

import { fallbackThemeUrl, removeExistingLinks } from './utils';

/**
 * A custom React hook that manages the loading of theme variant CSS files dynamically.
 * Adds/updates a `<link>` element in the HTML document to load each theme variant's CSS, setting the
 * non-current theme variants as "alternate" stylesheets. That is, the browser will download
 * the CSS for the non-current theme variants, but at a lower priority than the current one.
 * This ensures that if the theme variant is changed at runtime, the new theme's CSS will already be loaded.
 *
 * The hook also listens for changes in the system's preference and triggers the provided callback accordingly.
 *
 * @memberof module:React
 * @param {object} args Configuration object for theme variants and related settings.
 * @param {object} [args.themeVariants] An object containing the URLs for each supported theme variant,
 * e.g.: `{ light: { url: 'https://path/to/light.css' } }`.
 * @param {string} [args.currentThemeVariant] The currently applied theme variant, e.g.: `light`.
 * @param {function} args.onComplete A callback function called when the theme variant(s) CSS is (are) complete.
 * @param {function} [args.onDarkModeSystemPreferenceChange] A callback function that is triggered
 * when the system's preference changes.
 */
const useParagonThemeVariants = ({
  themeVariants,
  currentThemeVariant,
  onComplete,
  onDarkModeSystemPreferenceChange,
}) => {
  const [isParagonThemeVariantComplete, setIsParagonThemeVariantComplete] = useState(false);
  const [isBrandThemeVariantComplete, setIsBrandThemeVariantComplete] = useState(false);

  // Effect hook that listens for changes in the system's dark mode preference.
  useEffect(() => {
    const changeColorScheme = (colorSchemeQuery) => {
      onDarkModeSystemPreferenceChange(colorSchemeQuery.matches);
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      colorSchemeQuery.addEventListener('change', changeColorScheme);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', changeColorScheme);
      }
    };
  }, [onDarkModeSystemPreferenceChange]);

  // Effect hook to set the theme current variant on the HTML element.
  useEffect(() => {
    if (currentThemeVariant && themeVariants?.[currentThemeVariant]) {
      const htmlDataThemeVariantAttr = 'data-paragon-theme-variant';
      document.querySelector('html').setAttribute(htmlDataThemeVariantAttr, currentThemeVariant);
      return () => {
        document.querySelector('html').removeAttribute(htmlDataThemeVariantAttr);
      };
    }
    return () => {}; // Cleanup: no action needed when theme variant is not set
  }, [themeVariants, currentThemeVariant]);

  // Effect hook that calls `onComplete` when both paragon and brand theme variants are completed the processing.
  useEffect(() => {
    if (isParagonThemeVariantComplete && isBrandThemeVariantComplete) {
      onComplete();
    }
  }, [isParagonThemeVariantComplete, isBrandThemeVariantComplete, onComplete]);

  useEffect(() => {
    if (!themeVariants) {
      return;
    }

    /**
     * Determines the value for the `rel` attribute for a given theme variant based
     * on if its the currently applied variant.
     *
     * @param {string} themeVariant The key representing a theme variant (e.g., `light`, `dark`).
     * @returns {string} The value for the `rel` attribute, either 'stylesheet' or 'alternate stylesheet'.
     */
    const generateStylesheetRelAttr = (themeVariant) => (currentThemeVariant === themeVariant ? 'stylesheet' : 'alternate stylesheet');

    // Iterate over each theme variant URL and inject it into the HTML document, if it doesn't already exist.
    Object.entries(themeVariants).forEach(([themeVariant, value]) => {
      // If there is no config for the theme variant URL, set the theme variant to complete and continue.
      if (!value.urls) {
        setIsParagonThemeVariantComplete(true);
        setIsBrandThemeVariantComplete(true);
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
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
          }
        };

        themeVariantLink.onerror = () => {
          const paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
          if (isFallbackThemeUrl) {
            logError(`Could not load theme variant (${paragonThemeAccessor} - ${themeVariant}) CSS from fallback URL. Aborting.`);
            if (isBrandOverride) {
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
            const otherExistingLinks = getExistingThemeVariantLinks(isBrandOverride);
            removeExistingLinks(otherExistingLinks);
            return;
          }
          const variants = PARAGON_THEME?.[paragonThemeAccessor]?.themeUrls?.variants ?? {};
          if (variants[themeVariant]) {
            const themeVariantFallbackUrl = fallbackThemeUrl(variants[themeVariant].fileName);
            logInfo(`Failed to load theme variant (${themeVariant}) CSS from ${isBrandOverride ? value.urls.brandOverride : value.urls.default}. Falling back to locally installed theme variant: ${themeVariantFallbackUrl}`);
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
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${url} and locally installed fallback URL is not available. Aborting.`);
            if (isBrandOverride) {
              setIsBrandThemeVariantComplete(true);
            } else {
              setIsParagonThemeVariantComplete(true);
            }
          }
        };
        return themeVariantLink;
      };

      const insertBrandThemeVariantLink = () => {
        const updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);

        if (existingThemeVariantBrandLink) {
          existingThemeVariantBrandLink.rel = updatedStylesheetRel;
          existingThemeVariantBrandLink.removeAttribute('as');
          existingThemeVariantBrandLink.dataset.brandThemeVariant = themeVariant;
          return;
        }

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
        }
        setIsBrandThemeVariantComplete(true);
      };

      if (!existingThemeVariantLink) {
        const paragonThemeVariantLink = createThemeVariantLink(value.urls.default);
        document.head.insertAdjacentElement(
          'afterbegin',
          paragonThemeVariantLink,
        );
        insertBrandThemeVariantLink(existingThemeVariantBrandLink);
      } else {
        const updatedStylesheetRel = generateStylesheetRelAttr(themeVariant);
        existingThemeVariantLink.rel = updatedStylesheetRel;
        existingThemeVariantLink.removeAttribute('as');
        existingThemeVariantLink.dataset.paragonThemeVariant = themeVariant;
        insertBrandThemeVariantLink(existingThemeVariantBrandLink);
      }
      setIsParagonThemeVariantComplete(true);
      setIsBrandThemeVariantComplete(true);
    });
  }, [themeVariants, currentThemeVariant, onComplete]);
};

export default useParagonThemeVariants;
