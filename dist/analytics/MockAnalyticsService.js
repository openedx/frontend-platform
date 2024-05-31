function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * The MockAnalyticsService implements all functions of AnalyticsService as Jest mocks (jest.fn())).
 * It emulates the behavior of a real analytics service but witohut making any requests. It has no
 * other functionality.
 *
 * @implements {AnalyticsService}
 * @memberof module:Analytics
 */
var MockAnalyticsService = /*#__PURE__*/_createClass(function MockAnalyticsService(_ref) {
  var _this = this;
  var httpClient = _ref.httpClient,
    loggingService = _ref.loggingService;
  _classCallCheck(this, MockAnalyticsService);
  _defineProperty(this, "checkIdentifyCalled", jest.fn(function () {
    if (!_this.hasIdentifyBeenCalled) {
      _this.loggingService.logError('Identify must be called before other tracking events.');
    }
  }));
  /**
   * Returns a resolved promise.
   *
   * @returns {Promise} The promise returned by HttpClient.post.
   */
  _defineProperty(this, "sendTrackingLogEvent", jest.fn(function () {
    return Promise.resolve();
  }));
  /**
   * No-op, but records that identify has been called.
   *
   * @param {string} userId
   * @throws {Error} If userId argument is not supplied.
   */
  _defineProperty(this, "identifyAuthenticatedUser", jest.fn(function (userId) {
    if (!userId) {
      throw new Error('UserId is required for identifyAuthenticatedUser.');
    }
    _this.hasIdentifyBeenCalled = true;
  }));
  /**
   * No-op, but records that it has been called to prevent double-identification.
   * @returns {Promise} A resolved promise.
   */
  _defineProperty(this, "identifyAnonymousUser", jest.fn(function () {
    _this.hasIdentifyBeenCalled = true;
    return Promise.resolve();
  }));
  /**
   * Logs the event to the console.
   *
   * Checks whether identify has been called, logging an error to the logging service if not.
   */
  _defineProperty(this, "sendTrackEvent", jest.fn(function () {
    _this.checkIdentifyCalled();
  }));
  /**
   * Logs the event to the console.
   *
   * Checks whether identify has been called, logging an error to the logging service if not.
   */
  _defineProperty(this, "sendPageEvent", jest.fn(function () {
    _this.checkIdentifyCalled();
  }));
  this.loggingService = loggingService;
  this.httpClient = httpClient;
});
_defineProperty(MockAnalyticsService, "hasIdentifyBeenCalled", false);
export default MockAnalyticsService;
//# sourceMappingURL=MockAnalyticsService.js.map