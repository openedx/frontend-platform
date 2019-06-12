import formurlencoded from 'form-urlencoded';
import { snakeCaseObject } from './utils';

let config = {};
let hasIdentifyBeenCalled = false;

/**
 * Configures analytics module for an application.
 * Note: this is using a module method, rather than a class+constructor, so functions
 * can easily be passed around without this-binding concerns.
 */
function configureAnalytics(newConfig) {
  hasIdentifyBeenCalled = false;
  config = {
    loggingService: newConfig.loggingService,
    authApiClient: newConfig.authApiClient,
    analyticsApiBaseUrl: newConfig.analyticsApiBaseUrl,
  };
}

function getTrackingLogApiBaseUrl() {
  return `${config.analyticsApiBaseUrl}/event`;
}

function getAuthApiClient() {
  if (!config.authApiClient) {
    throw Error('You must configure the authApiClient.');
  }
  return config.authApiClient;
}

function getLoggingService() {
  if (!config.loggingService) {
    throw Error('You must configure the loggingService.');
  }
  return config.loggingService;
}

/**
 * Checks that identify was first called.  Otherwise, logs error.
 */
function checkIdentifyCalled() {
  const loggingService = getLoggingService(); // verifies configuration early
  if (!hasIdentifyBeenCalled) {
    loggingService.logError('Identify must be called before other tracking events.');
  }
}

/**
 * Logs events to tracking log and downstream.
 * For tracking log event documentation, see
 * https://openedx.atlassian.net/wiki/spaces/AN/pages/13205895/Event+Design+and+Review+Process
 * @param eventName (event_type on backend, but named to match Segment api)
 * @param properties (event on backend, but named properties to match Segment api)
 * @returns The promise returned by apiClient.post.
 */
function sendTrackingLogEvent(eventName, properties) {
  const snakeEventData = snakeCaseObject(properties, { deep: true });
  const serverData = {
    event_type: eventName,
    event: JSON.stringify(snakeEventData),
    page: window.location.href,
  };
  const loggingService = getLoggingService(); // verifies configuration early
  return getAuthApiClient().post(
    getTrackingLogApiBaseUrl(),
    formurlencoded(serverData),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  ).catch((error) => {
    loggingService.logAPIErrorResponse(error);
  });
}

/**
 * Send identify call to Segment.
 * @param userId
 * @param traits (optional)
 */
function identifyAuthenticatedUser(userId, traits) {
  window.analytics.identify(userId, traits);
  hasIdentifyBeenCalled = true;
}

/**
 * Send anonymous identify call to Segment's identify.
 * @param traits (optional)
 */
function identifyAnonymousUser(traits) {
  window.analytics.identify(traits);
  hasIdentifyBeenCalled = true;
}

/**
 * Sends a track event to Segment and downstream.
 * Note: For links and forms, you should use trackLink and trackForm instead.
 * @param eventName
 * @param properties (optional)
 */
function sendTrackEvent(eventName, properties) {
  checkIdentifyCalled();
  window.analytics.track(eventName, properties);
}

/**
 * Sends a page event to Segment and downstream.
 * @param category (optional) Name is required to pass a category.
 * @param name (optional) If only one string arg provided, assumed to be name.
 * @param properties (optional)
 */
function sendPageEvent(category, name, properties) {
  checkIdentifyCalled();
  window.analytics.page(category, name, properties);
}

export {
  configureAnalytics,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
};
