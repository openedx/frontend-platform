import axios from 'axios';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';

import { processAxiosErrorAndThrow } from './utils';
import { camelCaseObject } from '../utils';
import {
  createCsrfTokenInterceptor,
  createJwtTokenInterceptor,
  createProcessAxiosRequestErrorInterceptor,
} from './interceptors';

const configShape = {
  configService: PropTypes.shape({
    getConfig: PropTypes.func.isRequired,
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
};

const isTokenExpired = token => !token || token.exp < Date.now() / 1000;

export default class AxiosJwtAuthService {
  /**
   * Configures an httpClient with JWT authentication to make authenticated http requests.
   *
   * @param {object} config
   * @param {ConfigService} [config.configService]
   * @param {LoggingService} [config.loggingService]
   */
  constructor(config) {
    PropTypes.checkPropTypes(configShape, config, 'config', 'AuthService');
    this.configService = config.configService;
    this.loggingService = config.loggingService;
    this.authenticatedUser = null;
    this.refreshRequestPromises = {};
    this.cookies = new Cookies();
    this.httpClient = axios.create();
    this.authenticatedHttpClient = this.createAuthenticatedHttpClient();
    // Set withCredentials to true. Enables cross-site Access-Control requests
    // to be made using cookies, authorization headers or TLS client
    // certificates. More on MDN:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    this.httpClient.defaults.withCredentials = true;
  }

  /**
 * Redirect the user to login
 *
 * @param {string} redirectUrl the url to redirect to after login
 */
  redirectToLogin(redirectUrl = this.configService.getConfig().BASE_URL) {
    global.location.assign(`${this.configService.getConfig().LOGIN_URL}?next=${encodeURIComponent(redirectUrl)}`);
  }

  /**
   * Redirect the user to logout
   *
   * @param {string} redirectUrl the url to redirect to after logout
   */
  redirectToLogout(redirectUrl = this.configService.getConfig().BASE_URL) {
    global.location.assign(`${this.configService.getConfig().LOGOUT_URL}?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  /**
   * Reads the authenticated user's access token. Resolves to null if the user is
   * unauthenticated.
   *
   * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
   * logged in.
   */
  async fetchAuthenticatedUser() {
    const decodedAccessToken = await this.getJwtToken(
      this.configService.getConfig().ACCESS_TOKEN_COOKIE_NAME,
      this.configService.getConfig().REFRESH_ACCESS_TOKEN_ENDPOINT,
    );

    if (decodedAccessToken !== null) {
      this.authenticatedUser = {
        userId: decodedAccessToken.user_id,
        username: decodedAccessToken.preferred_username,
        roles: decodedAccessToken.roles || [],
        administrator: decodedAccessToken.administrator,
      };
    }

    return this.authenticatedUser;
  }

  /**
   * Ensures a user is authenticated. It will redirect to login when not
   * authenticated.
   *
   * @param {string} route to return user after login when not authenticated.
   * @returns {Promise<UserData>}
   */
  async ensureAuthenticatedUser(route) {
    await this.fetchAuthenticatedUser();

    if (this.authenticatedUser === null) {
      const isRedirectFromLoginPage = global.document.referrer &&
        global.document.referrer.startsWith(this.configService.getConfig().LOGIN_URL);

      if (isRedirectFromLoginPage) {
        const redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
        this.logFrontendAuthError(redirectLoopError);
        throw redirectLoopError;
      }

      // The user is not authenticated, send them to the login page.
      this.redirectToLogin(this.configService.getConfig().BASE_URL + route);
    }

    return this.authenticatedUser;
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
    if (this.authenticatedUser !== null) {
      const response = await this.authenticatedHttpClient
        .get(`${this.configService.getConfig().LMS_BASE_URL}/api/user/v1/accounts/${this.authenticatedUser.username}`);
      this.authenticatedUser = { ...this.authenticatedUser, ...camelCaseObject(response.data) };
    }
  }

  decodeJwtCookie() {
    const { ACCESS_TOKEN_COOKIE_NAME } = this.configService.getConfig();
    const cookieValue = this.cookies.get(ACCESS_TOKEN_COOKIE_NAME);

    if (cookieValue) {
      try {
        return jwtDecode(cookieValue);
      } catch (e) {
        const error = Object.create(e);
        error.message = 'Error decoding JWT token';
        error.customAttributes = { cookieValue };
        throw error;
      }
    }

    return null;
  }

  /**
   * Adds authentication defaults and interceptors to an http client instance.
   *
   * @param {HttpClient} httpClient
   * @param {object} config
   * @param {string} [config.refreshAccessTokenEndpoint]
   * @param {string} [config.accessTokenCookieName]
   * @param {string} [config.csrfTokenApiPath]
   * @returns {HttpClient} Singleton. A configured axios http client
   */
  createAuthenticatedHttpClient() {
    // TODO: This used to do Object.create(axios.create());  Why?
    const httpClient = axios.create();
    // Set withCredentials to true. Enables cross-site Access-Control requests
    // to be made using cookies, authorization headers or TLS client
    // certificates. More on MDN:
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    httpClient.defaults.withCredentials = true;

    // Axios request interceptors

    // The JWT access token interceptor attempts to refresh the user's jwt token
    // before any request unless the isPublic flag is set on the request config.
    const refreshAccessTokenInterceptor = createJwtTokenInterceptor({
      ACCESS_TOKEN_COOKIE_NAME: this.configService.getConfig().ACCESS_TOKEN_COOKIE_NAME,
      REFRESH_ACCESS_TOKEN_ENDPOINT: this.configService.getConfig().REFRESH_ACCESS_TOKEN_ENDPOINT,
      shouldSkip: axiosRequestConfig => axiosRequestConfig.isPublic,
      getJwtToken: this.getJwtToken.bind(this),
    });
    // The CSRF token intercepter fetches and caches a csrf token for any post,
    // put, patch, or delete request. That token is then added to the request
    // headers.
    const attachCsrfTokenInterceptor = createCsrfTokenInterceptor({
      CSRF_TOKEN_API_PATH: this.configService.getConfig().CSRF_TOKEN_API_PATH,
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
    httpClient.interceptors.request.use(attachCsrfTokenInterceptor);
    httpClient.interceptors.request.use(refreshAccessTokenInterceptor);

    // Axios response interceptors

    const processAxiosRequestErrorInterceptor = createProcessAxiosRequestErrorInterceptor({
      logInfo: this.loggingService.logInfo,
    });

    // Response interceptor: moves axios response error data into the error
    // object at error.customAttributes
    httpClient.interceptors.response.use(
      response => response,
      processAxiosRequestErrorInterceptor,
    );

    return httpClient;
  }

  refresh() {
    const {
      ACCESS_TOKEN_COOKIE_NAME,
      REFRESH_ACCESS_TOKEN_ENDPOINT,
    } = this.configService.getConfig();
    if (this.refreshRequestPromises[ACCESS_TOKEN_COOKIE_NAME] === undefined) {
      const makeRefreshRequest = async () => {
        let axiosResponse;
        try {
          try {
            axiosResponse = await this.httpClient.post(REFRESH_ACCESS_TOKEN_ENDPOINT);
          } catch (error) {
            processAxiosErrorAndThrow(error);
          }
        } catch (error) {
          const userIsUnauthenticated = error.response && error.response.status === 401;
          if (userIsUnauthenticated) {
            // Clean up the cookie if it exists to eliminate any situation
            // where the cookie is not expired but the jwt is expired.
            this.cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
            const decodedJwtToken = null;
            return decodedJwtToken;
          }

          // TODO: Network timeouts and other problems will end up in
          // this block of code. We could add logic for retrying token
          // refreshes if we wanted to.
          throw error;
        }

        const decodedJwtToken = this.decodeJwtCookie();

        if (!decodedJwtToken) {
          // This is an unexpected case. The refresh endpoint should
          // set the cookie that is needed. See ARCH-948 for more
          // information on a similar situation that was happening
          // prior to this refactor in Oct 2019.
          const error = new Error('Access token is still null after successful refresh.');
          error.customAttributes = { axiosResponse };
          throw error;
        }

        return decodedJwtToken;
      };

      this.refreshRequestPromises[ACCESS_TOKEN_COOKIE_NAME] = makeRefreshRequest().finally(() => {
        delete this.refreshRequestPromises[ACCESS_TOKEN_COOKIE_NAME];
      });
    }

    return this.refreshRequestPromises[ACCESS_TOKEN_COOKIE_NAME];
  }

  async getJwtToken() {
    try {
      const decodedJwtToken = this.decodeJwtCookie();
      if (!isTokenExpired(decodedJwtToken)) {
        return decodedJwtToken;
      }
    } catch (e) {
      // Log unexpected error and continue with attempt to refresh it.
      this.logFrontendAuthError(e);
    }

    try {
      return await this.refresh();
    } catch (e) {
      this.logFrontendAuthError(e);
      throw e;
    }
  }

  logFrontendAuthError(error) {
    const prefixedMessageError = Object.create(error);
    prefixedMessageError.message = `[frontend-auth] ${error.message}`;
    this.loggingService.logError(prefixedMessageError, prefixedMessageError.customAttributes);
  }
}
