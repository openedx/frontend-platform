/**
 * @module Auth
 */

import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import addAuthenticationToHttpClient from './addAuthenticationToHttpClient';
import getJwtToken from './getJwtToken';
import { camelCaseObject, ensureDefinedConfig } from '../utils';

import { publish } from '../pubSub';

/**
 *
 */
export const AUTHENTICATED_USER_TOPIC = 'AUTHENTICATED_USER';

/**
 *
 */
export const AUTHENTICATED_USER_CHANGED = `${AUTHENTICATED_USER_TOPIC}.CHANGED`;

// Singletons
let authenticatedHttpClient = null;
let config = null;
let authenticatedUser = null;

const configPropTypes = {
  appBaseUrl: PropTypes.string.isRequired,
  lmsBaseUrl: PropTypes.string.isRequired,
  loginUrl: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired,
  refreshAccessTokenEndpoint: PropTypes.string.isRequired,
  accessTokenCookieName: PropTypes.string.isRequired,
  csrfTokenApiPath: PropTypes.string.isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * Configures an httpClient to make authenticated http requests.
 *
 * @param {Object} incomingConfig
 * @param {string} [incomingConfig.appBaseUrl]
 * @param {string} [incomingConfig.lmsBaseUrl]
 * @param {string} [incomingConfig.loginUrl]
 * @param {string} [incomingConfig.logoutUrl]
 * @param {Object} [incomingConfig.loggingService] requires logError and logInfo methods
 * @param {string} [incomingConfig.refreshAccessTokenEndpoint]
 * @param {string} [incomingConfig.accessTokenCookieName]
 * @param {string} [incomingConfig.csrfTokenApiPath]
 */
export function configure(incomingConfig) {
  ensureDefinedConfig(incomingConfig, 'AuthService');

  PropTypes.checkPropTypes(configPropTypes, incomingConfig, 'config', 'AuthService');
  config = incomingConfig;
  authenticatedHttpClient = addAuthenticationToHttpClient(axios.create(), config);
}


/**
 * @ignore
 * @returns {LoggingService}
 */
export function getLoggingService() {
  return config.loggingService;
}

/**
 * Gets the apiClient singleton which is an axios instance.
 *
 * @returns {HttpClient} Singleton. A configured axios http client
 */
export function getAuthenticatedHttpClient() {
  return authenticatedHttpClient;
}

/**
 * Redirect the user to login
 *
 * @param {string} redirectUrl the url to redirect to after login
 */
export function redirectToLogin(redirectUrl = config.appBaseUrl) {
  global.location.assign(`${config.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
}

/**
 * Redirect the user to logout
 *
 * @param {string} redirectUrl the url to redirect to after logout
 */
export function redirectToLogout(redirectUrl = config.appBaseUrl) {
  global.location.assign(`${config.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
}

/**
 * If it exists, returns the user data representing the currently authenticated user. If the user is
 * anonymous, returns null.
 *
 * @returns {UserData|null}
 */
export function getAuthenticatedUser() {
  return authenticatedUser;
}

/**
 * Sets the authenticated user to the provided value.
 *
 * @param {UserData} authUser
 * @emits AUTHENTICATED_USER_CHANGED
 */
export function setAuthenticatedUser(authUser) {
  authenticatedUser = authUser;
  publish(AUTHENTICATED_USER_CHANGED);
}

/**
 * Reads the authenticated user's access token. Resolves to null if the user is
 * unauthenticated.
 *
 * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
 * logged in.
 */
export async function fetchAuthenticatedUser() {
  const decodedAccessToken = await getJwtToken(
    config.accessTokenCookieName,
    config.refreshAccessTokenEndpoint,
  );

  if (decodedAccessToken !== null) {
    setAuthenticatedUser({
      userId: decodedAccessToken.user_id,
      username: decodedAccessToken.preferred_username,
      roles: decodedAccessToken.roles || [],
      administrator: decodedAccessToken.administrator,
    });
  }

  return getAuthenticatedUser();
}

/**
 * Ensures a user is authenticated. It will redirect to login when not
 * authenticated.
 *
 * @param {string} [redirectUrl=config.appBaseUrl] to return user after login when not
 * authenticated.
 * @returns {Promise<UserData>}
 */
export async function ensureAuthenticatedUser(redirectUrl = config.appBaseUrl) {
  await fetchAuthenticatedUser();

  if (getAuthenticatedUser() === null) {
    const isRedirectFromLoginPage = global.document.referrer &&
      global.document.referrer.startsWith(config.loginUrl);

    if (isRedirectFromLoginPage) {
      const redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
      logFrontendAuthError(redirectLoopError);
      throw redirectLoopError;
    }

    // The user is not authenticated, send them to the login page.
    redirectToLogin(redirectUrl);

    const unauthorizedError = new Error('Failed to ensure the user is authenticated');
    unauthorizedError.isRedirecting = true;
    throw unauthorizedError;
  }

  return getAuthenticatedUser();
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
 * @returns {Promise<null>}
 */
export async function hydrateAuthenticatedUser() {
  const user = getAuthenticatedUser();
  if (user !== null) {
    const response = await authenticatedHttpClient
      .get(`${config.lmsBaseUrl}/api/user/v1/accounts/${user.username}`);
    setAuthenticatedUser({ ...user, ...camelCaseObject(response.data) });
  }
}

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
 * @property {string} userId
 * @property {string} username
 * @property {Array} roles
 * @property {boolean} administrator
 */
