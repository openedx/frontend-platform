import { renderHook, act } from '@testing-library/react';

import { getConfig } from '../../../config';
import { logError, logInfo } from '../../../logging';

import useParagonThemeCore from './useParagonThemeCore';

jest.mock('../../../logging');

describe('useParagonThemeCore', () => {
  const themeOnComplete = jest.fn();
  let coreConfig;
  const originalWindowLocation = window.location;
  const mockWindowLocationOrigin = jest.fn();

  beforeEach(() => {
    document.head.innerHTML = '';
    coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@21.0.0/dist/core.min.css',
        },
      },
      onComplete: themeOnComplete,
    };

    Object.defineProperty(window, 'location', {
      value: {
        get origin() {
          return mockWindowLocationOrigin();
        },
      },
    });
    mockWindowLocationOrigin.mockReturnValue(getConfig().BASE_URL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it('should load the core url and change the loading state to true', () => {
    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link');
    act(() => createdLinkTag.onload());
    expect(createdLinkTag.href).toBe(coreConfig.themeCore.urls.default);
    expect(themeOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should load the core default and brand url and change the loading state to true', () => {
    coreConfig.themeCore.urls.brandOverride = 'https://cdn.jsdelivr.net/npm/@edx/brand@2.0.0/dist/core.min.css';

    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');
    const createdBrandLinkTag = document.head.querySelector('link[data-brand-theme-core="true"]');

    act(() => { createdLinkTag.onload(); createdBrandLinkTag.onload(); });
    expect(createdLinkTag.href).toBe(coreConfig.themeCore.urls.default);
    expect(createdBrandLinkTag.href).toBe(coreConfig.themeCore.urls.brandOverride);
    expect(themeOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a log error and fallback to PARAGON_THEME if can not load the core theme link (either default or brandOverride)', () => {
    coreConfig.themeCore.urls.brandOverride = 'https://cdn.jsdelivr.net/npm/@edx/brand@2.0.0/dist/core.min.css';
    renderHook(() => useParagonThemeCore(coreConfig));

    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');
    const createdBrandLinkTag = document.head.querySelector('link[data-brand-theme-core="true"]');
    const defaultFallbackUrl = `//${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.core.fileName}`;
    const brandFallbackUrl = `//${getConfig().BASE_URL}/${PARAGON_THEME.brand.themeUrls.core.fileName}`;

    act(() => { createdLinkTag.onerror(); createdBrandLinkTag.onerror(); });

    const fallbackLinks = document.querySelectorAll('link');

    expect(logInfo).toHaveBeenCalledTimes(2);
    expect(logInfo).toHaveBeenCalledWith(`Could not load core theme CSS from ${coreConfig.themeCore.urls.default}. Falling back to locally installed core theme CSS: ${defaultFallbackUrl}`);
    expect(logInfo).toHaveBeenCalledWith(`Could not load core theme CSS from ${coreConfig.themeCore.urls.brandOverride}. Falling back to locally installed core theme CSS: ${brandFallbackUrl}`);
    expect(fallbackLinks[0].href).toBe(`http:${defaultFallbackUrl}`);
    expect(fallbackLinks[1].href).toBe(`http:${brandFallbackUrl}`);
  });
  it('should dispatch a log error if the fallback url is not loaded (either default or brandOverride)', () => {
    coreConfig.themeCore.urls.brandOverride = 'https://cdn.jsdelivr.net/npm/@edx/brand@2.0.0/dist/core.min.css';

    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');
    const createdBrandLinkTag = document.head.querySelector('link[data-brand-theme-core="true"]');
    const defaultFallbackUrl = `http://${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.core.fileName}`;
    const brandFallbackUrl = `http://${getConfig().BASE_URL}/${PARAGON_THEME.brand.themeUrls.core.fileName}`;

    act(() => { createdLinkTag.onerror(); createdBrandLinkTag.onerror(); });
    const fallbackLinks = document.querySelectorAll('link');

    expect(fallbackLinks[0].href).toBe(defaultFallbackUrl);
    expect(fallbackLinks[1].href).toBe(brandFallbackUrl);
    act(() => { fallbackLinks[0].onerror(); fallbackLinks[1].onerror(); });

    expect(logInfo).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledWith('Could not load core theme fallback URL. Aborting.');
  });
  it('should dispatch a log error if can not load the core theme and the fallback url is not configured', () => {
    const originalParagonTheme = global.PARAGON_THEME;
    Object.defineProperty(global, 'PARAGON_THEME', {
      value: 'mocked-theme',
      writable: true,
    });
    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');
    act(() => { createdLinkTag.onerror(); });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(`Failed to load core theme CSS from ${coreConfig.themeCore.urls.default} or fallback URL. Aborting.`);

    // Restores the original PARAGON_THEME
    Object.defineProperty(global, 'PARAGON_THEME', {
      value: originalParagonTheme,
      writable: false,
    });
  });

  it('should not create a new link if the core theme is already loaded (either default or brandOverride)', () => {
    coreConfig.themeCore.urls.brandOverride = 'https://cdn.jsdelivr.net/npm/@edx/brand@2.0.0/dist/core.min.css';

    document.head.innerHTML = `<link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@edx/paragon@21.0.0/dist/core.min.css" onerror="this.remove();">
    <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@edx/brand@2.0.0/dist/core.min.css" onerror="this.remove();">`;

    renderHook(() => useParagonThemeCore(coreConfig));

    const createdLinkTags = document.head.querySelectorAll('link');

    expect(createdLinkTags.length).toBe(2);
    expect(createdLinkTags[0].rel).toContain('stylesheet');
    expect(createdLinkTags[0]).not.toHaveAttribute('as', 'style');
    expect(createdLinkTags[1].rel).toContain('stylesheet');
    expect(createdLinkTags[1].href).toBe(coreConfig.themeCore.urls.brandOverride);
    expect(createdLinkTags[1]).not.toHaveAttribute('as', 'style');
  });

  it('should not create any core link if can not find themeCore urls definition', () => {
    coreConfig = {
      themeCore: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@21.0.0/dist/core.min.css',
      },
      onComplete: themeOnComplete,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(themeOnComplete).toHaveBeenCalledTimes(1);
  });
});
