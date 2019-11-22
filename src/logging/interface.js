import PropTypes from 'prop-types';

const optionsShape = {
  config: PropTypes.object.isRequired,
};

const serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired,
};

let service = null;

export function configure(LoggingService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Logging');
  service = new LoggingService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'LoggingService');
  return service;
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
