/**
 * #### Import members from **@edx/frontend-platform/auth**
 * Simplifies the process of making authenticated API requests to backend edX services by providing
 * common authN/authZ client code that enables the login/logout flow and handles ensuring the
 * presence of a valid [JWT cookie](https://github.com/edx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst).
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
 * const {
 *   BASE_URL,
 *   LMS_BASE_URL,
 *   LOGIN_URL,
 *   LOGOUT_URL,
 *   REFRESH_ACCESS_TOKEN_ENDPOINT,
 *   ACCESS_TOKEN_COOKIE_NAME,
 *   CSRF_TOKEN_API_PATH,
 * } = getConfig();
 *
 * configure({
 *   loggingService: getLoggingService(),
 *   config: {
 *     appBaseUrl: BASE_URL,
 *     lmsBaseUrl: LMS_BASE_URL,
 *     loginUrl: LOGIN_URL,
 *     logoutUrl: LOGOUT_URL,
 *     refreshAccessTokenEndpoint: REFRESH_ACCESS_TOKEN_ENDPOINT,
 *     accessTokenCookieName: ACCESS_TOKEN_COOKIE_NAME,
 *     csrfTokenApiPath: CSRF_TOKEN_API_PATH,
 *   }
 * });
 *
 * const authenticatedUser = await fetchAuthenticatedUser(); // validates and decodes JWT token
 * const authenticatedHttpClient = getAuthenticatedHttpClient();
 * const response = await getAuthenticatedHttpClient().get(`https://example.com/api/user/data/${authenticatedUser.username}`); // fetching from an authenticated API using user data
 * ```
 *
 * As shown in this example, auth depends on the configuration document and logging.
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
    appBaseUrl: PropTypes.string.isRequired,
    lmsBaseUrl: PropTypes.string.isRequired,
    loginUrl: PropTypes.string.isRequired,
    logoutUrl: PropTypes.string.isRequired,
    refreshAccessTokenEndpoint: PropTypes.string.isRequired,
    accessTokenCookieName: PropTypes.string.isRequired,
    csrfTokenApiPath: PropTypes.string.isRequired,
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
 *
 */
export function getAuthenticatedHttpClient() {
  return service.getAuthenticatedHttpClient();
}

/**
 *
 */
export function getHttpClient() {
  return service.getHttpClient();
}

/**
 *
 */
export function getLoginRedirectUrl(redirectUrl) {
  return service.getLoginRedirectUrl(redirectUrl);
}

/**
 *
 */
export function redirectToLogin(redirectUrl) {
  return service.redirectToLogin(redirectUrl);
}

/**
 *
 */
export function getLogoutRedirectUrl(redirectUrl) {
  return service.getLogoutRedirectUrl(redirectUrl);
}

/**
 *
 */
export function redirectToLogout(redirectUrl) {
  return service.redirectToLogout(redirectUrl);
}

/**
 *
 */
export function getAuthenticatedUser() {
  return service.getAuthenticatedUser();
}

/**
 *
 */
export function setAuthenticatedUser(authUser) {
  service.setAuthenticatedUser(authUser);
  publish(AUTHENTICATED_USER_CHANGED);
}

/**
 *
 */
export async function fetchAuthenticatedUser() {
  return service.fetchAuthenticatedUser();
}

/**
 *
 */
export async function ensureAuthenticatedUser(redirectUrl) {
  return service.ensureAuthenticatedUser(redirectUrl);
}

/**
 *
 */
export async function hydrateAuthenticatedUser() {
  return service.hydrateAuthenticatedUser();
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
