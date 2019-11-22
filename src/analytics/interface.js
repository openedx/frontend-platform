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

export function configure(AnalyticsService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Analytics');
  service = new AnalyticsService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'AnalyticsService');
  return service;
}

export function sendTrackingLogEvent(eventName, properties) {
  return service.sendTrackingLogEvent(eventName, properties);
}

export function identifyAuthenticatedUser(userId, traits) {
  return service.identifyAuthenticatedUser(userId, traits);
}

export function identifyAnonymousUser(traits) {
  return service.identifyAnonymousUser(traits);
}

export function sendTrackEvent(eventName, properties) {
  return service.sendTrackEvent(eventName, properties);
}

export function sendPageEvent(category, name, properties) {
  return service.sendPageEvent(category, name, properties);
}

export function getAnalyticsService() {
  if (!service) {
    throw Error('You must first configure the analytics service.');
  }

  return service;
}

export function resetAnalyticsService() {
  service = null;
}
