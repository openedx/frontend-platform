function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import axios from 'axios'; // This default algorithm is a recreation of what is documented here
// https://cloud.google.com/storage/docs/exponential-backoff

var defaultGetBackoffMilliseconds = function defaultGetBackoffMilliseconds(nthRetry) {
  var maximumBackoffMilliseconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16000;
  // Retry at exponential intervals (2, 4, 8, 16...)
  var exponentialBackoffSeconds = Math.pow(2, nthRetry); // Add some randomness to avoid sending retries from separate requests all at once

  var randomFractionOfASecond = Math.random();
  var backoffSeconds = exponentialBackoffSeconds + randomFractionOfASecond;
  var backoffMilliseconds = Math.round(backoffSeconds * 1000);
  return Math.min(backoffMilliseconds, maximumBackoffMilliseconds);
};

var createRetryInterceptor = function createRetryInterceptor() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$httpClient = options.httpClient,
      httpClient = _options$httpClient === void 0 ? axios.create() : _options$httpClient,
      _options$getBackoffMi = options.getBackoffMilliseconds,
      getBackoffMilliseconds = _options$getBackoffMi === void 0 ? defaultGetBackoffMilliseconds : _options$getBackoffMi,
      _options$shouldRetry = options.shouldRetry,
      shouldRetry = _options$shouldRetry === void 0 ? function (error) {
    var isRequestError = !error.response && error.config;
    return isRequestError;
  } : _options$shouldRetry,
      _options$defaultMaxRe = options.defaultMaxRetries,
      defaultMaxRetries = _options$defaultMaxRe === void 0 ? 2 : _options$defaultMaxRe;

  var interceptor = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(error) {
      var config, _config$maxRetries, maxRetries, retryRequest;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              config = error.config; // If no config exists there was some other error setting up the request

              if (config) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return", Promise.reject(error));

            case 3:
              if (shouldRetry(error)) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return", Promise.reject(error));

            case 5:
              _config$maxRetries = config.maxRetries, maxRetries = _config$maxRetries === void 0 ? defaultMaxRetries : _config$maxRetries;

              retryRequest = /*#__PURE__*/function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(nthRetry) {
                  var retryResponse, backoffDelay;
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (!(nthRetry > maxRetries)) {
                            _context.next = 2;
                            break;
                          }

                          return _context.abrupt("return", Promise.reject(error));

                        case 2:
                          _context.prev = 2;
                          backoffDelay = getBackoffMilliseconds(nthRetry); // Delay (wrapped in a promise so we can await the setTimeout)

                          _context.next = 6;
                          return new Promise(function (resolve) {
                            return setTimeout(resolve, backoffDelay);
                          });

                        case 6:
                          _context.next = 8;
                          return httpClient.request(config);

                        case 8:
                          retryResponse = _context.sent;
                          _context.next = 14;
                          break;

                        case 11:
                          _context.prev = 11;
                          _context.t0 = _context["catch"](2);
                          return _context.abrupt("return", retryRequest(nthRetry + 1));

                        case 14:
                          return _context.abrupt("return", retryResponse);

                        case 15:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, null, [[2, 11]]);
                }));

                return function retryRequest(_x2) {
                  return _ref2.apply(this, arguments);
                };
              }();

              return _context2.abrupt("return", retryRequest(1));

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function interceptor(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  return interceptor;
};

export default createRetryInterceptor;
export { defaultGetBackoffMilliseconds };
//# sourceMappingURL=createRetryInterceptor.js.map