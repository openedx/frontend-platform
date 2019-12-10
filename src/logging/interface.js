/**
 * @module frontend-platform/logging
 */

import PropTypes from 'prop-types';

const optionsShape = {
  config: PropTypes.object.isRequired,
};

const serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired,
};

let service = null;

/**
 *
 */
export function configure(LoggingService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Logging');
  service = new LoggingService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'LoggingService');
  return service;
}

/**
 * Logs a message to the 'info' log level.
 *
 * @param {string} message
 * @param {Object} [customAttributes={}]
 */
export function logInfo(message, customAttributes) {
  return service.logInfo(message, customAttributes);
}

/**
 * Logs a message to the 'error' log level.  Can accept custom attributes as a property of the error
 * object, or as an optional second parameter.
 *
 * @param {string|Error} error
 * @param {Object} [error.customAttributes={}]
 * @param {Object} [customAttributes={}]
 */
export function logError(error, customAttributes) {
  return service.logError(error, customAttributes);
}

/**
 *
 * @throws {Error} Thrown if the logging service has not yet been configured via {@link configure}.
 * @returns {LoggingService}
 */
export function getLoggingService() {
  if (!service) {
    throw Error('You must first configure the logging service.');
  }
  return service;
}

/**
 * Sets the configured logging service back to null.
 *
 */
export function resetLoggingService() {
  service = null;
}

/**
 * @name LoggingService
 * @interface
 * @borrows logError as logError
 * @borrows logInfo as logInfo
 */
