import { useEffect, useState } from 'react';

import { logError, logInfo } from '../../../logging';
import { fallbackThemeUrl, removeExistingLinks } from './utils';

/**
 * Custom React hook that manages the loading and updating of the core Paragon theme CSS and the brand override
 * theme CSS. It ensures that the core theme CSS (both default and brand override) is added to the document
 * `<head>` as `<link>` elements.
 *
 * The function logs and handles fallback logic in case the core theme fails to load.
 *
 * @memberof module:React
 *
 * @param {Object} args - The arguments object containing theme and callback information.
 * @param {Object} args.themeCore - The core theme configuration.
 * @param {string} args.themeCore.urls.default - The URL to the default core theme CSS.
 * @param {string} [args.themeCore.urls.brandOverride] - The URL to the brand override theme CSS (optional).
 * @param {Function} args.onComplete - A callback function that is called once both the core Paragon (default)
 * theme and brand override theme (if provided) are complete.
 */
const useParagonThemeCore = ({
  themeCore,
  onComplete,
}) => {
  const [isParagonThemeCoreComplete, setIsParagonThemeCoreComplete] = useState(false);
  const [isBrandThemeCoreComplete, setIsBrandThemeCoreComplete] = useState(false);

  useEffect(() => {
    // Call `onComplete` once both the paragon and brand theme core are complete.
    if (isParagonThemeCoreComplete && isBrandThemeCoreComplete) {
      onComplete();
    }
  }, [isParagonThemeCoreComplete, isBrandThemeCoreComplete, onComplete]);

  useEffect(() => {
    // If there is no config for the core theme url, do nothing.
    if (!themeCore?.urls) {
      setIsParagonThemeCoreComplete(true);
      setIsBrandThemeCoreComplete(true);
      return;
    }

    const existingCoreThemeLink = document.head.querySelector(`link[href='${themeCore.urls.default}']`);
    const brandCoreLink = document.head.querySelector(`link[href='${themeCore.urls.brandOverride}']`);

    if (existingCoreThemeLink) {
      existingCoreThemeLink.rel = 'stylesheet';
      existingCoreThemeLink.removeAttribute('as');
      existingCoreThemeLink.dataset.paragonThemeCore = true;
      if (brandCoreLink) {
        brandCoreLink.rel = 'stylesheet';
        brandCoreLink.removeAttribute('as');
        brandCoreLink.dataset.brandThemeCore = true;
      }
      setIsParagonThemeCoreComplete(true);
      setIsBrandThemeCoreComplete(true);
      return;
    }

    const getParagonThemeCoreLink = () => document.head.querySelector('link[data-paragon-theme-core="true"]');
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
          setIsBrandThemeCoreComplete(true);
        } else {
          setIsParagonThemeCoreComplete(true);
        }
      };
      coreThemeLink.onerror = () => {
        if (isFallbackThemeUrl) {
          logError('Could not load core theme fallback URL. Aborting.');
          if (isBrandOverride) {
            setIsBrandThemeCoreComplete(true);
          } else {
            setIsParagonThemeCoreComplete(true);
          }
          const otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
          removeExistingLinks(otherExistingLinks);
          return;
        }
        const paragonThemeAccessor = isBrandOverride ? 'brand' : 'paragon';
        const core = PARAGON_THEME?.[paragonThemeAccessor]?.themeUrls?.core ?? null;
        if (core) {
          const coreThemeFallbackUrl = fallbackThemeUrl(core.fileName);
          logInfo(`Could not load core theme CSS from ${url}. Falling back to locally installed core theme CSS: ${coreThemeFallbackUrl}`);
          coreThemeLink = createCoreThemeLink(coreThemeFallbackUrl, { isFallbackThemeUrl: true, isBrandOverride });
          const otherExistingLinks = getExistingCoreThemeLinks(isBrandOverride);
          removeExistingLinks(otherExistingLinks);
          const foundParagonThemeCoreLink = getParagonThemeCoreLink();
          if (foundParagonThemeCoreLink) {
            foundParagonThemeCoreLink.insertAdjacentElement(
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
      setIsBrandThemeCoreComplete(true);
    }
  }, [themeCore?.urls, onComplete]);
};

export default useParagonThemeCore;
