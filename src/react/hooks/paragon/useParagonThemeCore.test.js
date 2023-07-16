import { renderHook, act } from '@testing-library/react-hooks';
import { getConfig } from '../../../config';
import { logError } from '../../../logging';
import useParagonThemeCore from './useParagonThemeCore';

jest.mock('../../../logging');

describe('useParagonThemeCore', () => {
  const themeOnLoad = jest.fn();
  let initialState = false;

  afterEach(() => {
    initialState = false;
    document.head.innerHTML = '';
    themeOnLoad.mockClear();
    logError.mockClear();
  });
  it('should load the core url and change the loading state to true', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const coreConfig = {
      themeCore: {
        urls: { default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css' },
      },
      onLoad: themeOnLoad,
    };
    renderHook(() => useParagonThemeCore(coreConfig));
    const createdLinkTag = document.head.querySelector('link');
    act(() => createdLinkTag.onload());
    expect(createdLinkTag.href).toBe(coreConfig.themeCore.urls.default);
    expect(themeOnLoad).toHaveBeenCalledTimes(1);
    expect(initialState).toBeTruthy();
  });

  it('should load the core default and brand url and change the loading state to true', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersionVersion/dist/core.min.css',
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
    expect(initialState).toBeTruthy();
  });

  it('should dispatch a log error and fallback to PARAGON_THEME if can not load the core theme link', () => {
    global.PARAGON_THEME = {
      paragon: {
        version: '1.0.0',
        themeUrls: {
          core: {
            fileName: 'core.min.css',
          },
          variants: {
            light: {
              fileName: 'light.min.css',
              default: true,
              dark: false,
            },
          },
        },
      },
    };
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const coreConfig = {
      themeCore: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
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
    expect(initialState).toBeFalsy();
  });

  it('should not create any core link if is properly configured', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const coreConfig = {
      themeCore: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
      },
      onLoad: themeOnLoad,
    };
    renderHook(() => useParagonThemeCore(coreConfig));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(themeOnLoad).toHaveBeenCalledTimes(1);
    expect(initialState).toBeTruthy();
  });
});
