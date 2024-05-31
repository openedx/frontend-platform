function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import axios from 'axios';
import PropTypes from 'prop-types';
import { ensureDefinedConfig } from '../utils';
var userPropTypes = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  administrator: PropTypes["boolean"]
});
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
  }).isRequired,
  // The absence of authenticatedUser means the user is anonymous.
  authenticatedUser: userPropTypes,
  // Must be at least a valid user, but may have other fields.
  hydratedAuthenticatedUser: userPropTypes
};

/**
 * The MockAuthService class mocks authenticated user-fetching logic and allows for manually
 * setting user data.  It is compatible with axios-mock-adapter to wrap its HttpClients so that
 * they can be mocked for testing.
 *
 * It wraps all methods of the service with Jest mock functions (jest.fn()).  This allows test code
 * to assert expectations on all functions of the service while preserving sensible behaviors.  For
 * instance, the login/logout methods related to redirecting maintain their real behavior.
 *
 * This service is NOT suitable for use in an application itself - only tests.  It depends on Jest,
 * which should only be a dev dependency of your project.  You don't want to pull the entire suite
 * of test dependencies into your application at runtime, probably even in your dev server.
 *
 * In a test where you would like to mock out API requests - perhaps from a redux-thunk function -
 * you could do the following to set up a MockAuthService for your test:
 *
 * ```
 * import { getConfig, mergeConfig } from '@edx/frontend-platform';
 * import { configure, MockAuthService } from '@edx/frontend-platform/auth';
 * import MockAdapter from 'axios-mock-adapter';
 *
 * const mockLoggingService = {
 *   logInfo: jest.fn(),
 *   logError: jest.fn(),
 * };
 * mergeConfig({
 *   authenticatedUser: {
 *     userId: 'abc123',
 *     username: 'Mock User',
 *     roles: [],
 *     administrator: false,
 *   },
 * });
 * configure(MockAuthService, { config: getConfig(), loggingService: mockLoggingService });
 * const mockAdapter = new MockAdapter(getAuthenticatedHttpClient());
 * // Mock calls for your tests.  This configuration can be done in any sort of test setup.
 * mockAdapter.onGet(...);
 * ```
 *
 * Also see the `initializeMockApp` function which also automatically uses mock services for
 * Logging and Analytics.
 *
 * @implements {AuthService}
 * @memberof module:Auth
 */
var MockAuthService = /*#__PURE__*/function () {
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
   * @param {Object} options.config.hydratedAuthenticatedUser
   * @param {Object} options.config.authenticatedUser
   * @param {Object} options.loggingService requires logError and logInfo methods
   */
  function MockAuthService(options) {
    var _this = this;
    _classCallCheck(this, MockAuthService);
    /**
     * A Jest mock function (jest.fn())
     *
     * Gets the authenticated HTTP client instance, which is an axios client wrapped in
     * MockAdapter from axios-mock-adapter.
     *
     * @returns {HttpClient} An HttpClient wrapped in MockAdapter.
     */
    _defineProperty(this, "getAuthenticatedHttpClient", jest.fn(function () {
      return _this.authenticatedHttpClient;
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Gets the unauthenticated HTTP client instance, which is an axios client wrapped in
     * MockAdapter from axios-mock-adapter.
     *
     * @returns {HttpClient} An HttpClient wrapped in MockAdapter.
     */
    _defineProperty(this, "getHttpClient", jest.fn(function () {
      return _this.httpClient;
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Builds a URL to the login page with a post-login redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLoginRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/login?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */
    _defineProperty(this, "getLoginRedirectUrl", jest.fn(function () {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
      return "".concat(_this.config.LOGIN_URL, "?next=").concat(encodeURIComponent(redirectUrl));
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Redirects the user to the logout page in the real implementation.  Is a no-op here.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */
    _defineProperty(this, "redirectToLogin", jest.fn(function () {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
      // Do nothing after getting the URL - this preserves the calls properly, but doesn't redirect.
      _this.getLoginRedirectUrl(redirectUrl);
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Builds a URL to the logout page with a post-logout redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLogoutRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/logout?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */
    _defineProperty(this, "getLogoutRedirectUrl", jest.fn(function () {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
      return "".concat(_this.config.LOGOUT_URL, "?redirect_url=").concat(encodeURIComponent(redirectUrl));
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Redirects the user to the logout page in the real implementation.  Is a no-op here.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */
    _defineProperty(this, "redirectToLogout", jest.fn(function () {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
      // Do nothing after getting the URL - this preserves the calls properly, but doesn't redirect.
      _this.getLogoutRedirectUrl(redirectUrl);
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * If it exists, returns the user data representing the currently authenticated user. If the
     * user is anonymous, returns null.
     *
     * @returns {UserData|null}
     */
    _defineProperty(this, "getAuthenticatedUser", jest.fn(function () {
      return _this.authenticatedUser;
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Sets the authenticated user to the provided value.
     *
     * @param {UserData} authUser
     */
    _defineProperty(this, "setAuthenticatedUser", jest.fn(function (authUser) {
      _this.authenticatedUser = authUser;
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Returns the current authenticated user details, as supplied in the `authenticatedUser` field
     * of the config options.  Resolves to null if the user is unauthenticated / the config option
     * has not been set.
     *
     * @returns {UserData|null} Resolves to the user's access token if they are
     * logged in.
     */
    _defineProperty(this, "fetchAuthenticatedUser", jest.fn(function () {
      return _this.getAuthenticatedUser();
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Ensures a user is authenticated. It will redirect to login when not authenticated.
     *
     * @param {string} [redirectUrl=config.BASE_URL] to return user after login when not
     * authenticated.
     * @returns {UserData|null} Resolves to the user's access token if they are
     * logged in.
     */
    _defineProperty(this, "ensureAuthenticatedUser", jest.fn(function () {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
      _this.fetchAuthenticatedUser();
      if (_this.getAuthenticatedUser() === null) {
        // The user is not authenticated, send them to the login page.
        _this.redirectToLogin(redirectUrl);
      }
      return _this.getAuthenticatedUser();
    }));
    /**
     * A Jest mock function (jest.fn())
     *
     * Adds the user data supplied in the `hydratedAuthenticatedUser` config option into the object
     * returned by `getAuthenticatedUser`.  This emulates the behavior of a real auth service which
     * would make a request to fetch this data prior to merging it in.
     *
     * ```
     * console.log(authenticatedUser); // Will be sparse and only contain basic information.
     * await hydrateAuthenticatedUser()
     * const authenticatedUser = getAuthenticatedUser();
     * console.log(authenticatedUser); // Will contain additional user information
     * ```
     *
     * @returns {Promise<null>}
     */
    _defineProperty(this, "hydrateAuthenticatedUser", jest.fn(function () {
      var user = _this.getAuthenticatedUser();
      if (user !== null) {
        _this.setAuthenticatedUser(_objectSpread(_objectSpread({}, user), _this.hydratedAuthenticatedUser));
      }
    }));
    this.authenticatedHttpClient = null;
    this.httpClient = null;
    ensureDefinedConfig(options, 'AuthService');
    PropTypes.checkPropTypes(optionsPropTypes, options, 'options', 'AuthService');
    this.config = options.config;
    this.loggingService = options.loggingService;

    // Mock user
    this.authenticatedUser = this.config.authenticatedUser ? this.config.authenticatedUser : null;
    this.hydratedAuthenticatedUser = this.config.hydratedAuthenticatedUser ? this.config.hydratedAuthenticatedUser : {};
    this.authenticatedHttpClient = axios.create();
    this.httpClient = axios.create();
  }

  /**
   * A Jest mock function (jest.fn())
   *
   * Applies middleware to the axios instances in this service.
   *
   * @param {Array} middleware Middleware to apply.
   */
  return _createClass(MockAuthService, [{
    key: "applyMiddleware",
    value: function applyMiddleware() {
      var middleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var clients = [this.authenticatedHttpClient, this.httpClient, this.cachedAuthenticatedHttpClient, this.cachedHttpClient];
      try {
        middleware.forEach(function (middlewareFn) {
          clients.forEach(function (client) {
            return client && middlewareFn(client);
          });
        });
      } catch (error) {
        throw new Error("Failed to apply middleware: ".concat(error.message, "."));
      }
    }
  }]);
}();
export default MockAuthService;
//# sourceMappingURL=MockAuthService.js.map