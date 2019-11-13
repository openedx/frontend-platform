export default class SegmentAnalyticsService {
  static hasIdentifyBeenCalled = false;

  constructor({ loggingService, httpClient, analyticsBaseUrl, apiKey }) {
    this.loggingService = loggingService;
    this.httpClient = httpClient;
    this.analyticsBaseUrl = analyticsBaseUrl;
    this.segmentKey = apiKey;
  }

  // The code in this function is from Segment's website, with the following
  // update: - Takes the segment key as a parameter (
  // https://segment.com/docs/sources/website/analytics.js/quickstart/
  intialize() {
    // Create a queue, but don't obliterate an existing one!
    var analytics = window.analytics = window.analytics || [];

    // If the real analytics.js is already on the page return.
    if (analytics.initialize) return;

    // If the snippet was invoked already show an error.
    if (analytics.invoked) {
      if (window.console && console.error) {
        console.error('Segment snippet included twice.');
      }
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    analytics.invoked = true;

    // A list of the methods in Analytics.js to stub.
    analytics.methods = [
      'trackSubmit',
      'trackClick',
      'trackLink',
      'trackForm',
      'pageview',
      'identify',
      'reset',
      'group',
      'track',
      'ready',
      'alias',
      'debug',
      'page',
      'once',
      'off',
      'on'
    ];

    // Define a factory to create stubs. These are placeholders
    // for methods in Analytics.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    analytics.factory = function(method){
      return function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        analytics.push(args);
        return analytics;
      };
    };

    // For each of our methods, generate a queueing stub.
    for (var i = 0; i < analytics.methods.length; i++) {
      var key = analytics.methods[i];
      analytics[key] = analytics.factory(key);
    }

    // Define a method to load Analytics.js from our CDN,
    // and that will be sure to only ever load it once.
    analytics.load = function(key, options){
      // Create an async script element based on your key.
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.segment.com/analytics.js/v1/'
        + key + '/analytics.min.js';

      // Insert our script next to the first script element.
      var first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
      analytics._loadOptions = options;
    };

    // Add a version to keep track of what's in the wild.
    analytics.SNIPPET_VERSION = '4.1.0';

    // Load Analytics.js with your key, which will automatically
    // load the tools you've enabled for your account. Boosh!
    analytics.load(this.segmentKey);
  }

  /**
   * Send identify call to Segment.
   * @param userId
   * @param traits (optional)
   */
  identifyAuthenticatedUser(userId, traits) {
    if (!userId) {
      throw new Error('UserId is required for identifyAuthenticatedUser.');
    }
    window.analytics.identify(userId, traits);
    this.hasIdentifyBeenCalled = true;
  }

  /**
   * Send anonymous identify call to Segment's identify.
   * @param traits (optional)
   */
  identifyAnonymousUser(traits) {
    window.analytics.identify(traits);
    this.hasIdentifyBeenCalled = true;
  }

  /**
   * Sends a track event to Segment and downstream.
   * Note: For links and forms, you should use trackLink and trackForm instead.
   * @param eventName
   * @param properties (optional)
   */
  sendTrackEvent(eventName, properties) {
    checkIdentifyCalled();
    window.analytics.track(eventName, properties);
  }

  /**
   * Sends a page event to Segment and downstream.
   * @param category (optional) Name is required to pass a category.
   * @param name (optional) If only one string arg provided, assumed to be name.
   * @param properties (optional)
   */
  sendPageEvent(category, name, properties) {
    checkIdentifyCalled();
    window.analytics.page(category, name, properties);
  }
}
