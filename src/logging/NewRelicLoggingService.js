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
 * The NewRelicLoggingService is a concrete implementation of the logging service interface that
 * sends messages to NewRelic that can be seen in NewRelic Browser and NewRelic Insights. When in
 * development mode, all messages will instead be sent to the console.
 *
 * When you use `logError`, your errors will appear under "JS errors"
 * for your Browser application.
 *
 * ```
 * SELECT * from JavaScriptError WHERE errorStatus is not null SINCE 10 days ago
 * ```
 *
 * When using `logInfo`, these only appear in New Relic Insights when querying for page actions as
 * follows:
 *
 * ```
 * SELECT * from PageAction WHERE actionName = 'INFO' SINCE 1 hour ago
 * ```
 *
 * You can also add your own custom metrics as an additional argument, or see the code to find
 * other standard custom attributes.
 *
 * Requires the NewRelic Browser JavaScript snippet.
 *
 * @implements {LoggingService}
 * @memberof module:Logging
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
