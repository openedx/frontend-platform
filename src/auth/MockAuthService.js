import axios from 'axios';
import PropTypes from 'prop-types';
import { ensureDefinedConfig } from '../utils';

const userPropTypes = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  administrator: PropTypes.boolean,
});

const optionsPropTypes = {
  config: PropTypes.shape({
    BASE_URL: PropTypes.string.isRequired,
    LMS_BASE_URL: PropTypes.string.isRequired,
    LOGIN_URL: PropTypes.string.isRequired,
    LOGOUT_URL: PropTypes.string.isRequired,
    REFRESH_ACCESS_TOKEN_ENDPOINT: PropTypes.string.isRequired,
    ACCESS_TOKEN_COOKIE_NAME: PropTypes.string.isRequired,
    CSRF_TOKEN_API_PATH: PropTypes.string.isRequired,
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
  // The absence of authenticatedUser means the user is anonymous.
  authenticatedUser: userPropTypes,
  // Must be at least a valid user, but may have other fields.
  hydratedAuthenticatedUser: userPropTypes,
};

/**
 * The MockAuthService class mocks authenticated user-fetching logic and allows for manually
 * setting user data.  It is compatible with axios-mock-adapter to wrap its HttpClients so that
 * they can be mocked for development and testing.  In an application, it could be used to
 * temporarily override the "real" auth service:
 *
 * ```
 * import {
 *   initialize,
 *   APP_AUTH_INITIALIZED,
 *   subscribe,
 *   mergeConfig,
 * } from '@edx/frontend-platform';
 * import { MockAuthService } from '@edx/frontend-platform/auth';
 * import MockAdapter from 'axios-mock-adapter';
 *
 * initialize({
 *   handlers: {
 *     config: () => {
 *       mergeConfig({
 *         authenticatedUser: {
 *           userId: 'abc123',
 *           username: 'Mock User',
 *           roles: [],
 *           administrator: false,
 *         },
 *         hydratedAuthenticatedUser: {
 *           // Additional user props expected to be returned from a user accounts API, providing
 *           // additional user details beyond those present in the JWT.  This data is added into
 *           // the user object if and when hydrateAuthenticatedUser is called.  See documentation
 *           // for `hydrateAuthenticatedUser` for more details.
 *         }
 *       });
 *     },
 *   },
 *   messages: [],
 *   authService: MockAuthService,
 * });
 *
 * subscribe(APP_AUTH_INITIALIZED, () => {
 *   // This variable is now a MockAdapter from axios-mock-adapter, allowing onGet, onPost, etc.
 *   // mocking.  This handler will be called prior to any further initialization.  See the
 *   // "Application Initialization" phases in the README for call order details.
 *   const mockAdapter = new MockAdapter(getAuthenticatedHttpClient());
 *   // Mock calls here.
 *   mockAdapter.onGet(...);
 * });
 * ```
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
 * NOTE: The login/logout methods related to redirecting currently maintain their real behaviors.  A
 * subsequent update to this mock service could allow them to be configured/mocked via the
 * constructor's config options.
 *
 * @implements {AuthService}
 * @memberof module:Auth
 */
class MockAuthService {
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
  constructor(options) {
    this.authenticatedHttpClient = null;
    this.httpClient = null;

    ensureDefinedConfig(options, 'AuthService');
    PropTypes.checkPropTypes(optionsPropTypes, options, 'options', 'AuthService');

    this.config = options.config;
    this.loggingService = options.loggingService;

    // Mock user
    this.authenticatedUser = this.config.authenticatedUser ? this.config.authenticatedUser : null;
    this.hydratedAuthenticatedUser = this.config.hydratedAuthenticatedUser ?
      this.config.hydratedAuthenticatedUser : {};

    this.authenticatedHttpClient = axios.create();
    this.httpClient = axios.create();
  }

  /**
   * Gets the authenticated HTTP client instance, which is an axios client wrapped in
   * MockAdapter from axios-mock-adapter.
   *
   * @returns {HttpClient} An HttpClient wrapped in MockAdapter.
   */
  getAuthenticatedHttpClient() {
    return this.authenticatedHttpClient;
  }

  /**
   * Gets the unauthenticated HTTP client instance, which is an axios client wrapped in
   * MockAdapter from axios-mock-adapter.
   *
   * @returns {HttpClient} An HttpClient wrapped in MockAdapter.
   */
  getHttpClient() {
    return this.httpClient;
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
  getLoginRedirectUrl(redirectUrl = this.config.BASE_URL) {
    return `${this.config.LOGIN_URL}?next=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Redirects the user to the login page.
   *
   * @param {string} redirectUrl The URL the user should be redirected to after logging in.
   */
  redirectToLogin(redirectUrl = this.config.BASE_URL) {
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
  getLogoutRedirectUrl(redirectUrl = this.config.BASE_URL) {
    return `${this.config.LOGOUT_URL}?redirect_url=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Redirects the user to the logout page.
   *
   * @param {string} redirectUrl The URL the user should be redirected to after logging out.
   */
  redirectToLogout(redirectUrl = this.config.BASE_URL) {
    global.location.assign(this.getLogoutRedirectUrl(redirectUrl));
  }

  /**
   * If it exists, returns the user data representing the currently authenticated user. If the
   * user is anonymous, returns null.
   *
   * @returns {UserData|null}
   */
  getAuthenticatedUser() {
    return this.authenticatedUser;
  }

  /**
   * Sets the authenticated user to the provided value.
   *
   * @param {UserData} authUser
   * @emits AUTHENTICATED_USER_CHANGED
   */
  setAuthenticatedUser(authUser) {
    this.authenticatedUser = authUser;
  }

  /**
   * Returns the current authenticated user details, as supplied in the `authenticatedUser` field
   * of the config options.  Resolves to null if the user is unauthenticated / the config option
   * has not been set.
   *
   * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
   * logged in.
   */
  async fetchAuthenticatedUser() {
    return this.getAuthenticatedUser();
  }

  /**
   * Ensures a user is authenticated. It will redirect to login when not authenticated.
   *
   * @param {string} [redirectUrl=config.BASE_URL] to return user after login when not
   * authenticated.
   * @returns {Promise<UserData>}
   */
  async ensureAuthenticatedUser(redirectUrl = this.config.BASE_URL) {
    await this.fetchAuthenticatedUser();

    if (this.getAuthenticatedUser() === null) {
      // The user is not authenticated, send them to the login page.
      this.redirectToLogin(redirectUrl);
    }

    return this.getAuthenticatedUser();
  }

  /**
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
  async hydrateAuthenticatedUser() {
    const user = this.getAuthenticatedUser();
    if (user !== null) {
      this.setAuthenticatedUser({ ...user, ...this.hydratedAuthenticatedUser });
    }
  }
}

export default MockAuthService;
