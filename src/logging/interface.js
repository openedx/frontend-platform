import PropTypes from 'prop-types';

const configShape = {
  configService: PropTypes.shape({
    getConfig: PropTypes.func.isRequired,
  }).isRequired,
};

const serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired,
};

let service = null;

export function configure(LoggingService, config) {
  PropTypes.checkPropTypes(configShape, config, 'property', 'Logging');
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'LoggingService');
  service = new LoggingService(config);
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
