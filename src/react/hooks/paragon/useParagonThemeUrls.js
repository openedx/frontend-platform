import { useMemo } from 'react';

import { fallbackThemeUrl, isEmptyObject } from './utils';
import { getConfig } from '../../../config';

/**
 * Replaces a wildcard in the URL string with a provided local version string.
 * This is typically used to substitute a version placeholder (e.g., `$paragonVersion`)
 * in URLs with actual version values.
 *
 * @param {Object} args - The arguments object for version substitution.
 * @param {string} args.url - The URL string that may contain a wildcard keyword (e.g., `$paragonVersion`).
 * @param {string} args.wildcardKeyword - The keyword (e.g., `$paragonVersion`) in the URL to be replaced
 * with the local version.
 * @param {string} args.localVersion - The local version string to replace the wildcard with.
 *
 * @returns {string} The URL with the wildcard keyword replaced by the provided version string.
 * If the conditions are not met (e.g., missing URL or version), the original URL is returned.
 *
 * @example
 * const url = 'https://cdn.example.com/$paragonVersion/theme.css';
 * const version = '1.0.0';
 * const updatedUrl = handleVersionSubstitution({ url, wildcardKeyword: '$paragonVersion', localVersion: version });
 * console.log(updatedUrl); // Outputs: 'https://cdn.example.com/1.0.0/theme.css'
 */
export const handleVersionSubstitution = ({ url, wildcardKeyword, localVersion }) => {
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replaceAll(wildcardKeyword, localVersion);
};

/**
 * Custom React hook that retrieves the Paragon theme URLs, including the core theme CSS and any theme variants.
 * It supports version substitution for the Paragon and brand versions and returns a structured object containing
 * the URLs. The hook also handles fallback scenarios when the URLs are unavailable in the configuration or when
 * version substitution is required.
 *
 * @returns {Object|undefined} An object containing:
 *   - `core`: The core theme URLs (including default and brand override).
 *   - `defaults`: Any default theme variants.
 *   - `variants`: The URLs for any additional theme variants (default and brand override).
 *
 *   If the required URLs are not available or cannot be determined, `undefined` is returned.
 *
 * @example
 * const themeUrls = useParagonThemeUrls();
 * if (themeUrls) {
 *   console.log(themeUrls.core.urls.default); // Outputs the URL of the core theme CSS
 *   console.log(themeUrls.variants['dark'].urls.default); // Outputs the URL of the dark theme variant CSS
 * }
 *
 */
const useParagonThemeUrls = () => useMemo(() => {
  const { PARAGON_THEME_URLS: paragonThemeUrls } = getConfig();
  if (!paragonThemeUrls) {
    return undefined;
  }
  const paragonCoreCssUrl = typeof paragonThemeUrls?.core?.urls === 'object' ? paragonThemeUrls.core.urls.default : paragonThemeUrls?.core?.url;
  const brandCoreCssUrl = typeof paragonThemeUrls?.core?.urls === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;
  const defaultThemeVariants = paragonThemeUrls.defaults;

  // Local versions of @openedx/paragon and @edx/brand
  // these are only used when passed into handleVersionSubstitution
  // which does not attempt substitution using falsy value
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
        brandOverride: handleVersionSubstitution({
          url: urls.brandOverride,
          wildcardKeyword: '$brandVersion',
          localVersion: localBrandVersion,
        }),
      };
    }
    themeVariantsCss[themeVariant] = themeVariantMetadata;
  });

  // If we don't have  the core default or any theme variants, use the PARAGON_THEME
  if (!coreCss.default || isEmptyObject(themeVariantsCss) || isEmptyObject(defaultThemeVariants)) {
    const localParagonCoreUrl = PARAGON_THEME?.paragon?.themeUrls?.core;
    const localParagonThemeVariants = PARAGON_THEME?.paragon?.themeUrls?.variants;
    const localParagonDefaultThemeVariants = PARAGON_THEME?.paragon?.themeUrls?.defaults;

    const localBrandCoreUrl = PARAGON_THEME?.brand?.themeUrls?.core;
    const localBrandThemeVariants = PARAGON_THEME?.brand?.themeUrls?.variants;
    const localBrandDefaultThemeVariants = PARAGON_THEME?.brand?.themeUrls?.defaults;

    if (isEmptyObject(localParagonCoreUrl) || isEmptyObject(localParagonThemeVariants)) {
      return undefined;
    }
    if (!coreCss.default) {
      coreCss.default = fallbackThemeUrl(localParagonCoreUrl?.fileName);
    }

    if (!coreCss.brandOverride && !isEmptyObject(localBrandCoreUrl)) {
      coreCss.brandOverride = fallbackThemeUrl(localBrandCoreUrl?.fileName);
    }

    Object.entries(localParagonThemeVariants).forEach(([themeVariant, { fileName, ...rest }]) => {
      if (!themeVariantsCss[themeVariant]?.urls?.default) {
        themeVariantsCss[themeVariant] = {
          urls: { ...themeVariantsCss[themeVariant]?.urls, default: fallbackThemeUrl(fileName), ...rest.urls },
        };
      }
    });
    Object.entries(localBrandThemeVariants).forEach(([themeVariant, { fileName, ...rest }]) => {
      if (!themeVariantsCss[themeVariant]?.urls?.brandOverride) {
        themeVariantsCss[themeVariant] = {
          urls: { ...themeVariantsCss[themeVariant]?.urls, brandOverride: fallbackThemeUrl(fileName), ...rest.urls },
        };
      }
    });

    return {
      core: { urls: coreCss },
      defaults: defaultThemeVariants || { ...localParagonDefaultThemeVariants, ...localBrandDefaultThemeVariants },
      variants: themeVariantsCss,
    };
  }

  return {
    core: { urls: coreCss },
    defaults: defaultThemeVariants,
    variants: themeVariantsCss,
  };
}, []);

export default useParagonThemeUrls;
