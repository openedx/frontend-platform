/**
 * #### Import members from **@edx/frontend-platform/logging**
 *
 * Contains a shared interface for logging information. (The default implementation is in
 * NewRelicLoggingService.js.) When in development mode, all messages will instead be sent to the console.
 *
 * The `initialize` function performs much of the logging configuration for you.  If, however,
 * you're not using the `initialize` function, logging (via New Relic) can be configured via:
 *
 * ```
 * import { configure, NewRelicLoggingService, logInfo, logError } from '@edx/frontend-platform/logging';
 * import { geConfig } from '@edx/frontend-platform';
 *
 * configureLogging(NewRelicLoggingService, {
 *   config: getConfig(),
 * });
 *
 * logInfo('Just so you know...');
 * logInfo(new Error('Unimportant error'), { type: 'unimportant' });
 * logError('Uhoh!');
 * logError(new Error('Uhoh error!'));
 * ```
 *
 * As shown in this example, logging depends on the configuration document.
 *
 * @module Logging
 */

import PropTypes from 'prop-types';
var optionsShape = {
  config: PropTypes.object.isRequired
};
var serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired
};
var service = null;

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
 * Logs a message to the 'info' log level. Can accept custom attributes as a property of the error
 * object, or as an optional second parameter.
 *
 * @param {string|Error} infoStringOrErrorObject
 * @param {Object} [customAttributes={}]
 */
export function logInfo(infoStringOrErrorObject, customAttributes) {
  return service.logInfo(infoStringOrErrorObject, customAttributes);
}

/**
 * Logs a message to the 'error' log level.  Can accept custom attributes as a property of the error
 * object, or as an optional second parameter.
 *
 * @param {string|Error} errorStringOrObject
 * @param {Object} [customAttributes={}]
 */
export function logError(errorStringOrObject, customAttributes) {
  return service.logError(errorStringOrObject, customAttributes);
}

/**
 * Sets a custom attribute that will be included with all subsequent log messages.
 *
 * @param {string} name
 * @param {string|number|null} value
 */
export function setCustomAttribute(name, value) {
  return service.setCustomAttribute(name, value);
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
 * @memberof module:Logging
 * @property {function} logError
 * @property {function} logInfo
 */
//# sourceMappingURL=interface.js.map