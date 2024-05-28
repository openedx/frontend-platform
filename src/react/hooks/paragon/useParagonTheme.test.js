import { act, renderHook } from '@testing-library/react-hooks';

import { getConfig } from '../../../config';

import useParagonTheme from './useParagonTheme';

jest.mock('../../../config', () => ({
  ...jest.requireActual('.../../../config'),
  getConfig: jest.fn().mockReturnValue({
    PARAGON_THEME_URLS: {
      core: {
        urls: {
          default: 'core.css',
        },
      },
      defaults: {
        light: 'light',
        dark: 'dark',
      },
      variants: {
        light: {
          urls: {
            default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/light.min.css',
          },
        },
        dark: {
          urls: {
            default: 'https://cdn.jsdelivr.net/npm/@edx/paragon@$21.0.0/dist/dark.min.css',
          },
        },
      },
    },
  }),
}));

let mockMediaQueryListEvent;
const mockAddEventListener = jest.fn((dispatch, fn) => fn(mockMediaQueryListEvent));
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  })),
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
  },
});

describe('useParagonTheme', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    mockMediaQueryListEvent = { matches: true };
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    window.localStorage.getItem.mockClear();
  });

  it('should configure theme variants according with system preference and add the change event listener', () => {
    const { unmount } = renderHook(() => useParagonTheme(getConfig()));
    const themeLinks = document.head.querySelectorAll('link');
    const darkLink = document.head.querySelector('link[data-paragon-theme-variant="dark"]');
    const lightLink = document.head.querySelector('link[data-paragon-theme-variant="light"]');
    act(() => { themeLinks.forEach((link) => link.onload()); });

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockAddEventListener).toHaveBeenCalled();
    expect(darkLink.rel).toBe('stylesheet');
    expect(lightLink.rel).toBe('alternate stylesheet');
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('should configure theme variants according with user preference if is defined (localStorage)', () => {
    window.localStorage.getItem.mockReturnValue('light');
    const { unmount } = renderHook(() => useParagonTheme(getConfig()));
    const themeLinks = document.head.querySelectorAll('link');
    const darkLink = document.head.querySelector('link[data-paragon-theme-variant="dark"]');
    const lightLink = document.head.querySelector('link[data-paragon-theme-variant="light"]');
    act(() => { themeLinks.forEach((link) => link.onload()); });

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockAddEventListener).toHaveBeenCalled();

    expect(darkLink.rel).toBe('alternate stylesheet');
    expect(lightLink.rel).toBe('stylesheet');
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });
});
