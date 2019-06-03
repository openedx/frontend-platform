import {
  // eslint-disable-line import/first
  configure,
  getPrimaryLanguageSubtag,
  getLocale,
  getMessages,
  isRtl,
  handleRtl,
  getCookies,
} from './lib';

jest.mock('universal-cookie');

describe('lib', () => {
  describe('configure', () => {
    let warnSpy = null;

    beforeEach(() => {
      warnSpy = spyOn(console, 'warn');
    });

    it('should not call console.warn in production', () => {
      configure(
        {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {
          'es-419': {},
          de: {},
          'en-us': {},
        },
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should warn about unexpected locales', () => {
      configure(
        {
          ENVIRONMENT: 'development', // turn on warnings!
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {
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
      );

      expect(warnSpy).toHaveBeenCalledWith('Unexpected locale: uhoh');
    });

    it('should warn about missing locales', () => {
      configure(
        {
          ENVIRONMENT: 'development', // turn on warnings!
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {},
      );

      expect(warnSpy).toHaveBeenCalledTimes(13);
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: ar');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: es-419');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: fr');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: zh-cn');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: ca');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: he');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: id');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: ko-kr');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: pl');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: pt-br');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: ru');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: th');
      expect(warnSpy).toHaveBeenCalledWith('Missing locale: uk');
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
    it('should throw an error if called before configure has been called with messages', () => {
      // For testing purposes, sets messages back to null, emulating a situation where
      // configure wasn't called.
      configure(
        {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        null,
      );
      expect(() => {
        getLocale();
      }).toThrowError('getLocale called before configuring i18n. Call configure with messages first.');
    });

    describe('when configured', () => {
      beforeEach(() => {
        configure(
          {
            ENVIRONMENT: 'production',
            LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
          },
          {
            'es-419': {},
            de: {},
            'en-us': {},
          },
        );
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
  });

  describe('getMessages', () => {
    beforeEach(() => {
      configure(
        {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {
          'es-419': { message: 'es-hah' },
          de: { message: 'de-hah' },
          'en-us': { message: 'en-us-hah' },
        },
      );

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
    /* WARNING:
     *
     * These handleRtl tests may pollute the document used by other tests in this file.
     * Right now it doesn't matter, but if WEIRD STUFF starts happening, we may need to figure
     * out how to properly mock global.document using jest and jsdom - I couldn't figure out how.
     * Some of the properties are read-only, so this setup is a bit of a hack.
     */

    let setAttribute;
    let removeAttribute;

    beforeAll(() => {
      // Allow us to modify stylesheets in these tests.  The styleSheets object cannot normally
      // be set.
      Object.defineProperty(global.document, 'styleSheets', {
        value: [
          { disabled: false, href: null }, // Should be ignored because it has no href
          { disabled: false, href: 'real href' },
          { disabled: false, href: 'real href' },
          { disabled: false, href: null }, // Should be ignored because it has no href
        ],
      });
    });

    beforeEach(() => {
      setAttribute = jest.fn();
      removeAttribute = jest.fn();

      global.document.getElementsByTagName = jest.fn(() => [
        {
          setAttribute,
          removeAttribute,
        },
      ]);

      // We use the same two stylesheets for each test, so just set them back to their default
      // disabled-ness.
      global.document.styleSheets[0].disabled = false;
      global.document.styleSheets[1].disabled = false;
    });

    it('should do the right thing for non-RTL languages', () => {
      getCookies().get = jest.fn(() => 'es-419');
      configure(
        {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {
          'es-419': { message: 'es-hah' },
        },
      );

      handleRtl();
      expect(setAttribute).not.toHaveBeenCalled();
      expect(removeAttribute).toHaveBeenCalledWith('dir');
      expect(global.document.styleSheets[1].disabled).toBe(false);
      expect(global.document.styleSheets[2].disabled).toBe(true);
    });

    it('should do the right thing for RTL languages', () => {
      getCookies().get = jest.fn(() => 'ar');
      configure(
        {
          ENVIRONMENT: 'production',
          LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
        },
        {
          ar: { message: 'ar-hah' },
        },
      );

      handleRtl();
      expect(setAttribute).toHaveBeenCalledWith('dir', 'rtl');
      expect(removeAttribute).not.toHaveBeenCalled();
      expect(global.document.styleSheets[1].disabled).toBe(true);
      expect(global.document.styleSheets[2].disabled).toBe(false);
    });
  });
});
