function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The MockLoggingService implements both logInfo and logError as jest mock functions via
 * jest.fn().  It has no other functionality.
 *
 * @implements {LoggingService}
 * @memberof module:Logging
 */
var MockLoggingService = function MockLoggingService() {
  _classCallCheck(this, MockLoggingService);

  _defineProperty(this, "logInfo", jest.fn());

  _defineProperty(this, "logError", jest.fn());
};

export default MockLoggingService;
//# sourceMappingURL=MockLoggingService.js.map