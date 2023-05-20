import { GoogleAnalyticsLoader } from './index';

const googleAnalyticsId = 'test-key';

describe('GoogleAnalytics', () => {
  let body;
  let gaScriptSrc;
  let gaScriptGtag;
  let data;

  beforeEach(() => {
    window.googleAnalytics = [];
  });

  function loadGoogleAnalytics(scriptData) {
    const script = new GoogleAnalyticsLoader(scriptData);
    script.loadScript();
  }

  describe('with valid GOOGLE_ANALYTICS_4_ID', () => {
    beforeEach(() => {
      document.body.innerHTML = '<script id="stub" />';
      data = {
        config: {
          GOOGLE_ANALYTICS_4_ID: googleAnalyticsId,
        },
      };
      loadGoogleAnalytics(data);
      expect(global.googleAnalytics.invoked).toBe(true);
      body = document.body.innerHTML;
      gaScriptSrc = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      gaScriptGtag = `gtag('config', '${googleAnalyticsId}');`;
    });

    it('should initialize google analytics', () => {
      expect(body).toMatch(gaScriptSrc);
      expect(body).toMatch(gaScriptGtag);
    });

    it('should not invoke snippet twice', () => {
      loadGoogleAnalytics(data);

      expect(global.googleAnalytics.invoked).toBe(true);

      expect(body).toMatch(gaScriptSrc);
      expect(body).toMatch(gaScriptGtag);

      let count = (body.match(new RegExp(gaScriptSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      expect(count).toBe(1);

      count = (body.match(new RegExp(gaScriptGtag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      expect(count).toBe(1);
    });
  });

  describe('with invalid GOOGLE_ANALYTICS_ID', () => {
    beforeEach(() => {
      document.body.innerHTML = '<script id="stub" />';
      data = {
        config: {
          GOOGLE_ANALYTICS_4_ID: '',
        },
      };
      loadGoogleAnalytics(data);
      body = document.body.innerHTML;
      gaScriptSrc = 'https://www.googletagmanager.com/gtag/js?id=';
      gaScriptGtag = "gtag('config', '');";
      expect(global.googleAnalytics.invoked).toBeFalsy();
    });

    it('should not initialize google analytics', () => {
      expect(body).not.toMatch(gaScriptSrc);
      expect(body).not.toMatch(gaScriptGtag);
    });
  });
});
