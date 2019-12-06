import PropTypes from 'prop-types';

const optionsShape = {
  config: PropTypes.object.isRequired,
  httpClient: PropTypes.shape({
    post: PropTypes.func.isRequired,
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
};

const serviceShape = {
  sendTrackingLogEvent: PropTypes.func.isRequired,
  identifyAuthenticatedUser: PropTypes.func.isRequired,
  identifyAnonymousUser: PropTypes.func.isRequired,
  sendTrackEvent: PropTypes.func.isRequired,
  sendPageEvent: PropTypes.func.isRequired,
};

let service;

/**
 *
 * @memberof Analytics
 * @param {class} AnalyticsService
 * @param {*} options
 * @returns {AnalyticsService}
 */
export function configure(AnalyticsService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Analytics');
  service = new AnalyticsService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'AnalyticsService');
  return service;
}

/**
 *
 * @memberof Analytics
 * @param {*} eventName
 * @param {*} properties
 * @returns {Promise}
 */
export function sendTrackingLogEvent(eventName, properties) {
  return service.sendTrackingLogEvent(eventName, properties);
}

/**
 *
 *
 * @param {*} userId
 * @param {*} traits
 * @memberof Analytics
 */
export function identifyAuthenticatedUser(userId, traits) {
  service.identifyAuthenticatedUser(userId, traits);
}

/**
 *
 *
 * @param {*} traits
 * @memberof Analytics
 */
export function identifyAnonymousUser(traits) {
  service.identifyAnonymousUser(traits);
}

/**
 *
 *
 * @param {*} eventName
 * @param {*} properties
 * @memberof Analytics
 */
export function sendTrackEvent(eventName, properties) {
  service.sendTrackEvent(eventName, properties);
}

/**
 *
 *
 * @param {*} category
 * @param {*} name
 * @param {*} properties
 * @memberof Analytics
 */
export function sendPageEvent(category, name, properties) {
  service.sendPageEvent(category, name, properties);
}

/**
 *
 *
 * @returns {AnalyticsService}
 * @memberof Analytics
 */
export function getAnalyticsService() {
  if (!service) {
    throw Error('You must first configure the analytics service.');
  }

  return service;
}

/**
 *
 * @memberof Analytics
 */
export function resetAnalyticsService() {
  service = null;
}
