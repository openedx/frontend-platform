import { useMemo } from 'react';
import { handleVersionSubstitution } from './utils';

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
        brandOverride: handleVersionSubstitution({
          url: urls.brandOverride,
          wildcardKeyword: '$brandVersion',
          localVersion: localBrandVersion,
        }),
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
    const baseUrl = config.BASE_URL || window.location?.origin;
    const prependBaseUrl = (url) => `${baseUrl}/${url}`;
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
}, [config?.BASE_URL, config?.PARAGON_THEME_URLS]);

export default useParagonThemeUrls;
