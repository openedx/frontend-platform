import { useEffect, useState } from 'react';

import { getConfig } from '../../../config';
import { basename } from '../../../initialize';
import { logError, logInfo } from '../../../logging';
import { removeExistingLinks } from './utils';

/**
 * Adds/updates a `<link>` element in the HTML document to load the core application theme CSS.
 *
 * @memberof module:React
 *
 * @param {object} args
 * @param {object} args.themeCore Object representing the core Paragon theme CSS.
 * @param {string} args.onLoad A callback function called when the core theme CSS is loaded.
 */
const useParagonThemeCore = ({
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
    const getParagonThemeCoreLink = () => document.head.querySelector('link[data-paragon-theme-core="true"]');
    const existingCoreThemeLink = document.head.querySelector(`link[href='${themeCore.urls.default}']`);
    const brandCoreLink = document.head.querySelector(`link[href='${themeCore.urls.brandOverride}']`);
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
            const coreThemeFallbackUrl = `${getConfig().BASE_URL}${basename}${themeUrls.core.fileName}`;
            logInfo(`Falling back to locally installed core theme CSS: ${coreThemeFallbackUrl}`);
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
        setIsBrandThemeCoreLoaded(true);
      }
    } else {
      existingCoreThemeLink.rel = 'stylesheet';
      existingCoreThemeLink.removeAttribute('as');
      existingCoreThemeLink.dataset.paragonThemeCore = true;
      if (brandCoreLink) {
        brandCoreLink.rel = 'stylesheet';
        brandCoreLink.removeAttribute('as');
        brandCoreLink.dataset.brandThemeCore = true;
      }
      setIsParagonThemeCoreLoaded(true);
      setIsBrandThemeCoreLoaded(true);
    }
  }, [themeCore?.urls, onLoad]);
};

export default useParagonThemeCore;
