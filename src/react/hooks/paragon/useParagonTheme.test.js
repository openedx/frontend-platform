import { act, renderHook } from '@testing-library/react-hooks';
import useParagonTheme from './useParagonTheme';

describe('useParagonTheme', () => {
  it('should return an array with and object that indicates the theme status, and a function', () => {
    const config = {
      PARAGON_THEME_URLS: {
        core: {
          urls: {
            default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
          },
        },
        defaults: {
          light: 'light',
          dark: 'dark',
        },
        variants: {
          light: {
            urls: {
              default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
            },
          },
          dark: {
            urls: {
              default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/dark.min.css',
            },
          },
        },
      },
    };

    const { result } = renderHook(() => useParagonTheme(config));
    const createdLinksTag = document.head.querySelectorAll('link');
    act(() => { createdLinksTag.forEach((link) => link.onload()); });

    expect(result.current).toEqual([{ isThemeLoaded: true, themeVariant: 'light' }, expect.any(Function)]);
  });
});
