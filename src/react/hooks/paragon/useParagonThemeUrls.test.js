import { renderHook } from '@testing-library/react-hooks';

import useParagonThemeUrls from './useParagonThemeUrls';

describe('useParagonThemeUrls', () => {
  it.each([
    undefined,
    {},
  ])('handles when `config.PARAGON_THEME_URLS` is not present', (config) => {
    const { result } = renderHook(() => useParagonThemeUrls(config));
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
      const { result } = renderHook(() => useParagonThemeUrls(config));
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: 'core.min.css',
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              url: 'http://localhost/light.min.css',
            },
          },
        }),
      );
    });
  });
});
