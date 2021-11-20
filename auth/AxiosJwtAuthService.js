function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import { camelCaseObject, ensureDefinedConfig } from '../utils';
import createJwtTokenProviderInterceptor from './interceptors/createJwtTokenProviderInterceptor';
import createCsrfTokenProviderInterceptor from './interceptors/createCsrfTokenProviderInterceptor';
import createProcessAxiosRequestErrorInterceptor from './interceptors/createProcessAxiosRequestErrorInterceptor';
import AxiosJwtTokenService from './AxiosJwtTokenService';
import AxiosCsrfTokenService from './AxiosCsrfTokenService';
import configureCache from './LocalForageCache';
var optionsPropTypes = {
  config: PropTypes.shape({
    BASE_URL: PropTypes.string.isRequired,
    LMS_BASE_URL: PropTypes.string.isRequired,
    LOGIN_URL: PropTypes.string.isRequired,
    LOGOUT_URL: PropTypes.string.isRequired,
    REFRESH_ACCESS_TOKEN_ENDPOINT: PropTypes.string.isRequired,
    ACCESS_TOKEN_COOKIE_NAME: PropTypes.string.isRequired,
    CSRF_TOKEN_API_PATH: PropTypes.string.isRequired
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired
  }).isRequired
};
/**
 * @implements {AuthService}
 * @memberof module:Auth
 */

var AxiosJwtAuthService = /*#__PURE__*/function () {
  /**
   * @param {Object} options
   * @param {Object} options.config
   * @param {string} options.config.BASE_URL
   * @param {string} options.config.LMS_BASE_URL
   * @param {string} options.config.LOGIN_URL
   * @param {string} options.config.LOGOUT_URL
   * @param {string} options.config.REFRESH_ACCESS_TOKEN_ENDPOINT
   * @param {string} options.config.ACCESS_TOKEN_COOKIE_NAME
   * @param {string} options.config.CSRF_TOKEN_API_PATH
   * @param {Object} options.loggingService requires logError and logInfo methods
   */
  function AxiosJwtAuthService(options) {
    var _this = this;

    _classCallCheck(this, AxiosJwtAuthService);

    this.authenticatedHttpClient = null;
    this.httpClient = null;
    this.cachedAuthenticatedHttpClient = null;
    this.cachedHttpClient = null;
    this.authenticatedUser = null;
    ensureDefinedConfig(options, 'AuthService');
    PropTypes.checkPropTypes(optionsPropTypes, options, 'options', 'AuthService');
    this.config = options.config;
    this.loggingService = options.loggingService;
    this.jwtTokenService = new AxiosJwtTokenService(this.loggingService, this.config.ACCESS_TOKEN_COOKIE_NAME, this.config.REFRESH_ACCESS_TOKEN_ENDPOINT);
    this.csrfTokenService = new AxiosCsrfTokenService(this.config.CSRF_TOKEN_API_PATH);
    this.authenticatedHttpClient = this.addAuthenticationToHttpClient(axios.create());
    this.httpClient = axios.create();
    configureCache().then(function (cachedAxiosClient) {
      _this.cachedAuthenticatedHttpClient = _this.addAuthenticationToHttpClient(cachedAxiosClient);
      _this.cachedHttpClient = cachedAxiosClient;
    })["catch"](function (e) {
      // fallback to non-cached HTTP clients and log error
      _this.cachedAuthenticatedHttpClient = _this.authenticatedHttpClient;
      _this.cachedHttpClient = _this.httpClient;
      logFrontendAuthError(_this.loggingService, "configureCache failed with error: ".concat(e.message));
    });
  }
  /**
   * Gets the authenticated HTTP client for the service.  This is an axios instance.
   *
   * @param {Object} [options] Optional options for how the HTTP client should be configured.
   * @param {boolean} [options.useCache] Whether to use front end caching for all requests made
   * with the returned client.
   *
   * @returns {HttpClient} A configured axios http client which can be used for authenticated
   * requests.
   */


  _createClass(AxiosJwtAuthService, [{
    key: "getAuthenticatedHttpClient",
    value: function getAuthenticatedHttpClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (options.useCache) {
        return this.cachedAuthenticatedHttpClient;
      }

      return this.authenticatedHttpClient;
    }
    /**
     * Gets the unauthenticated HTTP client for the service.  This is an axios instance.
     *
     * @param {Object} [options] Optional options for how the HTTP client should be configured.
     * @param {boolean} [options.useCache] Whether to use front end caching for all requests made
     * with the returned client.
     * @returns {HttpClient} A configured axios http client.
     */

  }, {
    key: "getHttpClient",
    value: function getHttpClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (options.useCache) {
        return this.cachedHttpClient;
      }

      return this.httpClient;
    }
    /**
     * Used primarily for testing.
     *
     * @ignore
     */

  }, {
    key: "getJwtTokenService",
    value: function getJwtTokenService() {
      return this.jwtTokenService;
    }
    /**
     * Used primarily for testing.
     *
     * @ignore
     */

  }, {
    key: "getCsrfTokenService",
    value: function getCsrfTokenService() {
      return this.csrfTokenService;
    }
    /**
     * Builds a URL to the login page with a post-login redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLoginRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/login?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */

  }, {
    key: "getLoginRedirectUrl",
    value: function getLoginRedirectUrl() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      return "".concat(this.config.LOGIN_URL, "?next=").concat(encodeURIComponent(redirectUrl));
    }
    /**
     * Redirects the user to the login page.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */

  }, {
    key: "redirectToLogin",
    value: function redirectToLogin() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      global.location.assign(this.getLoginRedirectUrl(redirectUrl));
    }
    /**
     * Builds a URL to the logout page with a post-logout redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLogoutRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/logout?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */

  }, {
    key: "getLogoutRedirectUrl",
    value: function getLogoutRedirectUrl() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      return "".concat(this.config.LOGOUT_URL, "?redirect_url=").concat(encodeURIComponent(redirectUrl));
    }
    /**
     * Redirects the user to the logout page.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */

  }, {
    key: "redirectToLogout",
    value: function redirectToLogout() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      global.location.assign(this.getLogoutRedirectUrl(redirectUrl));
    }
    /**
     * If it exists, returns the user data representing the currently authenticated user. If the
     * user is anonymous, returns null.
     *
     * @returns {UserData|null}
     */

  }, {
    key: "getAuthenticatedUser",
    value: function getAuthenticatedUser() {
      return this.authenticatedUser;
    }
    /**
     * Sets the authenticated user to the provided value.
     *
     * @param {UserData} authUser
     */

  }, {
    key: "setAuthenticatedUser",
    value: function setAuthenticatedUser(authUser) {
      this.authenticatedUser = authUser;
    }
    /**
     * Reads the authenticated user's access token. Resolves to null if the user is
     * unauthenticated.
     *
     * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
     * logged in.
     */

  }, {
    key: "fetchAuthenticatedUser",
    value: function () {
      var _fetchAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var options,
            decodedAccessToken,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
                _context.next = 3;
                return this.jwtTokenService.getJwtToken(options.forceRefresh || false);

              case 3:
                decodedAccessToken = _context.sent;

                if (decodedAccessToken !== null) {
                  this.setAuthenticatedUser({
                    email: decodedAccessToken.email,
                    userId: decodedAccessToken.user_id,
                    username: decodedAccessToken.preferred_username,
                    roles: decodedAccessToken.roles || [],
                    administrator: decodedAccessToken.administrator
                  });
                } else {
                  this.setAuthenticatedUser(null);
                }

                return _context.abrupt("return", this.getAuthenticatedUser());

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetchAuthenticatedUser() {
        return _fetchAuthenticatedUser.apply(this, arguments);
      }

      return fetchAuthenticatedUser;
    }()
    /**
     * Ensures a user is authenticated. It will redirect to login when not
     * authenticated.
     *
     * @param {string} [redirectUrl=config.BASE_URL] to return user after login when not
     * authenticated.
     * @returns {Promise<UserData>}
     */

  }, {
    key: "ensureAuthenticatedUser",
    value: function () {
      var _ensureAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var redirectUrl,
            isRedirectFromLoginPage,
            redirectLoopError,
            unauthorizedError,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                redirectUrl = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : this.config.BASE_URL;
                _context2.next = 3;
                return this.fetchAuthenticatedUser();

              case 3:
                if (!(this.getAuthenticatedUser() === null)) {
                  _context2.next = 13;
                  break;
                }

                isRedirectFromLoginPage = global.document.referrer && global.document.referrer.startsWith(this.config.LOGIN_URL);

                if (!isRedirectFromLoginPage) {
                  _context2.next = 9;
                  break;
                }

                redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
                logFrontendAuthError(this.loggingService, redirectLoopError);
                throw redirectLoopError;

              case 9:
                // The user is not authenticated, send them to the login page.
                this.redirectToLogin(redirectUrl);
                unauthorizedError = new Error('Failed to ensure the user is authenticated');
                unauthorizedError.isRedirecting = true;
                throw unauthorizedError;

              case 13:
                return _context2.abrupt("return", this.getAuthenticatedUser());

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function ensureAuthenticatedUser() {
        return _ensureAuthenticatedUser.apply(this, arguments);
      }

      return ensureAuthenticatedUser;
    }()
    /**
     * Fetches additional user account information for the authenticated user and merges it into the
     * existing authenticatedUser object, available via getAuthenticatedUser().
     *
     * ```
     *  console.log(authenticatedUser); // Will be sparse and only contain basic information.
     *  await hydrateAuthenticatedUser()
     *  const authenticatedUser = getAuthenticatedUser();
     *  console.log(authenticatedUser); // Will contain additional user information
     * ```
     *
     * @returns {Promise<null>}
     */

  }, {
    key: "hydrateAuthenticatedUser",
    value: function () {
      var _hydrateAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var user, response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                user = this.getAuthenticatedUser();

                if (!(user !== null)) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 4;
                return this.authenticatedHttpClient.get("".concat(this.config.LMS_BASE_URL, "/api/user/v1/accounts/").concat(user.username));

              case 4:
                response = _context3.sent;
                this.setAuthenticatedUser(_objectSpread(_objectSpread({}, user), camelCaseObject(response.data)));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function hydrateAuthenticatedUser() {
        return _hydrateAuthenticatedUser.apply(this, arguments);
      }

      return hydrateAuthenticatedUser;
    }()
    /**
    * Adds authentication defaults and interceptors to an HTTP client instance.
    *
    * @param {HttpClient} newHttpClient
    * @param {Object} config
    * @param {string} [config.REFRESH_ACCESS_TOKEN_ENDPOINT]
    * @param {string} [config.ACCESS_TOKEN_COOKIE_NAME]
    * @param {string} [config.CSRF_TOKEN_API_PATH]
    * @returns {HttpClient} A configured Axios HTTP client.
    */

  }, {
    key: "addAuthenticationToHttpClient",
    value: function addAuthenticationToHttpClient(newHttpClient) {
      var httpClient = Object.create(newHttpClient); // Set withCredentials to true. Enables cross-site Access-Control requests
      // to be made using cookies, authorization headers or TLS client
      // certificates. More on MDN:
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials

      httpClient.defaults.withCredentials = true; // Axios interceptors
      // The JWT access token interceptor attempts to refresh the user's jwt token
      // before any request unless the isPublic flag is set on the request config.

      var refreshAccessTokenInterceptor = createJwtTokenProviderInterceptor({
        jwtTokenService: this.jwtTokenService,
        shouldSkip: function shouldSkip(axiosRequestConfig) {
          return axiosRequestConfig.isPublic;
        }
      }); // The CSRF token intercepter fetches and caches a csrf token for any post,
      // put, patch, or delete request. That token is then added to the request
      // headers.

      var attachCsrfTokenInterceptor = createCsrfTokenProviderInterceptor({
        csrfTokenService: this.csrfTokenService,
        CSRF_TOKEN_API_PATH: this.config.CSRF_TOKEN_API_PATH,
        shouldSkip: function shouldSkip(axiosRequestConfig) {
          var method = axiosRequestConfig.method,
              isCsrfExempt = axiosRequestConfig.isCsrfExempt;
          var CSRF_PROTECTED_METHODS = ['post', 'put', 'patch', 'delete'];
          return isCsrfExempt || !CSRF_PROTECTED_METHODS.includes(method);
        }
      });
      var processAxiosRequestErrorInterceptor = createProcessAxiosRequestErrorInterceptor({
        loggingService: this.loggingService
      }); // Request interceptors: Axios runs the interceptors in reverse order from
      // how they are listed. After fetching csrf tokens no longer require jwt
      // authentication, it won't matter which happens first. This change is
      // coming soon in edx-platform. Nov. 2019

      httpClient.interceptors.request.use(attachCsrfTokenInterceptor);
      httpClient.interceptors.request.use(refreshAccessTokenInterceptor); // Response interceptor: moves axios response error data into the error
      // object at error.customAttributes

      httpClient.interceptors.response.use(function (response) {
        return response;
      }, processAxiosRequestErrorInterceptor);
      return httpClient;
    }
  }]);

  return AxiosJwtAuthService;
}();

export default AxiosJwtAuthService;
//# sourceMappingURL=AxiosJwtAuthService.js.map