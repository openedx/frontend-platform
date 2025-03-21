import { fallbackThemeUrl } from './utils';
import { mergeConfig } from '../../../config';

describe('fallbackThemeUrl', () => {
  it('if should return a relative url if the BASE_URL does not provide the protocol', () => {
    mergeConfig({
      BASE_URL: 'example.com',
    });

    expect(fallbackThemeUrl('my.css')).toBe('//example.com/my.css');
  });

  it('if should return a relative url if the BASE_URL is a relative url', () => {
    mergeConfig({
      BASE_URL: '//example.com',
    });
    expect(fallbackThemeUrl('my.css')).toBe('//example.com/my.css');
  });

  it('if should return a full url if the BASE_URL provides the protocol', () => {
    mergeConfig({
      BASE_URL: 'http://example.com',
    });
    expect(fallbackThemeUrl('my.css')).toBe('http://example.com/my.css');

    mergeConfig({
      BASE_URL: 'https://example.com',
    });
    expect(fallbackThemeUrl('my.css')).toBe('https://example.com/my.css');
  });

  it('if should return a full url base on the window location if BASE_URL is not defined', () => {
    mergeConfig({
      BASE_URL: 'http://example.com',
    });
    expect(fallbackThemeUrl('my.css')).toBe('http://example.com/my.css');

    mergeConfig({
      BASE_URL: '',
    });
    expect(fallbackThemeUrl('my.css')).toBe('http://localhost/my.css');
  });
});
