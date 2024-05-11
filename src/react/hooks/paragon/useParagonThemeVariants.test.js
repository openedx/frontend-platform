import { act, renderHook } from '@testing-library/react-hooks';
import { getConfig } from '../../../config';
import { logError } from '../../../logging';
import useParagonThemeVariants from './useParagonThemeVariants';

jest.mock('../../../logging');

describe('useParagonThemeVariants', () => {
  const themeOnLoad = jest.fn();

  afterEach(() => {
    document.head.innerHTML = '';
    jest.clearAllMocks();
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

    renderHook(() => useParagonThemeVariants({ themeVariants, currentThemeVariant, onLoad: themeOnLoad }));
    const themeLinks = document.head.querySelectorAll('link');
    act(() => { themeLinks.forEach((link) => link.onload()); });

    expect(themeLinks.length).toBe(4);
  });

  it('should dispatch a log error and fallback to PARAGON_THEME if can not load the variant theme link', () => {
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
    const themeVariants = {
      light: {
        urls: {
          default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
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
  });

  it('should do nothing if themeVariants is not configured', () => {
    const themeVariants = null;
    const currentTheme = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onLoad: themeOnLoad }));
    expect(document.head.querySelectorAll('link').length).toBe(0);
  });

  it('should not create any core link if can not find themeVariant urls definition', () => {
    const themeVariants = {
      light: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
      },
      dark: {
        default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/dark.min.css',
      },
    };

    const currentTheme = 'light';

    renderHook(() => useParagonThemeVariants({ themeVariants, currentTheme, onLoad: themeOnLoad }));

    expect(document.head.querySelectorAll('link').length).toBe(0);
  });
});
