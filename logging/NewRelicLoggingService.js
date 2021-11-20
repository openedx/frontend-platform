function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * NewRelic will not log an error if it is too long.
 *
 * @ignore
 */
export var MAX_ERROR_LENGTH = 4000;

function fixErrorLength(error) {
  if (error.message && error.message.length > MAX_ERROR_LENGTH) {
    var processedError = Object.create(error);
    processedError.message = processedError.message.substring(0, MAX_ERROR_LENGTH);
    return processedError;
  }

  if (typeof error === 'string' && error.length > MAX_ERROR_LENGTH) {
    return error.substring(0, MAX_ERROR_LENGTH);
  }

  return error;
}
/* Constants used as New Relic page action names. */


var pageActionNameInfo = 'INFO';
var pageActionNameIgnoredError = 'IGNORED_ERROR';

function sendPageAction(actionName, message, customAttributes) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, customAttributes); // eslint-disable-line
  }

  if (window && typeof window.newrelic !== 'undefined') {
    window.newrelic.addPageAction(actionName, _objectSpread({
      message: message
    }, customAttributes));
  }
}

function sendError(error, customAttributes) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error, customAttributes); // eslint-disable-line
  }

  if (window && typeof window.newrelic !== 'undefined') {
    window.newrelic.noticeError(fixErrorLength(error), customAttributes);
  }
}
/**
 * The NewRelicLoggingService is a concrete implementation of the logging service interface that
 * sends messages to NewRelic that can be seen in NewRelic Browser and NewRelic Insights. When in
 * development mode, all messages will instead be sent to the console.
 *
 * When you use `logError`, your errors will be checked to see if they're ignored *or* not.
 * Not-ignored errors will appear under "JS errors" for your Browser application.
 *
 * ```
 * SELECT * from JavaScriptError WHERE errorStatus is not null SINCE 10 days ago
 * ```
 *
 * Ignored errors will appear in New Relic Insights as page actions, which can be queried:
 *
 * ```
 * SELECT * from PageAction WHERE actionName = 'IGNORED_ERROR' SINCE 1 hour ago
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


var NewRelicLoggingService = /*#__PURE__*/function () {
  function NewRelicLoggingService(options) {
    _classCallCheck(this, NewRelicLoggingService);

    var config = options ? options.config : undefined;
    /*
        String which is an explicit error message regex. If an error message matches the regex, the error
        is considered an *ignored* error and submitted to New Relic as a page action - not an error.
         Ignored error regexes are configured per frontend application (MFE).
         The regex for all ignored errors are represented in the .env files as a single string. If you need to
        ignore multiple errors, use the standard `|` regex syntax.
         For example, here's a .env line which ignores two specific errors:
         IGNORED_ERROR_REGEX='^\\[frontend-auth\\] Unimportant Error|Specific non-critical error #[\\d]+'
         This example would ignore errors with the following messages:
         [frontend-app-generic] - Specific non-critical error #45678 happened.
        [frontend-app-generic] - Specific non-critical error #93475 happened.
        [frontend-auth] Unimportant Error: Browser strangeness occurred.
         To test your regex additions, use a JS CLI environment (such as node) and run code like this:
         x = new RegExp('^\\[frontend-auth\\] Unimportant Error|Specific non-critical error #[\\d]+');
        '[frontend-app-generic] - Specific non-critical error #45678 happened.'.match(x);
        '[frontend-auth] Unimportant Error: Browser strangeness occurred.'.match(x);
        'This error should not match anything!'.match(x);
         For edx.org, add new error message regexes in edx-internal YAML as needed.
    */

    this.ignoredErrorRegexes = config ? config.IGNORED_ERROR_REGEX : undefined;
  }
  /**
   *
   *
   * @param {*} infoStringOrErrorObject
   * @param {*} [customAttributes={}]
   * @memberof NewRelicLoggingService
   */


  _createClass(NewRelicLoggingService, [{
    key: "logInfo",
    value: function logInfo(infoStringOrErrorObject) {
      var customAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var message = infoStringOrErrorObject;
      var customAttrs = customAttributes;

      if (_typeof(infoStringOrErrorObject) === 'object' && 'message' in infoStringOrErrorObject) {
        /* Caller has passed in an error object to be logged as a page action. */

        /* Extract the attributes and the message. */
        var infoCustomAttributes = infoStringOrErrorObject.customAttributes || {};
        customAttrs = _objectSpread(_objectSpread({}, infoCustomAttributes), customAttributes);
        message = infoStringOrErrorObject.message;
      }

      sendPageAction(pageActionNameInfo, message, customAttrs);
    }
    /**
     *
     *
     * @param {*} errorStringOrObject
     * @param {*} [customAttributes={}]
     * @memberof NewRelicLoggingService
     */

  }, {
    key: "logError",
    value: function logError(errorStringOrObject) {
      var customAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var errorCustomAttributes = errorStringOrObject.customAttributes || {};

      var allCustomAttributes = _objectSpread(_objectSpread({}, errorCustomAttributes), customAttributes);

      if (Object.keys(allCustomAttributes).length === 0) {
        // noticeError expects undefined if there are no custom attributes.
        allCustomAttributes = undefined;
      }
      /*
          Separate the errors into ignored errors and other errors.
          Ignored errors are logged via adding a page action.
          Other errors are logged via noticeError and count as "JS Errors" for the application.
      */


      var errorMessage = errorStringOrObject.message || (typeof errorStringOrObject === 'string' ? errorStringOrObject : '');

      if (this.ignoredErrorRegexes && errorMessage.match(this.ignoredErrorRegexes)) {
        /* ignored error */
        sendPageAction(pageActionNameIgnoredError, errorMessage, allCustomAttributes);
      } else {
        /*  error! */
        sendError(errorStringOrObject, allCustomAttributes);
      }
    }
  }]);

  return NewRelicLoggingService;
}();

export { NewRelicLoggingService as default };
//# sourceMappingURL=NewRelicLoggingService.js.map