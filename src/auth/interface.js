// @ts-check
import PropTypes from 'prop-types';
import { publish } from '../pubSub.js';

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
 * @param {AuthServiceConstructor} AuthService
 * @param {AuthServiceOptions} options
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
 * @returns {Promise<UserData|null>} Resolves to the user's access token if they are
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
 * @typedef {import("axios").Axios} HttpClient
 */

/**
 * @typedef {Object} CustomErrorAttributes
 * @property {number} [httpErrorStatus]
 * @property {'unknown-api-request-error'|'api-response-error'|'api-request-error'|'api-request-config-error'
 * } [httpErrorType]
 * @property {string} [httpErrorMessage]
 * @property {string} [httpErrorRequestUrl]
 * @property {string} [httpErrorRequestMethod]
 * @property {any} [httpErrorResponseData]
 */

/**
 * @typedef {import("axios").AxiosError & {customAttributes: CustomErrorAttributes}} DetailedAxiosError
 */

/**
 * @typedef {Object} AuthService
 * @property {typeof getAuthenticatedHttpClient} getAuthenticatedHttpClient
 * @property {typeof getHttpClient} getHttpClient
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
 * @typedef {Object} AuthServiceOptions
 * @property {import('../config.js').ConfigDocument} config
 * @property {import('../logging/interface.js').LoggingService} loggingService
 * @property {((client: HttpClient) => void)[]} [middleware]
 */

/**
 * @typedef {new (options: AuthServiceOptions) => AuthService} AuthServiceConstructor
 */

/**
 * @typedef {Object} UserData
 * @property {string} userId
 * @property {string} email
 * @property {string} name
 * @property {string} username
 * @property {Array} roles
 * @property {boolean} administrator
 */
