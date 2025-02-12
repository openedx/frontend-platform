import { renderHook } from '@testing-library/react-hooks';

import useParagonThemeUrls from './useParagonThemeUrls';
import { mergeConfig } from '../../../config';

describe('useParagonThemeUrls', () => {
  beforeEach(() => { jest.resetAllMocks(); });
  it.each([
    undefined,
    {},
  ])('handles when `config.PARAGON_THEME_URLS` is not present', (paragonThemeUrls) => {
    mergeConfig({ PARAGON_THEME_URLS: paragonThemeUrls });
    const { result } = renderHook(() => useParagonThemeUrls());
    expect(result.current).toEqual(undefined);
  });

  describe('when `config.PARAGON_THEME_URLS` is present', () => {
    it('returns expected object when configuration is valid (only Paragon)', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            url: 'core.css',
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              url: 'light.css',
            },
          },
        },
      };
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls(config));
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: 'core.css',
              brandOverride: undefined,
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'light.css',
                brandOverride: undefined,
              },
            },
          },
        }),
      );
    });

    it('returns expected object when configuration is valid (both Paragon + brand)', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            urls: {
              default: 'core.css',
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'light.css',
                brandOverride: 'brand-light.css',
              },
            },
          },
        },
      };
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls(config));
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: 'core.css',
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'light.css',
                brandOverride: 'brand-light.css',
              },
            },
          },
        }),
      );
    });
    it('returns expected object when core default and variants are not present, fallback to PARAGON_THEME', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            urls: {
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {},
        },
      };
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls());
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: 'localhost:8080/core.min.css',
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'localhost:8080/light.min.css',
              },
            },
          },
        }),
      );
    });
    it('returns expected undefined when core default and variants are not present and can not fallback to PARAGON_THEME', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            urls: {
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {},
        },
      };
      const originalParagonTheme = global.PARAGON_THEME;
      Object.defineProperty(global, 'PARAGON_THEME', {
        value: 'mocked-theme',
        writable: true,
      });
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls());
      expect(result.current).toBe(undefined);
      // Restores the original PARAGON_THEME
      Object.defineProperty(global, 'PARAGON_THEME', {
        value: originalParagonTheme,
        writable: false,
      });
    });
    it('manage substitucion of keywords in the url with the local installed version', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            urls: {
              default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/core.min.css',
              brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/core.min.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$paragonVersion/dist/light.min.css',
                brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@$brandVersion/dist/light.min.css',
              },
            },
          },
        },
      };
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls(config));
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@1.0.0/dist/core.min.css',
              brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@1.0.0/dist/core.min.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@1.0.0/dist/light.min.css',
                brandOverride: 'https://cdn.jsdelivr.net/npm/@edx/brand@1.0.0/dist/light.min.css',
              },
            },
          },
        }),
      );
    });
  });
});
