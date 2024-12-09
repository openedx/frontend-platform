import { getConfig } from '../../../config';
import { basename } from '../../../initialize';
import { SELECTED_THEME_VARIANT_KEY } from '../../constants';

/**
 * Iterates through each given `<link>` element and removes it from the DOM.
 * @param {HTMLLinkElement[]} existingLinks
 */
export const removeExistingLinks = (existingLinks) => {
  existingLinks.forEach((link) => {
    link.remove();
  });
};

/**
* Finds the default theme variant from the given theme variants object. If no default theme exists, the first theme
* variant is returned as a fallback.
* @param {Object.<string, ParagonThemeVariant>|undefined} themeVariants
*
* @returns {ParagonThemeVariant|undefined} The default theme variant.
*/
export const getDefaultThemeVariant = ({ themeVariants, themeVariantDefaults = {} }) => {
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

  // Then, detect system preference via `prefers-color-scheme` media query and use
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

  const defaultLightThemeVariant = themeVariantDefaults.light;
  const lightThemeVariantMetadata = themeVariants[defaultLightThemeVariant];

  // Handle edge case where the default light theme variant is not configured or provided.
  if (!defaultLightThemeVariant || !lightThemeVariantMetadata) {
    return undefined;
  }

  // Otherwise, fallback to using the default light theme variant as configured.
  return {
    name: defaultLightThemeVariant,
    metadata: lightThemeVariantMetadata,
  };
};

/**
* Creates the fallback URL for the given theme file.
* @param {string} url The theme file path.
* @returns {string} The default theme url.
*/
export const fallbackThemeUrl = (url) => {
  const baseUrl = getConfig().BASE_URL || window.location?.origin;
  return `${baseUrl}${basename}${url}`;
};

export const handleVersionSubstitution = ({ url, wildcardKeyword, localVersion }) => {
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replaceAll(wildcardKeyword, localVersion);
};

export const isEmptyObject = (obj) => !obj || Object.keys(obj).length === 0;
