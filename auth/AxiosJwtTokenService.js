function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { logFrontendAuthError, processAxiosErrorAndThrow } from './utils';
import createRetryInterceptor from './interceptors/createRetryInterceptor';

var AxiosJwtTokenService = /*#__PURE__*/function () {
  function AxiosJwtTokenService(loggingService, tokenCookieName, tokenRefreshEndpoint) {
    _classCallCheck(this, AxiosJwtTokenService);

    this.loggingService = loggingService;
    this.tokenCookieName = tokenCookieName;
    this.tokenRefreshEndpoint = tokenRefreshEndpoint;
    this.httpClient = axios.create(); // Set withCredentials to true. Enables cross-site Access-Control requests
    // to be made using cookies, authorization headers or TLS client
    // certificates. More on MDN:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials

    this.httpClient.defaults.withCredentials = true; // Add retries to this axios instance

    this.httpClient.interceptors.response.use(function (response) {
      return response;
    }, createRetryInterceptor({
      httpClient: this.httpClient
    }));
    this.cookies = new Cookies();
    this.refreshRequestPromises = {};
  }

  _createClass(AxiosJwtTokenService, [{
    key: "getHttpClient",
    value: function getHttpClient() {
      return this.httpClient;
    }
  }, {
    key: "decodeJwtCookie",
    value: function decodeJwtCookie() {
      var cookieValue = this.cookies.get(this.tokenCookieName);

      if (cookieValue) {
        try {
          return jwtDecode(cookieValue);
        } catch (e) {
          var error = Object.create(e);
          error.message = 'Error decoding JWT token';
          error.customAttributes = {
            cookieValue: cookieValue
          };
          throw error;
        }
      }

      return null;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this = this;

      var responseServerEpochSeconds = 0;

      if (this.refreshRequestPromises[this.tokenCookieName] === undefined) {
        var makeRefreshRequest = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var axiosResponse, userIsUnauthenticated, _decodedJwtToken, browserEpochSeconds, browserDriftSeconds, decodedJwtToken, error;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.prev = 1;
                    _context.next = 4;
                    return _this.httpClient.post(_this.tokenRefreshEndpoint);

                  case 4:
                    axiosResponse = _context.sent;

                    // eslint-disable-next-line max-len
                    if (axiosResponse.data && axiosResponse.data.response_epoch_seconds) {
                      responseServerEpochSeconds = axiosResponse.data.response_epoch_seconds;
                    }

                    _context.next = 11;
                    break;

                  case 8:
                    _context.prev = 8;
                    _context.t0 = _context["catch"](1);
                    processAxiosErrorAndThrow(_context.t0);

                  case 11:
                    _context.next = 21;
                    break;

                  case 13:
                    _context.prev = 13;
                    _context.t1 = _context["catch"](0);
                    userIsUnauthenticated = _context.t1.response && _context.t1.response.status === 401;

                    if (!userIsUnauthenticated) {
                      _context.next = 20;
                      break;
                    }

                    // Clean up the cookie if it exists to eliminate any situation
                    // where the cookie is not expired but the jwt is expired.
                    _this.cookies.remove(_this.tokenCookieName);

                    _decodedJwtToken = null;
                    return _context.abrupt("return", _decodedJwtToken);

                  case 20:
                    throw _context.t1;

                  case 21:
                    browserEpochSeconds = Date.now() / 1000;
                    browserDriftSeconds = responseServerEpochSeconds > 0 ? Math.abs(browserEpochSeconds - responseServerEpochSeconds) : null;
                    decodedJwtToken = _this.decodeJwtCookie();

                    if (decodedJwtToken) {
                      _context.next = 28;
                      break;
                    }

                    // This is an unexpected case. The refresh endpoint should set the
                    //   cookie that is needed.
                    // For more details, see:
                    //   docs/decisions/0005-token-null-after-successful-refresh.rst
                    error = new Error('Access token is still null after successful refresh.');
                    error.customAttributes = {
                      axiosResponse: axiosResponse,
                      browserDriftSeconds: browserDriftSeconds,
                      browserEpochSeconds: browserEpochSeconds
                    };
                    throw error;

                  case 28:
                    return _context.abrupt("return", decodedJwtToken);

                  case 29:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, null, [[0, 13], [1, 8]]);
          }));

          return function makeRefreshRequest() {
            return _ref.apply(this, arguments);
          };
        }();

        this.refreshRequestPromises[this.tokenCookieName] = makeRefreshRequest()["finally"](function () {
          delete _this.refreshRequestPromises[_this.tokenCookieName];
        });
      }

      return this.refreshRequestPromises[this.tokenCookieName];
    }
  }, {
    key: "getJwtToken",
    value: function () {
      var _getJwtToken = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var forceRefresh,
            decodedJwtToken,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                forceRefresh = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : false;
                _context2.prev = 1;
                decodedJwtToken = this.decodeJwtCookie(this.tokenCookieName);

                if (!(!AxiosJwtTokenService.isTokenExpired(decodedJwtToken) && !forceRefresh)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", decodedJwtToken);

              case 5:
                _context2.next = 10;
                break;

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](1);
                // Log unexpected error and continue with attempt to refresh it.
                // TODO: Fix these.  They're still using loggingService as a singleton.
                logFrontendAuthError(this.loggingService, _context2.t0);

              case 10:
                _context2.prev = 10;
                _context2.next = 13;
                return this.refresh();

              case 13:
                return _context2.abrupt("return", _context2.sent);

              case 16:
                _context2.prev = 16;
                _context2.t1 = _context2["catch"](10);
                // TODO: Fix these.  They're still using loggingService as a singleton.
                logFrontendAuthError(this.loggingService, _context2.t1);
                throw _context2.t1;

              case 20:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 7], [10, 16]]);
      }));

      function getJwtToken() {
        return _getJwtToken.apply(this, arguments);
      }

      return getJwtToken;
    }()
  }], [{
    key: "isTokenExpired",
    value: function isTokenExpired(token) {
      return !token || token.exp < Date.now() / 1000;
    }
  }]);

  return AxiosJwtTokenService;
}();

export { AxiosJwtTokenService as default };
//# sourceMappingURL=AxiosJwtTokenService.js.map