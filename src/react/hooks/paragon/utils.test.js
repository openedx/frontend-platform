import { fallbackThemeUrl } from './utils';

describe('fallbackThemeUrl', () => {
  const originalWindowLocation = window.location;
  const mockWindowLocationOrigin = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        get origin() {
          return mockWindowLocationOrigin();
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', originalWindowLocation);
  });

  it('should return a full url based on the window location', () => {
    mockWindowLocationOrigin.mockReturnValue('http://example.com');

    expect(fallbackThemeUrl('my.css')).toBe('http://example.com/my.css');
  });
});
