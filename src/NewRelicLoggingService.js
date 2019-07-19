/**
 * Logs info and errors to NewRelic and console.
 *
 * Requires the NewRelic Browser JavaScript snippet.
 */
import MAX_ERROR_LENGTH from './constants';

function fixErrorLength(error) {
  if (error.message && error.message.length > MAX_ERROR_LENGTH) {
    const processedError = Object.create(error);
    processedError.message = processedError.message.substring(0, MAX_ERROR_LENGTH);
    return processedError;
  } else if (typeof error === 'string' && error.length > MAX_ERROR_LENGTH) {
    return error.substring(0, MAX_ERROR_LENGTH);
  }
  return error;
}

class NewRelicLoggingService {
  static logInfo(message, customAttributes = {}) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      console.log(message, customAttributes); // eslint-disable-line
    }
    /* istanbul ignore else */
    if (window && typeof window.newrelic !== 'undefined') {
      window.newrelic.addPageAction('INFO', Object.assign({}, { message }, customAttributes));
    }
  }

  static logError(error, customAttributes) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      console.error(error, customAttributes); // eslint-disable-line
    }
    /* istanbul ignore else */
    if (window && typeof window.newrelic !== 'undefined') {
      // Note: customProperties are not sent.  Presumably High-Security Mode is being used.
      window.newrelic.noticeError(fixErrorLength(error), customAttributes);
    }
  }

  // API errors look for axios API error format.
  // Note: function will simply log errors that don't seem to be API error responses.
  static logAPIErrorResponse(error, customAttributes) {
    let processedError = error;
    let updatedCustomAttributes = customAttributes;

    if (error.response) {
      let data = !error.response.data ? '' : JSON.stringify(error.response.data);
      // Don't include data if it is just an HTML document, like a 500 error page.
      data = data.includes('<!DOCTYPE html>') ? '' : data;
      const responseAttributes = {
        errorType: 'api-response-error',
        errorStatus: error.response.status,
        errorUrl: error.response.config ? error.response.config.url : '',
        errorData: data,
      };
      updatedCustomAttributes = Object.assign({}, responseAttributes, customAttributes);
      processedError = new Error(`API request failed: ${error.response.status} ${responseAttributes.errorUrl} ${data}`);

      this.logError(processedError, updatedCustomAttributes);
    } else if (error.request) {
      const { config, request } = error;
      const errorMessage = request.responseText || error.message;
      const requestMethod = config && config.method;
      const requestUrl = request.responseURL || (config && config.url);
      const requestAttributes = {
        errorType: 'api-request-error',
        errorStatus: request.status,
        errorMethod: requestMethod,
        errorUrl: requestUrl,
        errorData: errorMessage,
      };
      updatedCustomAttributes = Object.assign({}, requestAttributes, customAttributes);

      this.logInfo(
        `API request failed: ${request.status} ${requestMethod} ${requestUrl} ${errorMessage}`,
        updatedCustomAttributes,
      );
    }
  }
}

export default NewRelicLoggingService;
