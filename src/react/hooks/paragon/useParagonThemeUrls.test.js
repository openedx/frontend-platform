import { renderHook } from '@testing-library/react';

import useParagonThemeUrls from './useParagonThemeUrls';
import { mergeConfig, getConfig } from '../../../config';

Object.defineProperty(global, 'PARAGON_THEME', {
  value: {
    paragon: {
      version: '1.0.0',
      themeUrls: {
        core: {
          fileName: 'local-core.min.css',
        },
        defaults: {
          light: 'light',
        },
        variants: {
          light: {
            fileName: 'local-light.min.css',
          },
        },
      },
    },
    brand: {
      version: '1.0.0',
      themeUrls: {
        core: {
          fileName: 'brand-local-core.min.css',
        },
        defaults: {
          light: 'light',
        },
        variants: {
          light: {
            fileName: 'brand-local-light.min.css',
          },
        },
      },
    },
  },
  writable: true,
});

const originalWindowLocation = window.location;
const mockWindowLocationOrigin = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    get origin() {
      return mockWindowLocationOrigin();
    },
  },
});

describe('useParagonThemeUrls', () => {
  beforeEach(() => {
    mockWindowLocationOrigin.mockReturnValue(getConfig().BASE_URL);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });
  it.each([
    [undefined, undefined],
    [{}, {
      core: { urls: { default: '//localhost:8080/local-core.min.css', brandOverride: '//localhost:8080/brand-local-core.min.css' } },
      defaults: { light: 'light' },
      variants: { light: { urls: { default: '//localhost:8080/local-light.min.css', brandOverride: '//localhost:8080/brand-local-light.min.css' } } },
    }],
  ])('handles when `config.PARAGON_THEME_URLS` is not present (%s)', (paragonThemeUrls, expectedURLConfig) => {
    mergeConfig({ PARAGON_THEME_URLS: paragonThemeUrls });
    const { result } = renderHook(() => useParagonThemeUrls());
    expect(result.current).toEqual(expectedURLConfig);
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
              default: '//localhost:8080/local-core.min.css',
              brandOverride: 'brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: '//localhost:8080/local-light.min.css',
                brandOverride: '//localhost:8080/brand-local-light.min.css',
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
        value: undefined,
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
    it('returns expected object when only brand override URLs are present, fallback to PARAGON_THEME', () => {
      const config = {
        PARAGON_THEME_URLS: {
          core: {
            urls: {
              brandOverride: 'https://www.example.com/example-brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                brandOverride: 'https://www.example.com/example-brand-light.css',
              },
            },
          },
        },
      };
      mergeConfig(config);
      const { result } = renderHook(() => useParagonThemeUrls());
      expect(result.current).toEqual(
        expect.objectContaining({
          core: {
            urls: {
              default: '//localhost:8080/local-core.min.css',
              brandOverride: 'https://www.example.com/example-brand-core.css',
            },
          },
          defaults: {
            light: 'light',
          },
          variants: {
            light: {
              urls: {
                default: '//localhost:8080/local-light.min.css',
                brandOverride: 'https://www.example.com/example-brand-light.css',
              },
            },
          },
        }),
      );
    });
  });
});
