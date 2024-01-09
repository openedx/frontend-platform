// @ts-check
import PropTypes from 'prop-types';

/** @typedef {import('../config.js').ConfigDocument} ConfigDocument */

const optionsShape = {
  config: PropTypes.object.isRequired,
};

const serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired,
};

/** @type {LoggingService|null} */
let service = null;

/**
 *
 * @param {LoggingServiceConstructor} LoggingService
 * @param {{config: ConfigDocument}} options
 * @returns {LoggingService}
 */
export function configure(LoggingService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Logging');
  service = new LoggingService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'LoggingService');
  return service;
}

/**
 * Logs a message to the 'info' log level. Can accept custom attributes as a property of the error
 * object, or as an optional second parameter.
 *
 * @param {string|Error} infoStringOrErrorObject
 * @param {Object} [customAttributes]
 * @returns {void}
 */
export function logInfo(infoStringOrErrorObject, customAttributes) {
  return service?.logInfo(infoStringOrErrorObject, customAttributes);
}

/**
 * Logs a message to the 'error' log level.  Can accept custom attributes as a property of the error
 * object, or as an optional second parameter.
 *
 * @param {string|Error} errorStringOrObject
 * @param {Object} [customAttributes]
 * @returns {void}
 */
export function logError(errorStringOrObject, customAttributes) {
  return service?.logError(errorStringOrObject, customAttributes);
}

/**
 * Sets a custom attribute that will be included with all subsequent log messages.
 *
 * @param {string} name
 * @param {string|number|boolean|null} value
 * @returns {void}
 */
export function setCustomAttribute(name, value) {
  return service?.setCustomAttribute(name, value);
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
 * @typedef {Object} LoggingService
 * @property {(stringOrError: string|Error, customAttributes?: Object) => void} logError
 * @property {(stringOrError: string|Error, customAttributes?: Object) => void} logInfo
 * @property {typeof setCustomAttribute} setCustomAttribute
 */

/**
 * @typedef {new (options: {config: ConfigDocument}) => LoggingService} LoggingServiceConstructor
 */
