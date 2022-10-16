/* eslint-disable no-console */
import {
  configure,
  getPrimaryLanguageSubtag,
  getLocale,
  getMessages,
  isRtl,
  handleRtl,
  getCookies,
  mergeMessages,
} from './lib';

jest.mock('universal-cookie');

describe('lib', () => {
  describe('configure', () => {
    let originalWarn = null;

    beforeEach(() => {
      originalWarn = console.warn;
      console.warn = jest.fn();
    });

    afterEach(() => {
      console.warn = originalWarn;
    });

    it('should not call console.warn in production', () => {
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          'es-419': {},
          de: {},
          'en-us': {},
        },
      });

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn about unexpected locales', () => {
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'development', // turn on warnings!
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          ar: {},
          'es-419': {},
          fr: {},
          'zh-cn': {},
          ca: {},
          he: {},
          id: {},
          'ko-kr': {},
          pl: {},
          'pt-br': {},
          ru: {},
          th: {},
          uk: {},
          uhoh: {}, // invalid locale
        },
      });

      expect(console.warn).toHaveBeenCalledWith('Unexpected locale: uhoh');
    });

    it('should warn about missing locales', () => {
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'development', // turn on warnings!
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {},
      });

      expect(console.warn).toHaveBeenCalledTimes(13);
      expect(console.warn).toHaveBeenCalledWith('Missing locale: ar');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: es-419');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: fr');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: zh-cn');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: ca');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: he');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: id');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: ko-kr');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: pl');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: pt-br');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: ru');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: th');
      expect(console.warn).toHaveBeenCalledWith('Missing locale: uk');
    });
  });

  describe('getPrimaryLanguageSubtag', () => {
    it('should work for primary language subtags', () => {
      expect(getPrimaryLanguageSubtag('en')).toEqual('en');
      expect(getPrimaryLanguageSubtag('ars')).toEqual('ars');
      expect(getPrimaryLanguageSubtag('a')).toEqual('a');
    });

    it('should work for longer language codes', () => {
      expect(getPrimaryLanguageSubtag('en-us')).toEqual('en');
      expect(getPrimaryLanguageSubtag('es-419')).toEqual('es');
      expect(getPrimaryLanguageSubtag('zh-hans-CN')).toEqual('zh');
    });
  });

  describe('getLocale', () => {
    beforeEach(() => {
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          'es-419': {},
          de: {},
          'en-us': {},
        },
      });
    });

    it('should return a supported locale as supplied', () => {
      expect(getLocale('es-419')).toEqual('es-419');
      expect(getLocale('en-us')).toEqual('en-us');
    });

    it('should return the supported primary language tag of a not-quite-supported locale', () => {
      expect(getLocale('de-de')).toEqual('de');
    });

    it('should return en if the locale is not supported at all', () => {
      expect(getLocale('oh-no')).toEqual('en');
    });

    it('should look up a locale in the language preference cookie if one was not supplied', () => {
      getCookies().get = jest.fn(() => 'es-419');
      expect(getLocale()).toEqual('es-419');

      getCookies().get = jest.fn(() => 'pl');
      expect(getLocale()).toEqual('en');

      getCookies().get = jest.fn(() => 'de-bah');
      expect(getLocale()).toEqual('de');
    });
    it('should fallback to the browser locale if the cookie does not exist', () => {
      getCookies().get = jest.fn(() => null);
      expect(getLocale()).toEqual(global.navigator.language.toLowerCase());
    });
  });

  describe('getMessages', () => {
    beforeEach(() => {
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          'es-419': { message: 'es-hah' },
          de: { message: 'de-hah' },
          'en-us': { message: 'en-us-hah' },
        },
      });

      getCookies().get = jest.fn(() => 'es-419'); // Means the cookie will be set to es-419
    });

    it('should return the messages for the provided locale', () => {
      expect(getMessages('en-us').message).toEqual('en-us-hah');
    });

    it('should return the messages for the preferred locale if no argument is passed', () => {
      expect(getMessages().message).toEqual('es-hah');
    });
  });

  describe('isRtl', () => {
    it('should be true for RTL languages', () => {
      expect(isRtl('ar')).toBe(true);
      expect(isRtl('he')).toBe(true);
      expect(isRtl('fa')).toBe(true);
      expect(isRtl('fa-ir')).toBe(true);
      expect(isRtl('ur')).toBe(true);
    });

    it('should be false for anything else', () => {
      expect(isRtl('en')).toBe(false);
      expect(isRtl('blah')).toBe(false);
      expect(isRtl('es-419')).toBe(false);
      expect(isRtl('de')).toBe(false);
      expect(isRtl('ru')).toBe(false);
    });
  });

  describe('handleRtl', () => {
    let setAttribute;
    beforeEach(() => {
      setAttribute = jest.fn();

      global.document.getElementsByTagName = jest.fn(() => [
        {
          setAttribute,
        },
      ]);
    });

    it('should do the right thing for non-RTL languages', () => {
      getCookies().get = jest.fn(() => 'es-419');
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          'es-419': { message: 'es-hah' },
        },
      });

      handleRtl();
      expect(setAttribute).toHaveBeenCalledWith('dir', 'ltr');
    });

    it('should do the right thing for RTL languages', () => {
      getCookies().get = jest.fn(() => 'ar');
      configure({
        loggingService: { logError: jest.fn() },
        config: {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        messages: {
          ar: { message: 'ar-hah' },
        },
      });

      handleRtl();
      expect(setAttribute).toHaveBeenCalledWith('dir', 'rtl');
    });
  });
});

describe('mergeMessages', () => {
  it('should merge objects from an array', () => {
    const result = mergeMessages([{ foo: 'bar' }, { buh: 'baz' }, { gah: 'wut' }]);
    expect(result).toEqual({
      foo: 'bar',
      buh: 'baz',
      gah: 'wut',
    });
  });

  it('should merge nested objects from an array', () => {
    const messages = [
      {
        en: { hello: 'hello' },
        es: { hello: 'hola' },
      },
      {
        en: { goodbye: 'goodbye' },
        es: { goodbye: 'adiós' },
      },
    ];

    const result = mergeMessages(messages);
    expect(result).toEqual({
      en: {
        hello: 'hello',
        goodbye: 'goodbye',
      },
      es: {
        hello: 'hola',
        goodbye: 'adiós',
      },
    });
  });

  it('should return an empty object if no messages', () => {
    expect(mergeMessages(undefined)).toEqual({});
    expect(mergeMessages(null)).toEqual({});
    expect(mergeMessages([])).toEqual({});
  });
});
