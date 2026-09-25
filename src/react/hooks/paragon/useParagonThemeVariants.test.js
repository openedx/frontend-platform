import { act, renderHook } from '@testing-library/react';

import { getConfig } from '../../../config';
import { logError, logInfo } from '../../../logging';

import useParagonThemeVariants from './useParagonThemeVariants';

jest.mock('../../../logging');

describe('useParagonThemeVariants', () => {
  const themeOnComplete = jest.fn();
  const originalWindowLocation = window.location;
  const mockWindowLocationOrigin = jest.fn();

  beforeEach(() => {
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
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it('should create the links tags for each theme variant and change the state to true when all variants are loaded', () => {
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/dark.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/dark.min.css',
        },
      },
    };
    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete: themeOnComplete }));
    const themeLinks = document.head.querySelectorAll('link');
    act(() => { themeLinks.forEach((link) => link.onload()); });

    expect(themeLinks.length).toBe(4);
  });

  it('should dispatch a log error and fallback to PARAGON_THEME if can not load the variant theme link', () => {
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css',
        },
      },
    };
    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete: themeOnComplete }));
    const themeLinks = document.head.querySelectorAll('link');
    const paragonFallbackURL = `//${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.variants.light.fileName}`;
    const brandFallbackURL = `//${getConfig().BASE_URL}/${PARAGON_THEME.brand.themeUrls.variants.light.fileName}`;

    act(() => { themeLinks.forEach((link) => link.onerror()); });

    expect(logInfo).toHaveBeenCalledTimes(2);
    expect(logInfo).toHaveBeenCalledWith(`Failed to load theme variant (${currentThemeVariant}) CSS from ${themeVariants.light.urls.default}. Falling back to locally installed theme variant: ${paragonFallbackURL}`);
    expect(logInfo).toHaveBeenCalledWith(`Failed to load theme variant (${currentThemeVariant}) CSS from ${themeVariants.light.urls.brandOverride}. Falling back to locally installed theme variant: ${brandFallbackURL}`);

    const fallbackLinkTag = document.querySelectorAll('link');

    expect(fallbackLinkTag.length).toBe(2);
    expect(fallbackLinkTag[0].href).toBe(`http:${paragonFallbackURL}`);
    expect(fallbackLinkTag[1].href).toBe(`http:${brandFallbackURL}`);
  });

  it('should dispatch a log error if the fallback url is not loaded (either default or brandOverride)', () => {
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css',
        },
      },
    };

    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete: themeOnComplete }));
    const themeLinks = document.head.querySelectorAll('link');
    const paragonFallbackURL = `//${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.variants.light.fileName}`;
    const brandFallbackURL = `//${getConfig().BASE_URL}/${PARAGON_THEME.brand.themeUrls.variants.light.fileName}`;

    act(() => { themeLinks.forEach((link) => link.onerror()); });

    const fallbackLinks = document.querySelectorAll('link');
    expect(fallbackLinks[0].href).toBe(`http:${paragonFallbackURL}`);
    expect(fallbackLinks[1].href).toBe(`http:${brandFallbackURL}`);
    act(() => { fallbackLinks.forEach((link) => link.onerror()); });

    expect(logInfo).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledWith('Could not load theme variant (paragon - light) CSS from fallback URL. Aborting.');
    expect(logError).toHaveBeenCalledWith('Could not load theme variant (brand - light) CSS from fallback URL. Aborting.');
  });
  it('should dispatch a log error if can not load the theme variant and the fallback url is not configured', () => {
    const originalParagonTheme = global.PARAGON_THEME;
    Object.defineProperty(global, 'PARAGON_THEME', {
      value: 'mocked-theme',
      writable: true,
    });
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css',
        },
      },
    };

    const currentThemeVariant = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onComplete: themeOnComplete }));
    const themeLinks = document.head.querySelectorAll('link');
    act(() => { themeLinks.forEach((link) => link.onerror()); });
    expect(logError).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledWith(`Failed to load theme variant (${currentThemeVariant}) CSS from ${themeVariants.light.urls.default} and locally installed fallback URL is not available. Aborting.`);

    // Restores the original PARAGON_THEME
    Object.defineProperty(global, 'PARAGON_THEME', {
      value: originalParagonTheme,
      writable: false,
    });
  });

  it('should do nothing if themeVariants is not configured', () => {
    const themeVariants = null;
    const currentTheme = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onComplete: themeOnComplete }));
    expect(document.head.querySelectorAll('link').length).toBe(0);
  });

  it('should not create any variant link if can not find themeVariant urls definition', () => {
    const themeVariants = {
      light: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
      },
      dark: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/dark.min.css',
      },
    };

    const currentTheme = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onComplete: themeOnComplete }));

    expect(document.head.querySelectorAll('link').length).toBe(0);
  });
  it('shoud not create a new link if it already exists', () => {
    document.head.innerHTML = `<link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css" onerror="this.remove();">
    <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css" onerror="this.remove();">`;

    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/light.min.css',
        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/dark.min.css',
        },
      },
    };

    const currentTheme = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onComplete: themeOnComplete }));
    const themeLinks = document.head.querySelectorAll('link');
    const lightThemeLink = document.head.querySelector('link[data-paragon-theme-variant="light"]');
    const lightThemeBrandLink = document.head.querySelector('link[data-brand-theme-variant="light"]');

    expect(themeLinks.length).toBe(3);
    expect(lightThemeLink.rel).toContain('stylesheet');
    expect(lightThemeLink).not.toHaveAttribute('as', 'style');
    expect(lightThemeBrandLink.rel).toContain('stylesheet');
    expect(lightThemeBrandLink).not.toHaveAttribute('as', 'style');
  });
});
