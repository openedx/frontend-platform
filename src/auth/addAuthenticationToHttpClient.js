import {
  csrfTokenProviderInterceptor,
  jwtTokenProviderInterceptor,
  processAxiosRequestErrorInterceptor,
} from './axiosInterceptors';

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
function addAuthenticationToHttpClient(_httpClient, config) {
  const httpClient = Object.create(_httpClient);
  // Set withCredentials to true. Enables cross-site Access-Control requests
  // to be made using cookies, authorization headers or TLS client
  // certificates. More on MDN:
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
  httpClient.defaults.withCredentials = true;

  // Axios interceptors

  // The JWT access token interceptor attempts to refresh the user's jwt token
  // before any request unless the isPublic flag is set on the request config.
  const refreshAccessTokenInterceptor = jwtTokenProviderInterceptor({
    tokenCookieName: config.accessTokenCookieName,
    tokenRefreshEndpoint: config.refreshAccessTokenEndpoint,
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
  httpClient.interceptors.request.use(attachCsrfTokenInterceptor);
  httpClient.interceptors.request.use(refreshAccessTokenInterceptor);

  // Response interceptor: moves axios response error data into the error
  // object at error.customAttributes
  httpClient.interceptors.response.use(
    response => response,
    processAxiosRequestErrorInterceptor,
  );

  return httpClient;
}

export default addAuthenticationToHttpClient;
