import { renderHook, act } from '@testing-library/react-hooks';
import { getConfig } from '../../../config';
import { logError } from '../../../logging';
import useParagonThemeCore from './useParagonThemeCore';

jest.mock('../../../logging');

describe('useParagonThemeCore', () => {
  const themeOnLoad = jest.fn();

  afterEach(() => {
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should load the core url and change the loading state to true', () => {
    const coreConfig = {
      themeCore: {
        urls: { default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css' },
      },
      onLoad: themeOnLoad,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link');
    act(() => createdLinkTag.onload());
    expect(createdLinkTag.href).toBe(coreConfig.themeCore.urls.default);
    expect(themeOnLoad).toHaveBeenCalledTimes(1);
  });

  it('should load the core default and brand url and change the loading state to true', () => {
    const coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0Version/dist/core.min.css',
        },
      },
      onLoad: themeOnLoad,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');
    const createdBrandLinkTag = document.head.querySelector('link[data-brand-theme-core="true"]');

    act(() => { createdLinkTag.onload(); createdBrandLinkTag.onload(); });
    expect(createdLinkTag.href).toBe(coreConfig.themeCore.urls.default);
    expect(createdBrandLinkTag.href).toBe(coreConfig.themeCore.urls.brandOverride);
    expect(themeOnLoad).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a log error and fallback to PARAGON_THEME if can not load the core theme link', () => {
    global.PARAGON_THEME = {
      paragon: {
        version: '1.0.0',
        themeUrls: {
          core: {
            fileName: 'core.min.css',
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              fileName: 'light.min.css',
            },
          },
        },
      },
    };
    const coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css',
        },
      },
      onLoad: themeOnLoad,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link[data-paragon-theme-core="true"]');

    act(() => { createdLinkTag.onerror(); });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(`Failed to load core theme CSS from ${coreConfig.themeCore.urls.default}`);
    expect(document.querySelector('link').href).toBe(`${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.core.fileName}`);
  });

  it('should not create a new link if the core theme is already loaded', () => {
    document.head.innerHTML = '<link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css" onerror="this.remove();">';
    const coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css',
        },
      },
      onLoad: themeOnLoad,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    const themeCoreLinks = document.head.querySelectorAll('link');
    expect(themeCoreLinks.length).toBe(1);
    expect(themeCoreLinks[0].rel).toContain('stylesheet');
    expect(themeCoreLinks[0]).not.toHaveAttribute('as', 'style');
  });

  it('should not create any core link if can not find themeCore urls definition', () => {
    const coreConfig = {
      themeCore: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css',
      },
      onLoad: themeOnLoad,
    };

    renderHook(() => useParagonThemeCore(coreConfig));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(themeOnLoad).toHaveBeenCalledTimes(1);
  });
});
