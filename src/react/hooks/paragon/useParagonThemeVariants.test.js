import { act, renderHook } from '@testing-library/react-hooks';
import { getConfig } from '../../../config';
import { logError } from '../../../logging';
import useParagonThemeVariants from './useParagonThemeVariants';

jest.mock('../../../logging');

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockOnChange = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    onchange: mockOnChange,
  })),
});

describe('useParagonThemeVariants', () => {
  const themeOnLoad = jest.fn();
  let initialState = false;

  afterEach(() => {
    document.head.innerHTML = '';
    themeOnLoad.mockClear();
    initialState = false;
    logError.mockClear();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
  });

  it('should create the links tags for each theme variant and change the state to true when are loaded', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/light.min.css',

        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/dark.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/dark.min.css',

        },
      },
    };
    const currentThemeVariant = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onLoad: themeOnLoad }));
    const themeLinks = document.head.querySelectorAll('link');
    act(() => { themeLinks.forEach((link) => link.onload()); });

    expect(themeLinks.length).toBe(4);
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
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
        },
      },
    };
    const currentThemeVariant = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onLoad: themeOnLoad }));
    const createdLinkTag = document.head.querySelector('link');
    act(() => { createdLinkTag.onerror(); });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(`Failed to load theme variant (${currentThemeVariant}) CSS from ${themeVariants.light.urls.default}`);
    expect(document.querySelector('link').href).toBe(`${getConfig().BASE_URL}/${PARAGON_THEME.paragon.themeUrls.variants.light.fileName}`);
    expect(initialState).toBeFalsy();
  });

  it('should configure themes acording with system preference and add the change event listener', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    window.matchMedia['prefers-color-scheme'] = 'dark';

    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/light.min.css',

        },
      },
      dark: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/dark.min.css',
          brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/dark.min.css',

        },
      },
    };

    const currentThemeVariant = 'light';
    renderHook(() => useParagonThemeVariants({
      themeVariants,
      currentThemeVariant,
      onLoad: themeOnLoad,
    }));

    const themeLinks = document.head.querySelectorAll('link');
    act(() => {
      themeLinks.forEach((link) => link.onload());
      window.matchMedia.matches = false;
    });

    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(initialState).toBeTruthy();
  });

  it('should do nothing if themeVariants is not configured', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const themeVariants = null;
    const currentTheme = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onLoad: themeOnLoad }));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(initialState).toBeFalsy();
  });

  it('should do nothing if themeVariants is not configured properly', () => {
    themeOnLoad.mockImplementation(() => { initialState = true; });
    const themeVariants = {
      light: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
      },
      dark: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/dark.min.css',
      },
    };

    const currentTheme = 'light';
    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onLoad: themeOnLoad }));
    expect(document.head.querySelectorAll('link').length).toBe(0);
    expect(initialState).toBeTruthy();
  });
});
