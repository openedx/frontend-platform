/**
 * @implements {AuthService}
 * @memberof module:Auth
 */

import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import addAuthenticationToHttpClient from './addAuthenticationToHttpClient';
import getJwtToken from './getJwtToken';
import { camelCaseObject, ensureDefinedConfig } from '../utils';

const optionsPropTypes = {
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

let loggingService = null;

export function getLoggingService() {
  return loggingService;
}

export default class AxiosJwtAuthService {
  /**
   * @param {Object} options
   * @param {Object} options.config
   * @param {string} options.config.appBaseUrl
   * @param {string} options.config.lmsBaseUrl
   * @param {string} options.config.loginUrl
   * @param {string} options.config.logoutUrl
   * @param {string} options.config.refreshAccessTokenEndpoint
   * @param {string} options.config.accessTokenCookieName
   * @param {string} options.config.csrfTokenApiPath
   * @param {Object} options.loggingService requires logError and logInfo methods
   */
  constructor(options) {
    this.authenticatedHttpClient = null;
    this.httpClient = null;
    this.authenticatedUser = null;

    ensureDefinedConfig(options, 'AuthService');
    PropTypes.checkPropTypes(optionsPropTypes, options, 'options', 'AuthService');

    this.config = options.config;
    // eslint-disable-next-line prefer-destructuring
    loggingService = options.loggingService;
    this.loggingService = options.loggingService;
    this.initialize();
  }

  /**
   * @ignore
   */
  initialize() {
    this.authenticatedHttpClient = addAuthenticationToHttpClient(axios.create(), this.config);
    this.httpClient = axios.create();
  }

  /**
   * @ignore
   * @returns {LoggingService}
   */
  getLoggingService() {
    return this.loggingService;
  }

  /**
   * Gets the authenticated HTTP client singleton which is an axios instance.
   *
   * @returns {HttpClient} Singleton. A configured axios http client
   */
  getAuthenticatedHttpClient() {
    return this.authenticatedHttpClient;
  }

  /**
   * Gets the unauthenticated HTTP lient singleton which is an axios instance.
   *
   * @returns {HttpClient} Singleton. A configured axios http client
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
  getLoginRedirectUrl(redirectUrl = this.config.appBaseUrl) {
    return `${this.config.loginUrl}?next=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Redirects the user to the login page.
   *
   * @param {string} redirectUrl The URL the user should be redirected to after logging in.
   */
  redirectToLogin(redirectUrl = this.config.appBaseUrl) {
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
  getLogoutRedirectUrl(redirectUrl = this.config.appBaseUrl) {
    return `${this.config.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Redirects the user to the logout page.
   *
   * @param {string} redirectUrl The URL the user should be redirected to after logging out.
   */
  redirectToLogout(redirectUrl = this.config.appBaseUrl) {
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
   * Reads the authenticated user's access token. Resolves to null if the user is
   * unauthenticated.
   *
   * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
   * logged in.
   */
  async fetchAuthenticatedUser() {
    const decodedAccessToken = await getJwtToken(
      this.config.accessTokenCookieName,
      this.config.refreshAccessTokenEndpoint,
    );

    if (decodedAccessToken !== null) {
      this.setAuthenticatedUser({
        userId: decodedAccessToken.user_id,
        username: decodedAccessToken.preferred_username,
        roles: decodedAccessToken.roles || [],
        administrator: decodedAccessToken.administrator,
      });
    }

    return this.getAuthenticatedUser();
  }

  /**
   * Ensures a user is authenticated. It will redirect to login when not
   * authenticated.
   *
   * @param {string} [redirectUrl=config.appBaseUrl] to return user after login when not
   * authenticated.
   * @returns {Promise<UserData>}
   */
  async ensureAuthenticatedUser(redirectUrl = this.config.appBaseUrl) {
    await this.fetchAuthenticatedUser();

    if (this.getAuthenticatedUser() === null) {
      const isRedirectFromLoginPage = global.document.referrer &&
        global.document.referrer.startsWith(this.config.loginUrl);

      if (isRedirectFromLoginPage) {
        const redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
        logFrontendAuthError(redirectLoopError);
        throw redirectLoopError;
      }

      // The user is not authenticated, send them to the login page.
      this.redirectToLogin(redirectUrl);

      const unauthorizedError = new Error('Failed to ensure the user is authenticated');
      unauthorizedError.isRedirecting = true;
      throw unauthorizedError;
    }

    return this.getAuthenticatedUser();
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
  async hydrateAuthenticatedUser() {
    const user = this.getAuthenticatedUser();
    if (user !== null) {
      const response = await this.authenticatedHttpClient
        .get(`${this.config.lmsBaseUrl}/api/user/v1/accounts/${user.username}`);
      this.setAuthenticatedUser({ ...user, ...camelCaseObject(response.data) });
    }
  }
}
