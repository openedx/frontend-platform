function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var MockAuthService =
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

  _defineProperty(this, "getAuthenticatedHttpClient", jest.fn(function () {
    return _this.authenticatedHttpClient;
  }));

  _defineProperty(this, "getHttpClient", jest.fn(function () {
    return _this.httpClient;
  }));

  _defineProperty(this, "getLoginRedirectUrl", jest.fn(function () {
    var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
    return "".concat(_this.config.LOGIN_URL, "?next=").concat(encodeURIComponent(redirectUrl));
  }));

  _defineProperty(this, "redirectToLogin", jest.fn(function () {
    var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;

    // Do nothing after getting the URL - this preserves the calls properly, but doesn't redirect.
    _this.getLoginRedirectUrl(redirectUrl);
  }));

  _defineProperty(this, "getLogoutRedirectUrl", jest.fn(function () {
    var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;
    return "".concat(_this.config.LOGOUT_URL, "?redirect_url=").concat(encodeURIComponent(redirectUrl));
  }));

  _defineProperty(this, "redirectToLogout", jest.fn(function () {
    var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;

    // Do nothing after getting the URL - this preserves the calls properly, but doesn't redirect.
    _this.getLogoutRedirectUrl(redirectUrl);
  }));

  _defineProperty(this, "getAuthenticatedUser", jest.fn(function () {
    return _this.authenticatedUser;
  }));

  _defineProperty(this, "setAuthenticatedUser", jest.fn(function (authUser) {
    _this.authenticatedUser = authUser;
  }));

  _defineProperty(this, "fetchAuthenticatedUser", jest.fn(function () {
    return _this.getAuthenticatedUser();
  }));

  _defineProperty(this, "ensureAuthenticatedUser", jest.fn(function () {
    var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.config.BASE_URL;

    _this.fetchAuthenticatedUser();

    if (_this.getAuthenticatedUser() === null) {
      // The user is not authenticated, send them to the login page.
      _this.redirectToLogin(redirectUrl);
    }

    return _this.getAuthenticatedUser();
  }));

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
  this.loggingService = options.loggingService; // Mock user

  this.authenticatedUser = this.config.authenticatedUser ? this.config.authenticatedUser : null;
  this.hydratedAuthenticatedUser = this.config.hydratedAuthenticatedUser ? this.config.hydratedAuthenticatedUser : {};
  this.authenticatedHttpClient = axios.create();
  this.httpClient = axios.create();
}
/**
 * A Jest mock function (jest.fn())
 *
 * Gets the authenticated HTTP client instance, which is an axios client wrapped in
 * MockAdapter from axios-mock-adapter.
 *
 * @returns {HttpClient} An HttpClient wrapped in MockAdapter.
 */
;

export default MockAuthService;
//# sourceMappingURL=MockAuthService.js.map