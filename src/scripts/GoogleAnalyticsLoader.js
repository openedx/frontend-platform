/**
 * @implements {GoogleAnalyticsLoader}
 * @memberof module:GoogleAnalytics
 */
class GoogleAnalyticsLoader {
  constructor({ config }) {
    this.analyticsId = config.GOOGLE_ANALYTICS_4_ID;
  }

  loadScript() {
    if (!this.analyticsId) {
      return;
    }

    global.googleAnalytics = global.googleAnalytics || [];
    const { googleAnalytics } = global;

    // If the snippet was invoked do nothing.
    if (googleAnalytics.invoked) {
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    googleAnalytics.invoked = true;

    googleAnalytics.load = (key, options) => {
      const scriptSrc = document.createElement('script');
      scriptSrc.type = 'text/javascript';
      scriptSrc.async = true;
      scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;

      const scriptGtag = document.createElement('script');
      scriptGtag.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${key}');
      `;

      // Insert our scripts next to the first script element.
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(scriptSrc, first);
      first.parentNode.insertBefore(scriptGtag, first);
      googleAnalytics._loadOptions = options; // eslint-disable-line no-underscore-dangle
    };

    // Load GoogleAnalytics with your key.
    googleAnalytics.load(this.analyticsId);
  }
}

export default GoogleAnalyticsLoader;
