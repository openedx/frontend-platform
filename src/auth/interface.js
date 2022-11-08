/**
 * #### Import members from **@edx/frontend-platform/auth**
 *
 * Simplifies the process of making authenticated API requests to backend edX services by providing
 * common authN/authZ client code that enables the login/logout flow and handles ensuring the
 * presence of a valid [JWT cookie](https://github.com/openedx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst).
 *
 * The `initialize` function performs much of the auth configuration for you.  If, however, you're
 * not using the `initialize` function, an authenticated API client can be created via:
 *
 * ```
 * import {
 *   configure,
 *   fetchAuthenticatedUser,
 *   getAuthenticatedHttpClient
 * } from '@edx/frontend-platform/auth';
 * import { getConfig } from '@edx/frontend-platform';
 * import { getLoggingService } from '@edx/frontend-platform/logging';
 *
 * configure({
 *   loggingService: getLoggingService(),
 *   config: getConfig(),
 * });
 *
 * const authenticatedUser = await fetchAuthenticatedUser(); // validates and decodes JWT token
 * const authenticatedHttpClient = getAuthenticatedHttpClient();
 * const response = await getAuthenticatedHttpClient().get(`https://example.com/api/user/data/${authenticatedUser.username}`); // fetching from an authenticated API using user data
 * ```
 *
 * As shown in this example, auth depends on the configuration document and logging.
 *
 * NOTE: The documentation for AxiosJwtAuthService is nearly the same as that for the top-level
 * auth interface, except that it contains some Axios-specific details.
 *
 * @module Auth
 */
import PropTypes from 'prop-types';
import { publish } from '../pubSub';

/**
 * @constant
 * @private
 */
export const AUTHENTICATED_USER_TOPIC = 'AUTHENTICATED_USER';

/**
 * Published when the authenticated user data changes.  This can happen when the authentication
 * service determines that the user is authenticated or anonymous, as well as when we fetch
 * additional user account data if the `hydrateAuthenticatedUser` flag has been set in the
 * `initialize` function.
 *
 * @event
 * @see {@link module:Initialization~initialize}
 */
export const AUTHENTICATED_USER_CHANGED = `${AUTHENTICATED_USER_TOPIC}.CHANGED`;

const optionsShape = {
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
};

const serviceShape = {
  getAuthenticatedHttpClient: PropTypes.func.isRequired,
  getHttpClient: PropTypes.func.isRequired,
  getLoginRedirectUrl: PropTypes.func.isRequired,
  redirectToLogin: PropTypes.func.isRequired,
  getLogoutRedirectUrl: PropTypes.func.isRequired,
  redirectToLogout: PropTypes.func.isRequired,
  getAuthenticatedUser: PropTypes.func.isRequired,
  setAuthenticatedUser: PropTypes.func.isRequired,
  fetchAuthenticatedUser: PropTypes.func.isRequired,
  ensureAuthenticatedUser: PropTypes.func.isRequired,
  hydrateAuthenticatedUser: PropTypes.func.isRequired,
};

let service;

/**
 *
 * @param {class} AuthService
 * @param {*} options
 * @returns {AuthService}
 */
export function configure(AuthService, options) {
  PropTypes.checkPropTypes(optionsShape, options, 'property', 'Auth');
  service = new AuthService(options);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'AuthService');
  return service;
}

/**
 *
 *
 * @returns {AuthService}
 */
export function getAuthService() {
  if (!service) {
    throw Error('You must first configure the auth service.');
  }

  return service;
}

/**
 *
 */
export function resetAuthService() {
  service = null;
}

/**
 * Gets the authenticated HTTP client for the service.
 *
 * @param {Object} [options] Optional options for how to configure the authenticated HTTP client
 * @param {boolean} [options.useCache] Whether to use front end caching for all requests made with the returned client
 *
 * @returns {HttpClient}
 */
export function getAuthenticatedHttpClient(options = {}) {
  return service.getAuthenticatedHttpClient(options);
}

/**
 * Gets the unauthenticated HTTP client for the service.
 *
 * @param {Object} [options] Optional options for how to configure the authenticated HTTP client
 * @param {boolean} [options.useCache] Whether to use front end caching for all requests made with the returned client
 *
 * @returns {HttpClient}
 */
export function getHttpClient(options = {}) {
  return service.getHttpClient(options);
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
export function getLoginRedirectUrl(redirectUrl) {
  return service.getLoginRedirectUrl(redirectUrl);
}

/**
 * Redirects the user to the login page.
 *
 * @param {string} redirectUrl The URL the user should be redirected to after logging in.
 */
export function redirectToLogin(redirectUrl) {
  return service.redirectToLogin(redirectUrl);
}

/**
 * Builds a URL to the logout page with a post-logout redirect URL attached as a query parameter.
 *
 * ```
 * const url = getLogoutRedirectUrl('http://localhost/mypage');
 * console.log(url); // http://localhost/logout?redirect_url=http%3A%2F%2Flocalhost%2Fmypage
 * ```
 *
 * @param {string} redirectUrl The URL the user should be redirected to after logging out.
 */
export function getLogoutRedirectUrl(redirectUrl) {
  return service.getLogoutRedirectUrl(redirectUrl);
}

/**
 * Redirects the user to the logout page.
 *
 * @param {string} redirectUrl The URL the user should be redirected to after logging out.
 */
export function redirectToLogout(redirectUrl) {
  return service.redirectToLogout(redirectUrl);
}

/**
 * If it exists, returns the user data representing the currently authenticated user. If the
 * user is anonymous, returns null.
 *
 * @returns {UserData|null}
 */
export function getAuthenticatedUser() {
  return service.getAuthenticatedUser();
}

/**
 * Sets the authenticated user to the provided value.
 *
 * @param {UserData} authUser
 * @emits AUTHENTICATED_USER_CHANGED
 */
export function setAuthenticatedUser(authUser) {
  service.setAuthenticatedUser(authUser);
  publish(AUTHENTICATED_USER_CHANGED);
}

/**
 * Reads the authenticated user's access token. Resolves to null if the user is
 * unauthenticated.
 *
 * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
 * logged in.
 */
export async function fetchAuthenticatedUser(options = {}) {
  return service.fetchAuthenticatedUser(options);
}

/**
 * Ensures a user is authenticated. It will redirect to login when not
 * authenticated.
 *
 * @param {string} [redirectUrl=config.BASE_URL] to return user after login when not
 * authenticated.
 * @returns {Promise<UserData>}
 */
export async function ensureAuthenticatedUser(redirectUrl) {
  return service.ensureAuthenticatedUser(redirectUrl);
}

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
 * @emits AUTHENTICATED_USER_CHANGED
 */
export async function hydrateAuthenticatedUser() {
  await service.hydrateAuthenticatedUser();
  publish(AUTHENTICATED_USER_CHANGED);
}

/**
 * @name AuthService
 * @interface
 * @memberof module:Auth
 * @property {function} getAuthenticatedHttpClient
 * @property {function} getHttpClient
 * @property {function} getLoginRedirectUrl
 * @property {function} redirectToLogin
 * @property {function} getLogoutRedirectUrl
 * @property {function} redirectToLogout
 * @property {function} getAuthenticatedUser
 * @property {function} setAuthenticatedUser
 * @property {function} fetchAuthenticatedUser
 * @property {function} ensureAuthenticatedUser
 * @property {function} hydrateAuthenticatedUser
 */

/**
 * A configured axios client. See axios docs for more
 * info https://github.com/axios/axios. All the functions
 * below accept isPublic and isCsrfExempt in the request
 * config options. Setting these to true will prevent this
 * client from attempting to refresh the jwt access token
 * or a csrf token respectively.
 *
 * ```
 *  // A public endpoint (no jwt token refresh)
 *  apiClient.get('/path/to/endpoint', { isPublic: true });
 * ```
 *
 * ```
 *  // A csrf exempt endpoint
 *  apiClient.post('/path/to/endpoint', { data }, { isCsrfExempt: true });
 * ```
 *
 * @name HttpClient
 * @interface
 * @memberof module:Auth
 * @property {function} get
 * @property {function} head
 * @property {function} options
 * @property {function} delete (csrf protected)
 * @property {function} post (csrf protected)
 * @property {function} put (csrf protected)
 * @property {function} patch (csrf protected)
 */

/**
 * @name UserData
 * @interface
 * @memberof module:Auth
 * @property {string} userId
 * @property {string} username
 * @property {Array} roles
 * @property {boolean} administrator
 */
