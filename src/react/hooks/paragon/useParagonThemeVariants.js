import { useEffect, useState } from 'react';
import { logError, logInfo } from '../../../logging';
import { removeExistingLinks } from './utils';
import { getConfig } from '../../../config';

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
            logError(`Failed to load theme variant (${themeVariant}) CSS from ${url} and locally installed fallback URL is not available. Aborting.`);
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

export default useParagonThemeVariants;
