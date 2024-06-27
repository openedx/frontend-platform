import { GoogleTagManagerLoader } from './index';

const gtmId = 'test-key';

describe('GoogleTagManager', () => {
  let gtmScriptId;
  let firstScriptTag;

  beforeEach(() => {
    window.googleTagManager = [];
    document.head.innerHTML = '<title>Testing</title><meta charset="utf-8" /><script id="testing"></script>';
    document.body.innerHTML = '<script id="stub" />';
    gtmScriptId = `<script src="https://www.googletagmanager.com/gtm.js?id=${gtmId}" />`;
  });

  function loadGoogleTagManager(scriptData) {
    const script = new GoogleTagManagerLoader(scriptData);
    script.loadScript();
  }

  function setupConfigData(configVars) {
    const data = {
      config: {
        ...configVars,
      },
    };
    return data;
  }

  describe('with valid GOOGLE_TAG_MANAGER_ID', () => {
    let data;
    beforeEach(() => {
      data = setupConfigData({ GOOGLE_TAG_MANAGER_ID: gtmId });
      loadGoogleTagManager(data);
      expect(global.googleTagManager.invoked)
        .toBe(true);
    });

    it('should initialize google tag manager', () => {
      expect(document.head.children[0])
        .toContainHTML('<title>Testing</title>');
      // The first inserted script tag should be the first script tag
      // eslint-disable-next-line prefer-destructuring
      firstScriptTag = document.head.getElementsByTagName('script')[0];
      expect(firstScriptTag)
        .toContainHTML(gtmScriptId);
    });

    it('should not initialize google tag manager twice', () => {
      const scriptCountPre = document.head.getElementsByTagName('script').length;
      loadGoogleTagManager(data);
      const scriptCountPost = document.head.getElementsByTagName('script').length;
      expect(scriptCountPost)
        .toEqual(scriptCountPre);
    });
  });

  describe.each([
    {
      tag: 'PREVIEW',
      value: 'preview-xyz',
      queryParam: 'gtm_preview=preview-xyz',
    },
    {
      tag: 'AUTH',
      value: 'auth-xyz',
      queryParam: 'gtm_auth=auth-xyz',
    },
    {
      tag: 'ADDNL_ARGS',
      value: 'gtm_cookies_win=x',
      queryParam: 'gtm_cookies_win=x',
    },
    {
      tag: 'ADDNL_ARGS',
      value: '&gtm_cookies_win=x',
      queryParam: 'gtm_cookies_win=x',
    },
  ])('with other valid Google Tag Manager options', ({
    tag,
    value,
    queryParam,
  }) => {
    it(`should correctly handle the GOOGLE_TAG_MANAGER_${tag} option`, () => {
      const data = setupConfigData({
        GOOGLE_TAG_MANAGER_ID: gtmId,
        [`GOOGLE_TAG_MANAGER_${tag}`]: value,
      });
      loadGoogleTagManager(data);
      // eslint-disable-next-line prefer-destructuring
      firstScriptTag = document.head.getElementsByTagName('script')[0];
      const scriptURL = new URL(firstScriptTag.src);
      // Options shouldn't get merged.
      expect(scriptURL.searchParams.size)
        .toBe(2);
      expect(scriptURL.search)
        .toContain(queryParam);
    });
  });

  describe('with invalid GOOGLE_TAG_MANAGER_ID', () => {
    beforeEach(() => {
      const data = setupConfigData({ GOOGLE_TAG_MANAGER_ID: '' });
      loadGoogleTagManager(data);
      expect(global.googleTagManager.invoked)
        .toBeFalsy();
    });

    it('should not initialize google analytics', () => {
      Array.from(document.head.getElementsByTagName('script')).forEach(scriptNode => {
        expect(scriptNode)
          .not
          .toContainHTML(gtmScriptId);
      });
    });
  });
});
