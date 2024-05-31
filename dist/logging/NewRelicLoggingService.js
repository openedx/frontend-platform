function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
    console.log(actionName, message, customAttributes); // eslint-disable-line
  }
  if (window && typeof window.newrelic !== 'undefined') {
    // https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/addpageaction/
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
    // https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/noticeerror/
    window.newrelic.noticeError(fixErrorLength(error), customAttributes);
  }
}
function _setCustomAttribute(name, value) {
  if (process.env.NODE_ENV === 'development') {
    console.log(name, value); // eslint-disable-line
  }
  if (window && typeof window.newrelic !== 'undefined') {
    // https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/setcustomattribute/
    window.newrelic.setCustomAttribute(name, value);
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
 * other standard custom attributes. By default, userId is added (via setCustomAttribute) for logged
 * in users via the auth service (AuthAxiosJwtService).
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
  return _createClass(NewRelicLoggingService, [{
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

    /**
     * Sets a custom attribute that will be included with all subsequent log messages.
     *
     * @param {string} name
     * @param {string|number|null} value
     */
  }, {
    key: "setCustomAttribute",
    value: function setCustomAttribute(name, value) {
      _setCustomAttribute(name, value);
    }
  }]);
}();
export { NewRelicLoggingService as default };
//# sourceMappingURL=NewRelicLoggingService.js.map