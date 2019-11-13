import PropTypes from 'prop-types';

const configShape = {
  analyticsApiBaseUrl: PropTypes.string.isRequired,
  trackingLogApiBaseUrl: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
  httpClient: PropTypes.shape({
    post: PropTypes.func.isRequired,
  }).isRequired,
};

const serviceShape = {
  sendTrackingLogEvent: PropTypes.func.isRequired,
  identifyAuthenticatedUser: PropTypes.func.isRequired,
  identifyAnonymousUser: PropTypes.func.isRequired,
  sendTrackEvent: PropTypes.func.isRequired,
};

let service;

function configure(AnalyticsService, config) {
  PropTypes.checkPropTypes(configShape, config, 'config', 'Analytics');
  service = new AnalyticsService(config);
  PropTypes.checkPropTypes(serviceShape, service, 'service', 'AnalyticsService');
}

function sendTrackingLogEvent(eventName, properties) {
  return service.sendTrackingLogEvent(eventName, properties);
}

function identifyAuthenticatedUser(userId, traits) {
  return service.identifyAuthenticatedUser(userId, traits);
}

function identifyAnonymousUser(traits) {
  return service.identifyAnonymousUser(traits);
}

function sendTrackEvent(eventName, properties) {
  return service.sendTrackEvent(eventName, properties);
}

function sendPageEvent(category, name, properties) {
  return service.sendPageEvent(category, name, properties);
}

export {
  configure,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
};
