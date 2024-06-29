function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
    var responseIsHTML = stringifiedData.includes('<!DOCTYPE html>');
    // Don't include data if it is just an HTML document, like a 500 error page.
    /* istanbul ignore next */
    var httpErrorResponseData = responseIsHTML ? '<Response is HTML>' : stringifiedData;
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-response-error',
      httpErrorStatus: status,
      httpErrorResponseData: httpErrorResponseData,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    });
    error.message = "Axios Error (Response): ".concat(status, " - See custom attributes for details.");
  } else if (request) {
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-request-error',
      httpErrorMessage: error.message,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    });
    // This case occurs most likely because of intermittent internet connection issues
    // but it also, though less often, catches CORS or server configuration problems.
    error.message = 'Axios Error (Request): (Possible local connectivity issue.) See custom attributes for details.';
  } else {
    error.customAttributes = _objectSpread(_objectSpread({}, error.customAttributes), {}, {
      httpErrorType: 'api-request-config-error',
      httpErrorMessage: error.message,
      httpErrorRequestUrl: httpErrorRequestUrl,
      httpErrorRequestMethod: httpErrorRequestMethod
    });
    error.message = 'Axios Error (Config): See custom attributes for details.';
  }
  return error;
};
var processAxiosErrorAndThrow = function processAxiosErrorAndThrow(axiosErrorObject) {
  throw processAxiosError(axiosErrorObject);
};
export { getUrlParts, logFrontendAuthError, processAxiosError, processAxiosErrorAndThrow };
//# sourceMappingURL=utils.js.map