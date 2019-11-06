/**
 * Provides a wrapper for any logging service implementation of the expected
 * logging service interface.
 *
 * This enables shared libraries or applications that want to support multiple
 * logging service implementations to be coded against these wrapping functions,
 * and allows any concrete implementation to be injected.
 */

let loggingService = null;

function ensureLoggingServiceAPI(newLoggingService, functionName) {
  if (typeof newLoggingService[functionName] !== 'function') {
    throw Error(`The loggingService API must have a ${functionName} function.`);
  }
}

function configureLoggingService(newLoggingService) {
  if (!newLoggingService) {
    throw Error('The loggingService is required.');
  }
  ensureLoggingServiceAPI(newLoggingService, 'logApiClientError');
  ensureLoggingServiceAPI(newLoggingService, 'logAPIErrorResponse');
  ensureLoggingServiceAPI(newLoggingService, 'logInfo');
  ensureLoggingServiceAPI(newLoggingService, 'logError');
  loggingService = newLoggingService;
}

function resetLoggingService() {
  loggingService = null;
}

function getLoggingService() {
  if (!loggingService) {
    throw Error('You must first configure the loggingService.');
  }
  return loggingService;
}

function logInfo(message, customAttributes) {
  return getLoggingService().logInfo(message, customAttributes);
}

function logError(error, customAttributes) {
  return getLoggingService().logError(error, customAttributes);
}

function logApiClientError(error, customAttributes) {
  return getLoggingService().logApiClientError(error, customAttributes);
}

function logAPIErrorResponse(error, customAttributes) {
  return getLoggingService().logAPIErrorResponse(error, customAttributes);
}

function processApiClientError(error) {
  return getLoggingService().processApiClientError(error);
}

export {
  configureLoggingService,
  logApiClientError,
  processApiClientError,
  logAPIErrorResponse,
  logInfo,
  logError,
  resetLoggingService,
};
