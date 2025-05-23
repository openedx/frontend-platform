import { getExternalLinkUrl, setConfig } from './config';

describe('getExternalLinkUrl', () => {
  afterEach(() => {
    // Reset config after each test to avoid cross-test pollution
    setConfig({});
  });

  it('should return the url passed in when customExternalUrls is not set', () => {
    setConfig({});
    const url = 'https://foo.example.com';
    expect(getExternalLinkUrl(url)).toBe(url);
  });

  it('should return the url passed in when customExternalUrls does not have the url mapping', () => {
    setConfig({
      customExternalUrls: {
        'https://bar.example.com': 'https://mapped.example.com',
      },
    });
    const url = 'https://foo.example.com';
    expect(getExternalLinkUrl(url)).toBe(url);
  });

  it('should return the mapped url when customExternalUrls has the url mapping', () => {
    const url = 'https://foo.example.com';
    const mappedUrl = 'https://mapped.example.com';
    setConfig({ customExternalUrls: { [url]: mappedUrl } });
    expect(getExternalLinkUrl(url)).toBe(mappedUrl);
  });

  it('should handle empty customExternalUrls object', () => {
    setConfig({ customExternalUrls: {} });
    const url = 'https://foo.example.com';
    expect(getExternalLinkUrl(url)).toBe(url);
  });

  it('should gaurd against empty string argument', () => {
    const fallbackResult = '#';
    setConfig({ customExternalUrls: { foo: 'bar' } });
    expect(getExternalLinkUrl(undefined)).toBe(fallbackResult);
  });

  it('should guard against non-string argument', () => {
    const fallbackResult = '#';
    setConfig({ customExternalUrls: { foo: 'bar' } });
    expect(getExternalLinkUrl(null)).toBe(fallbackResult);
    expect(getExternalLinkUrl(42)).toBe(fallbackResult);
  });

  it('should not throw if customExternalUrls is not an object', () => {
    setConfig({ customExternalUrls: null });
    const url = 'https://foo.example.com';
    expect(getExternalLinkUrl(url)).toBe(url);
    setConfig({ customExternalUrls: 42 });
    expect(getExternalLinkUrl(url)).toBe(url);
  });

  it('should work with multiple mappings', () => {
    setConfig({
      customExternalUrls: {
        'https://a.example.com': 'https://mapped-a.example.com',
        'https://b.example.com': 'https://mapped-b.example.com',
      },
    });
    expect(getExternalLinkUrl('https://a.example.com')).toBe(
      'https://mapped-a.example.com',
    );
    expect(getExternalLinkUrl('https://b.example.com')).toBe(
      'https://mapped-b.example.com',
    );
    expect(getExternalLinkUrl('https://c.example.com')).toBe(
      'https://c.example.com',
    );
  });
});
