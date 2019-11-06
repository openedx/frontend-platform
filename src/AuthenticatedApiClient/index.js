import axios from 'axios';
import {
  csrfTokenProviderInterceptor,
  jwtTokenProviderInterceptor,
  processAxiosRequestErrorInterceptor,
} from './axiosInterceptors';
import { logFrontendAuthError } from './utils';
import getJwtToken from './getJwtToken';

let authenticatedApiClient = null;
let config = null;

function configure(incomingConfig) {
  [
    'appBaseUrl',
    'loginUrl',
    'logoutUrl',
    'loggingService',
    'refreshAccessTokenEndpoint',
    'accessTokenCookieName',
    'csrfTokenApiPath',
  ].forEach((key) => {
    if (incomingConfig[key] === undefined) {
      throw new Error(`Invalid configuration supplied to frontend auth. ${key} is required.`);
    }
  });

  // validate the logging service
  [
    'logInfo',
    'logError',
  ].forEach((key) => {
    if (incomingConfig.loggingService[key] === undefined) {
      throw new Error(`Invalid configuration supplied to frontend auth. loggingService.${key} must be a function.`);
    }
  });

  config = incomingConfig;
}

function getConfig() {
  return config;
}

/**
 * Redirect the user to login
 *
 * @param {string} redirectUrl the url to redirect to after login
 */
const redirectToLogin = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
};

/**
 * Redirect the user to logout
 *
 * @param {string} redirectUrl the url to redirect to after logout
 */
const redirectToLogout = (redirectUrl = config.appBaseUrl) => {
  global.location.assign(`${config.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
};

const handleUnexpectedAccessTokenRefreshError = (error) => {
  // There were unexpected errors getting the access token.
  logFrontendAuthError(error);
  throw error;
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
 * Gets the apiClient singleton which is an axios instance.
 * 
 * @param {object} config 
 * @param {string} [config.appBaseUrl]
 * @param {string} [config.authBaseUrl]
 * @param {string} [config.loginUrl]
 * @param {string} [config.logoutUrl]
 * @param {object} [config.loggingService] requires logError and logInfo methods
 * @param {string} [config.refreshAccessTokenEndpoint]
 * @param {string} [config.accessTokenCookieName]
 * @param {string} [config.csrfTokenApiPath]
 * @returns {HttpClient} Singleton. A configured axios http client
 */
function getAuthenticatedApiClient(authConfig) {
  if (authenticatedApiClient === null) {
    configure(authConfig);
    authenticatedApiClient = axios.create();
    // Set withCredentials to true. Enables cross-site Access-Control requests
    // to be made using cookies, authorization headers or TLS client
    // certificates. More on MDN: 
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    authenticatedApiClient.defaults.withCredentials = true;

    // Axios interceptors

    // The JWT access token interceptor attempts to refresh the user's jwt token
    // before any request unless the isPublic flag is set on the request config.
    const refreshAccessTokenInterceptor = jwtTokenProviderInterceptor({
      tokenCookieName: config.accessTokenCookieName,
      tokenRefreshEndpoint: config.refreshAccessTokenEndpoint,
      handleUnexpectedRefreshError: handleUnexpectedAccessTokenRefreshError,
      shouldSkip: axiosRequestConfig => axiosRequestConfig.isPublic,
    });
    // The CSRF token intercepter fetches and caches a csrf token for any post,
    // put, patch, or delete request. That token is then added to the request
    // headers.
    const attachCsrfTokenInterceptor = csrfTokenProviderInterceptor({
      csrfTokenApiPath: config.csrfTokenApiPath,
      shouldSkip: (axiosRequestConfig) => {
        const { method, isCsrfExempt } = axiosRequestConfig;
        const CSRF_PROTECTED_METHODS = ['post', 'put', 'patch', 'delete'];
        return isCsrfExempt || !CSRF_PROTECTED_METHODS.includes(method);
      },
    });

    // Request interceptors: Axios runs the interceptors in reverse order from
    // how they are listed. After fetching csrf tokens no longer require jwt
    // authentication, it won't matter which happens first. This change is
    // coming soon in edx-platform. Nov. 2019
    authenticatedApiClient.interceptors.request.use(attachCsrfTokenInterceptor);
    authenticatedApiClient.interceptors.request.use(refreshAccessTokenInterceptor);

    // Response interceptor: moves axios response error data into the error
    // object at error.customAttributes
    authenticatedApiClient.interceptors.response.use(
      response => response,
      processAxiosRequestErrorInterceptor,
    );
  }

  return authenticatedApiClient;
}

/**
 * @typedef UserData
 * @property {string} userId
 * @property {string} username
 * @property {array} roles
 * @property {bool} administrator
 */

/**
 * Gets the authenticated user's access token. Resolves to null if the user is
 * unauthenticated.
 *
 * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are logged in.
 */
const getAuthenticatedUser = async () => {
  let decodedAccessToken;

  try {
    decodedAccessToken = await getJwtToken(config.accessTokenCookieName, config.refreshAccessTokenEndpoint);
  } catch (error) {
    // There were unexpected errors getting the access token.
    handleUnexpectedAccessTokenRefreshError(error);
  }

  if (decodedAccessToken !== null) {
    return {
      userId: decodedAccessToken.user_id,
      username: decodedAccessToken.preferred_username,
      roles: decodedAccessToken.roles || [],
      administrator: decodedAccessToken.administrator,
    };
  }

  return null;
};

/**
 * Ensures a user is authenticated. It will redirect to login when not 
 * authenticated.
 *
 * @param {string} route to return user after login when not authenticated.
 * @returns {Promise<UserData>}
 */
const ensureAuthenticatedUser = async (route) => {
  const authenticatedUserData = await getAuthenticatedUser();

  if (authenticatedUserData === null) {
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

  return authenticatedUserData;
};

export {
  configure,
  getConfig,
  getAuthenticatedApiClient,
  ensureAuthenticatedUser,
  getAuthenticatedUser,
  redirectToLogin,
  redirectToLogout,
};
