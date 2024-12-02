import { getConfig } from '../../../config';
import { basename } from '../../../initialize';
import { SELECTED_THEME_VARIANT_KEY } from '../../constants';

/**
 * Iterates through each given `<link>` element and removes it from the DOM.
 * @param {HTMLLinkElement[]} existingLinks
 */
export var removeExistingLinks = function removeExistingLinks(existingLinks) {
  existingLinks.forEach(function (link) {
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
export var getDefaultThemeVariant = function getDefaultThemeVariant(_ref) {
  var _window$matchMedia, _window;
  var themeVariants = _ref.themeVariants,
    _ref$themeVariantDefa = _ref.themeVariantDefaults,
    themeVariantDefaults = _ref$themeVariantDefa === void 0 ? {} : _ref$themeVariantDefa;
  if (!themeVariants) {
    return undefined;
  }
  var themeVariantKeys = Object.keys(themeVariants);

  // Return early if there are no theme variants configured.
  if (themeVariantKeys.length === 0) {
    return undefined;
  }
  // If there is only one theme variant, return it since it's the only one that may be used.
  if (themeVariantKeys.length === 1) {
    var themeVariantKey = themeVariantKeys[0];
    return {
      name: themeVariantKey,
      metadata: themeVariants[themeVariantKey]
    };
  }
  // There's more than one theme variant configured; figured out which one to display based on
  // the following preference rules:
  //   1. Get theme preference from localStorage.
  //   2. Detect user system settings.
  //   3. Use the default theme variant as configured.

  // Prioritize persisted localStorage theme variant preference.
  var persistedSelectedParagonThemeVariant = localStorage.getItem(SELECTED_THEME_VARIANT_KEY);
  if (persistedSelectedParagonThemeVariant && themeVariants[persistedSelectedParagonThemeVariant]) {
    return {
      name: persistedSelectedParagonThemeVariant,
      metadata: themeVariants[persistedSelectedParagonThemeVariant]
    };
  }

  // Then, detect system preference via `prefers-color-scheme` media query and use
  // the default dark theme variant, if one exists.
  var hasDarkSystemPreference = !!((_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && (_window$matchMedia = _window$matchMedia.call(_window, '(prefers-color-scheme: dark)')) !== null && _window$matchMedia !== void 0 && _window$matchMedia.matches);
  var defaultDarkThemeVariant = themeVariantDefaults.dark;
  var darkThemeVariantMetadata = themeVariants[defaultDarkThemeVariant];
  if (hasDarkSystemPreference && defaultDarkThemeVariant && darkThemeVariantMetadata) {
    return {
      name: defaultDarkThemeVariant,
      metadata: darkThemeVariantMetadata
    };
  }
  var defaultLightThemeVariant = themeVariantDefaults.light;
  var lightThemeVariantMetadata = themeVariants[defaultLightThemeVariant];

  // Handle edge case where the default light theme variant is not configured or provided.
  if (!defaultLightThemeVariant || !lightThemeVariantMetadata) {
    return undefined;
  }

  // Otherwise, fallback to using the default light theme variant as configured.
  return {
    name: defaultLightThemeVariant,
    metadata: lightThemeVariantMetadata
  };
};

/**
* Creates the fallback URL for the given theme file.
* @param {string} url The theme file path.
* @returns {string} The default theme url.
*/
export var fallbackThemeUrl = function fallbackThemeUrl(url) {
  var _window$location;
  var baseUrl = getConfig().BASE_URL || ((_window$location = window.location) === null || _window$location === void 0 ? void 0 : _window$location.origin);
  return "".concat(baseUrl).concat(basename).concat(url);
};
export var handleVersionSubstitution = function handleVersionSubstitution(_ref2) {
  var url = _ref2.url,
    wildcardKeyword = _ref2.wildcardKeyword,
    localVersion = _ref2.localVersion;
  if (!url || !url.includes(wildcardKeyword) || !localVersion) {
    return url;
  }
  return url.replaceAll(wildcardKeyword, localVersion);
};
export var isEmptyObject = function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
};
//# sourceMappingURL=utils.js.map