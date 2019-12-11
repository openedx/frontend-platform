import formurlencoded from 'form-urlencoded';
import { snakeCaseObject } from '../utils';

/**
 * @implements {AnalyticsService}
 * @memberof module:Analytics
 */
class SegmentAnalyticsService {
  static hasIdentifyBeenCalled = false;

  constructor({ httpClient, loggingService, config }) {
    this.loggingService = loggingService;
    this.httpClient = httpClient;
    this.trackingLogApiUrl = `${config.LMS_BASE_URL}/event`;
    this.segmentKey = config.SEGMENT_KEY;
    this.initialize();
  }

  // The code in this function is from Segment's website, with the following
  // update: - Takes the segment key as a parameter (
  // https://segment.com/docs/sources/website/analytics.js/quickstart/
  initialize() {
    // Create a queue, but don't obliterate an existing one!
    global.analytics = global.analytics || [];
    const { analytics } = global;

    // If the real analytics.js is already on the page return.
    if (analytics.initialize) return;

    // If the snippet was invoked do nothing.
    if (analytics.invoked) {
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
      'on',
    ];

    // Define a factory to create stubs. These are placeholders
    // for methods in Analytics.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    analytics.factory = method => ((...args) => {
      args.unshift(method);
      analytics.push(args);
      return analytics;
    });

    // For each of our methods, generate a queueing stub.
    analytics.methods.forEach((key) => {
      analytics[key] = analytics.factory(key);
    });

    // Define a method to load Analytics.js from our CDN,
    // and that will be sure to only ever load it once.
    analytics.load = (key, options) => {
      // Create an async script element based on your key.
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`;

      // Insert our script next to the first script element.
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(script, first);
      analytics._loadOptions = options; // eslint-disable-line no-underscore-dangle
    };

    // Add a version to keep track of what's in the wild.
    analytics.SNIPPET_VERSION = '4.1.0';

    // Load Analytics.js with your key, which will automatically
    // load the tools you've enabled for your account. Boosh!
    analytics.load(this.segmentKey);
  }

  /**
   * Checks that identify was first called.  Otherwise, logs error.
   *
   */
  checkIdentifyCalled() {
    if (!this.hasIdentifyBeenCalled) {
      this.loggingService.logError('Identify must be called before other tracking events.');
    }
  }

  /**
   * Logs events to tracking log and downstream.
   * For tracking log event documentation, see
   * https://openedx.atlassian.net/wiki/spaces/AN/pages/13205895/Event+Design+and+Review+Process
   *
   * @param {string} eventName (event_type on backend, but named to match Segment api)
   * @param {Object} properties (event on backend, but named properties to match Segment api)
   * @returns {Promise} The promise returned by HttpClient.post.
   */
  sendTrackingLogEvent(eventName, properties) {
    const snakeEventData = snakeCaseObject(properties, { deep: true });
    const serverData = {
      event_type: eventName,
      event: JSON.stringify(snakeEventData),
      page: global.location.href,
    };
    return this.httpClient.post(
      this.trackingLogApiUrl,
      formurlencoded(serverData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ).catch((error) => {
      this.loggingService.logError(error);
    });
  }

  /**
   * * Send identify call to Segment.
   *
   * @param {string} userId
   * @param {*} [traits]
   */
  identifyAuthenticatedUser(userId, traits) {
    if (!userId) {
      throw new Error('UserId is required for identifyAuthenticatedUser.');
    }
    global.analytics.identify(userId, traits);
    this.hasIdentifyBeenCalled = true;
  }

  /**
   * Send anonymous identify call to Segment's identify.
   *
   * @param {*} [traits]
   */
  identifyAnonymousUser(traits) {
    global.analytics.identify(traits);
    this.hasIdentifyBeenCalled = true;
  }

  /**
   * Sends a track event to Segment and downstream.
   * Note: For links and forms, you should use trackLink and trackForm instead.
   *
   * @param {*} eventName
   * @param {*} [properties]
   */
  sendTrackEvent(eventName, properties) {
    this.checkIdentifyCalled();
    global.analytics.track(eventName, properties);
  }

  /**
   * Sends a page event to Segment and downstream.
   *
   * @param {*} [name] If only one string arg provided, assumed to be name.
   * @param {*} [category] Name is required to pass a category.
   * @param {*} [properties]
   */
  sendPageEvent(category, name, properties) {
    this.checkIdentifyCalled();
    global.analytics.page(category, name, properties);
  }
}

export default SegmentAnalyticsService;
