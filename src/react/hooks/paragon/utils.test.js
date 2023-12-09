import { removeExistingLinks, getDefaultThemeVariant, handleVersionSubstitution } from './utils';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: true,
    media: query,
  })),
});

const mockGetItem = jest.fn();
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockGetItem,
  },
});

describe('removeExistingLinks', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should remove all the links in the DOM', () => {
    document.head.innerHTML = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/core.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@edx/brand@$2.0.0/dist/core.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css">
    `;

    removeExistingLinks(document.querySelectorAll('link'));
    expect(document.querySelectorAll('link').length).toBe(0);
  });
});

describe('getDefaultThemeVariant', () => {
  it('should return the theme variant according with system preference', () => {
    const variant = getDefaultThemeVariant({
      themeVariantDefaults: {
        light: 'light',
        dark: 'dark',
      },
      themeVariants: {
        light: {
          fileName: 'light.min.css',
        },
        dark: {
          fileName: 'dark.min.css',
        },
      },
    });
    expect(variant).toEqual({ metadata: { fileName: 'dark.min.css' }, name: 'dark' });
  });

  it('should return the theme variant according with local storage preference', () => {
    mockGetItem.mockImplementation(() => 'light');
    const variant = getDefaultThemeVariant({
      themeVariantDefaults: {
        light: 'light',
        dark: 'dark',
      },
      themeVariants: {
        light: {
          fileName: 'light.min.css',
        },
        dark: {
          fileName: 'dark.min.css',
        },
      },
    });
    expect(variant).toEqual({ metadata: { fileName: 'light.min.css' }, name: 'light' });
  });

  it('should return the theme variant configuration as default', () => {
    const variant = getDefaultThemeVariant({
      themeVariantDefaults: {
        light: 'light',
      },
      themeVariants: {
        light: {
          fileName: 'light.min.css',
        },
      },
    });
    expect(variant).toEqual({ metadata: { fileName: 'light.min.css' }, name: 'light' });
  });
});

describe('handleVersionSubstitution', () => {
  it('should substitude the paragon version to use', () => {
    const config = { localVersion: '21.1.1', wildcardKeyword: 'alpha', url: 'https://cdn.jsdelivr.net/npm/@edx/paragon@alpha/dist/core.min.css' };
    const newLink = handleVersionSubstitution(config);
    expect(newLink).toBe('https://cdn.jsdelivr.net/npm/@edx/paragon@21.1.1/dist/core.min.css');
  });
});
