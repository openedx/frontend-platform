function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The MockAnalyticsService implements all functions of AnalyticsService as Jest mocks (jest.fn())).
 * It emulates the behavior of a real analytics service but witohut making any requests. It has no
 * other functionality.
 *
 * @implements {AnalyticsService}
 * @memberof module:Analytics
 */
var MockAnalyticsService = function MockAnalyticsService(_ref) {
  var _this = this;

  var httpClient = _ref.httpClient,
      loggingService = _ref.loggingService;

  _classCallCheck(this, MockAnalyticsService);

  _defineProperty(this, "checkIdentifyCalled", jest.fn(function () {
    if (!_this.hasIdentifyBeenCalled) {
      _this.loggingService.logError('Identify must be called before other tracking events.');
    }
  }));

  _defineProperty(this, "sendTrackingLogEvent", jest.fn(function () {
    return Promise.resolve();
  }));

  _defineProperty(this, "identifyAuthenticatedUser", jest.fn(function (userId) {
    if (!userId) {
      throw new Error('UserId is required for identifyAuthenticatedUser.');
    }

    _this.hasIdentifyBeenCalled = true;
  }));

  _defineProperty(this, "identifyAnonymousUser", jest.fn(function () {
    _this.hasIdentifyBeenCalled = true;
    return Promise.resolve();
  }));

  _defineProperty(this, "sendTrackEvent", jest.fn(function () {
    _this.checkIdentifyCalled();
  }));

  _defineProperty(this, "sendPageEvent", jest.fn(function () {
    _this.checkIdentifyCalled();
  }));

  this.loggingService = loggingService;
  this.httpClient = httpClient;
};

_defineProperty(MockAnalyticsService, "hasIdentifyBeenCalled", false);

export default MockAnalyticsService;
//# sourceMappingURL=MockAnalyticsService.js.map