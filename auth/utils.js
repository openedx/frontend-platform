function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Lifted from here: https://regexr.com/3ok5o
var urlRegex = /([a-z]{1,2}tps?):\/\/((?:(?!(?:\/|#|\?|&)).)+)(?:(\/(?:(?:(?:(?!(?:#|\?|&)).)+\/))?))?(?:((?:(?!(?:\.|$|\?|#)).)+))?(?:(\.(?:(?!(?:\?|$|#)).)+))?(?:(\?(?:(?!(?:$|#)).)+))?(?:(#.+))?/;

var getUrlParts = function getUrlParts(url) {
  var found = url.match(urlRegex);

  try {
    var _found = _slicedToArray(found, 8),
        fullUrl = _found[0],
        protocol = _found[1],
        domain = _found[2],
        path = _found[3],
        endFilename = _found[4],
        endFileExtension = _found[5],
        query = _found[6],
        hash = _found[7];

    return {
      fullUrl: fullUrl,
      protocol: protocol,
      domain: domain,
      path: path,
      endFilename: endFilename,
      endFileExtension: endFileExtension,
      query: query,
      hash: hash
    };
  } catch (e) {
    throw new Error("Could not find url parts from ".concat(url, "."));
  }
};

var logFrontendAuthError = function logFrontendAuthError(loggingService, error) {
  var prefixedMessageError = Object.create(error);
  prefixedMessageError.message = "[frontend-auth] ".concat(error.message);
  loggingService.logError(prefixedMessageError, prefixedMessageError.customAttributes);
};

var processAxiosError = function processAxiosError(axiosErrorObject) {
  var error = Object.create(axiosErrorObject);
  var request = error.request,
      response = error.response,
      config = error.config;

  if (!config) {
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'unknown-api-request-error'
    });
    return error;
  }

  var httpErrorRequestUrl = config.url,
      httpErrorRequestMethod = config.method;
  /* istanbul ignore else: difficult to enter the request-only error case in a unit test */

  if (response) {
    var status = response.status,
        data = response.data;
    var stringifiedData = JSON.stringify(data) || '(empty response)';
    var responseIsHTML = stringifiedData.includes('<!DOCTYPE html>'); // Don't include data if it is just an HTML document, like a 500 error page.

    /* istanbul ignore next */

    var httpErrorResponseData = responseIsHTML ? '<Response is HTML>' : stringifiedData;
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-response-error',
      httpErrorStatus: status,
      httpErrorResponseData: httpErrorResponseData,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    });
    error.message = "Axios Error (Response): ".concat(status, " ").concat(httpErrorRequestUrl, " ").concat(httpErrorResponseData);
  } else if (request) {
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-request-error',
      httpErrorMessage: error.message,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    }); // This case occurs most likely because of intermittent internet connection issues
    // but it also, though less often, catches CORS or server configuration problems.

    error.message = "Axios Error (Request): ".concat(error.message, " (possible local connectivity issue) ").concat(httpErrorRequestMethod, " ").concat(httpErrorRequestUrl);
  } else {
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-request-config-error',
      httpErrorMessage: error.message,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    });
    error.message = "Axios Error (Config): ".concat(error.message, " ").concat(httpErrorRequestMethod, " ").concat(httpErrorRequestUrl);
  }

  return error;
};

var processAxiosErrorAndThrow = function processAxiosErrorAndThrow(axiosErrorObject) {
  throw processAxiosError(axiosErrorObject);
};

export { getUrlParts, logFrontendAuthError, processAxiosError, processAxiosErrorAndThrow };
//# sourceMappingURL=utils.js.map