/**
 * @implements {GoogleAnalyticsService}
 * @memberof module:GoogleAnalytics
 */
class GoogleAnalyticsService {
  constructor({ config }) {
    this.analyticsId = config.GOOGLE_ANALYTICS_ID;
    this.hasIdentifyBeenCalled = false;
    this.segmentInitialized = false;

    if (this.analyticsId) {
      this.initializeSegment();
    }
  }

  // The code in this function is from Segment's website, with a few updates:
  // - It uses the analyticsId from the GoogleAnalyticsService instance.
  // - It also saves a "segmentInitialized" variable on the GoogleAnalyticsService instance so
  //   that the service can keep track of its own initialization state.
  initializeSegment() {
    // Create a queue, but don't obliterate an existing one!
    global.googleAnalytics = global.googleAnalytics || [];
    const { googleAnalytics } = global;

    // If the real analytics.js is already on the page return.
    if (googleAnalytics.initialize) {
      this.segmentInitialized = true;
      return;
    }

    // If the snippet was invoked do nothing.
    if (googleAnalytics.invoked) {
      this.segmentInitialized = true;
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    googleAnalytics.invoked = true;

    // Define a method to load Analytics.js from our CDN,
    // and that will be sure to only ever load it once.
    googleAnalytics.load = (key, options) => {
      // Create an async script element based on your key.
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onerror = () => {
        this.segmentInitialized = false;
        const event = new Event('segmentFailed');
        document.dispatchEvent(event);
      };
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${key}');
      `;

      // Insert our script next to the first script element.
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
      first.parentNode.insertBefore(script2, first);
      googleAnalytics._loadOptions = options; // eslint-disable-line no-underscore-dangle

      this.segmentInitialized = true;
    };

    // Load Analytics.js with your key, which will automatically
    // load the tools you've enabled for your account. Boosh!
    googleAnalytics.load(this.analyticsId);
  }
}

export default GoogleAnalyticsService;
