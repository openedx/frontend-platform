import { useMemo } from 'react';

import { fallbackThemeUrl, handleVersionSubstitution, isEmptyObject } from './utils';

/**
 * Returns an object containing the URLs for the theme's core CSS and any theme variants.
 *
 * @param {*} config
 * @returns {ParagonThemeUrls|undefined} An object containing the URLs for the theme's core CSS and any theme variants.
 */
const useParagonThemeUrls = (config) => useMemo(() => {
  if (!config?.PARAGON_THEME_URLS) {
    return undefined;
  }
  const paragonThemeUrls = config.PARAGON_THEME_URLS;
  const paragonCoreCssUrl = typeof paragonThemeUrls?.core?.urls === 'object' ? paragonThemeUrls.core.urls.default : paragonThemeUrls?.core?.url;
  const brandCoreCssUrl = typeof paragonThemeUrls?.core?.urls === 'object' ? paragonThemeUrls.core.urls.brandOverride : undefined;
  const defaultThemeVariants = paragonThemeUrls.defaults;

  // Local versions of @openedx/paragon and @edx/brand
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
  if (!coreCss.default || isEmptyObject(themeVariantsCss)) {
    const localCoreUrl = PARAGON_THEME.paragon?.themeUrls?.core;
    const localThemeVariants = PARAGON_THEME.paragon?.themeUrls?.variants;

    if (isEmptyObject(localCoreUrl) || isEmptyObject(localThemeVariants)) {
      return undefined;
    }
    if (!coreCss.default) {
      coreCss.default = fallbackThemeUrl(localCoreUrl?.fileName);
    }

    if (isEmptyObject(themeVariantsCss)) {
      Object.entries(localThemeVariants).forEach(([themeVariant, { fileName, ...rest }]) => {
        themeVariantsCss[themeVariant] = {
          urls: { default: fallbackThemeUrl(fileName), ...rest.urls },
        };
      });
    }
    return {
      core: { urls: coreCss },
      defaults: defaultThemeVariants,
      variants: themeVariantsCss,
    };
  }

  return {
    core: { urls: coreCss },
    defaults: defaultThemeVariants,
    variants: themeVariantsCss,
  };
}, [config?.PARAGON_THEME_URLS]);

export default useParagonThemeUrls;
