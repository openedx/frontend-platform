import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import addAuthenticationToHttpClient from './addAuthenticationToHttpClient';
import getJwtToken from './getJwtToken';
import { camelCaseObject, ensureDefinedConfig } from '../utils';

import { publish } from '../pubSub';

export const AUTHENTICATED_USER_TOPIC = 'AUTHENTICATED_USER';
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
 * @param {object} config
 * @param {string} [config.appBaseUrl]
 * @param {string} [config.lmsBaseUrl]
 * @param {string} [config.loginUrl]
 * @param {string} [config.logoutUrl]
 * @param {object} [config.loggingService] requires logError and logInfo methods
 * @param {string} [config.refreshAccessTokenEndpoint]
 * @param {string} [config.accessTokenCookieName]
 * @param {string} [config.csrfTokenApiPath]
 */
export const configure = (incomingConfig) => {
  ensureDefinedConfig(incomingConfig, 'AuthService');

  PropTypes.checkPropTypes(configPropTypes, incomingConfig, 'config', 'AuthService');
  config = incomingConfig;
  authenticatedHttpClient = addAuthenticationToHttpClient(axios.create(), config);
};

export const getLoggingService = () => config.loggingService;

/**
 * Gets the apiClient singleton which is an axios instance.
 *
 * @returns {HttpClient} Singleton. A configured axios http client
 */
export const getAuthenticatedHttpClient = () => authenticatedHttpClient;

/**
 * Redirect the user to login
 *
 * @param {string} redirectUrl the url to redirect to after login
 */
export const redirectToLogin = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
};

/**
 * Redirect the user to logout
 *
 * @param {string} redirectUrl the url to redirect to after logout
 */
export const redirectToLogout = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
};

/**
 * If it exists, returns the user data representing the currently authenticated user. If the user is
 * anonymous, returns null.
 *
 * @returns {UserData|null}
 */
export const getAuthenticatedUser = () => authenticatedUser;

/**
 * Sets the authenticated user to the provided value.
 *
 * @param {UserData|null}
 * @emits AUTHENTICATED_USER_CHANGED
 */
export const setAuthenticatedUser = (authUser) => {
  authenticatedUser = authUser;
  publish(AUTHENTICATED_USER_CHANGED);
};

/**
 * Reads the authenticated user's access token. Resolves to null if the user is
 * unauthenticated.
 *
 * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
 * logged in.
 */
export const fetchAuthenticatedUser = async () => {
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
};

/**
 * Ensures a user is authenticated. It will redirect to login when not
 * authenticated.
 *
 * @param {string} route to return user after login when not authenticated.
 * @returns {Promise<UserData>}
 */
export const ensureAuthenticatedUser = async (route) => {
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
    redirectToLogin(config.appBaseUrl + route);
  }

  return getAuthenticatedUser();
};

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
export const hydrateAuthenticatedUser = async () => {
  const user = getAuthenticatedUser();
  if (user !== null) {
    const response = await authenticatedHttpClient
      .get(`${config.lmsBaseUrl}/api/user/v1/accounts/${user.username}`);
    setAuthenticatedUser({ ...user, ...camelCaseObject(response.data) });
  }
};

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
 * @typedef HttpClient
 * @property {function} get
 * @property {function} head
 * @property {function} options
 * @property {function} delete (csrf protected)
 * @property {function} post (csrf protected)
 * @property {function} put (csrf protected)
 * @property {function} patch (csrf protected)
  */

/**
 * @typedef UserData
 * @property {string} userId
 * @property {string} username
 * @property {array} roles
 * @property {bool} administrator
 */
