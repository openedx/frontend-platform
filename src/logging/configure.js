import PropTypes from 'prop-types';

let service = null;

export function configure(LoggingService, services) {
  service = new LoggingService(services);

  PropTypes.checkPropTypes({
    logInfo: PropTypes.func.isRequired,
    logError: PropTypes.func.isRequired,
  }, service, 'property', 'LoggingService');
}

export function logInfo(message, customAttributes) {
  return service.logInfo(message, customAttributes);
}

export function logError(error, customAttributes) {
  return service.logError(error, customAttributes);
}

export function getLoggingService() {
  if (!service) {
    throw Error('You must first configure the logging service.');
  }
  return service;
}

export function resetLoggingService() {
  service = null;
}
