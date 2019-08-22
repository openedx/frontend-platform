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

  static processApiClientError(error = {}) {
    const { request, response } = error;

    if (response) {
      const { status, config, data } = response;
      const url = config ? config.url : '';
      const stringifiedData = data ? JSON.stringify(data) : '';
      const responseIsHTML = stringifiedData.includes('<!DOCTYPE html>');

      return {
        errorType: 'api-response-error',
        errorStatus: status || '',
        errorUrl: url,
        // Don't include data if it is just an HTML document, like a 500 error page.
        errorData: responseIsHTML ? '<Response is HTML>' : stringifiedData,
      };
    }

    if (request) {
      const { config, message } = error;
      const { responseText, responseURL, status } = request;
      const url = responseURL || (config && config.url);
      const data = responseText || message;
      const method = config ? config.method : '';

      return {
        errorType: 'api-request-error',
        errorStatus: status || '',
        errorUrl: url || '',
        errorData: data || '',
        errorMethod: method || '',
      };
    }

    return {
      errorType: 'api-request-config-error',
      errorData: error.message || '',
    };
  }

  // API errors look for axios API error format.
  // Note: function will simply log errors that don't seem to be API error responses.
  static logApiClientError(error = {}, _customAttributes = {}) {
    const processedError = this.processApiClientError(error);
    const { messagePrefix, ...customAttributes } = _customAttributes;
    const {
      errorType,
      errorStatus: status,
      errorMethod: method,
      errorUrl: url,
      errorData: data,
    } = processedError;
    let message;

    switch (errorType) {
      case 'api-response-error':
        message = messagePrefix ?
          `${messagePrefix}: (API request failed) ${status} ${url} ${data}` :
          `API request failed: ${status} ${url} ${data}`;

        this.logError(new Error(message), { ...processedError, ...customAttributes });
        break;
      case 'api-request-error':
        message = messagePrefix ?
          `${messagePrefix}: API request failed: ${status} ${method} ${url} ${data}` :
          `API request failed: ${status} ${method} ${url} ${data}`;

        this.logInfo(message, { ...processedError, ...customAttributes });
        break;
      /* istanbul ignore next */
      default:
        break;
    }
  }
}

export default NewRelicLoggingService;
