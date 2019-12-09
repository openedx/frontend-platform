/**
 * NewRelic will not log an error if it is too long.
 *
 * @ignore
 */
export const MAX_ERROR_LENGTH = 4000;

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

/**
 * Logs info and errors to NewRelic and console.
 *
 * Requires the NewRelic Browser JavaScript snippet.
 *
 * @implements {LoggingService}
 */
export default class NewRelicLoggingService {
  /**
   *
   *
   * @param {*} message
   * @param {*} [customAttributes={}]
   * @memberof NewRelicLoggingService
   */
  logInfo(message, customAttributes = {}) {
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      console.log(message, customAttributes); // eslint-disable-line
    }
    /* istanbul ignore else */
    if (window && typeof window.newrelic !== 'undefined') {
      window.newrelic.addPageAction('INFO', Object.assign({}, { message }, customAttributes));
    }
  }

  /**
   *
   *
   * @param {*} error
   * @param {*} [customAttributes={}]
   * @memberof NewRelicLoggingService
   */
  logError(error, customAttributes = {}) {
    const errorCustomAttributes = error.customAttributes || {};
    let allCustomAttributes = { ...errorCustomAttributes, ...customAttributes };
    if (Object.keys(allCustomAttributes).length === 0) {
      // noticeError expects undefined if there are no custom attributes.
      allCustomAttributes = undefined;
    }
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      console.error(error, allCustomAttributes); // eslint-disable-line
    }
    /* istanbul ignore else */
    if (window && typeof window.newrelic !== 'undefined') {
      // Note: customProperties are not sent.  Presumably High-Security Mode is being used.
      window.newrelic.noticeError(fixErrorLength(error), allCustomAttributes);
    }
  }
}
