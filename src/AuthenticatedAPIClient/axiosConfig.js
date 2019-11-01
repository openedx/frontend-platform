import { getLoggingService } from './index';
import { logFrontendAuthError } from './utils';

const CSRF_HEADER_NAME = 'X-CSRFToken';
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Apply default configuration options to the Axios HTTP client.
function applyAxiosDefaults(authenticatedAPIClient) {
  /* eslint-disable no-param-reassign */
  authenticatedAPIClient.defaults.withCredentials = true;
  authenticatedAPIClient.defaults.headers.common['USE-JWT-COOKIE'] = true;
  /* eslint-enable no-param-reassign */
}

// Apply auth-related interceptors to the Axios HTTP Client.
function applyAxiosInterceptors(authenticatedAPIClient) {
  /**
   * Ensure we have a CSRF token header when making POST, PUT, and DELETE requests.
   */
  function ensureCsrfTokenInterceptor(axiosRequestConfig) {
    const { url, method } = axiosRequestConfig;
    const isCsrfTokenRequired = CSRF_PROTECTED_METHODS.includes(method.toUpperCase());

    if (isCsrfTokenRequired) {
      return authenticatedAPIClient.csrfTokens.getTokenForUrl(url)
        .then((csrfToken) => {
          // eslint-disable-next-line no-param-reassign
          axiosRequestConfig.headers[CSRF_HEADER_NAME] = csrfToken;
          return axiosRequestConfig;
        });
    }

    return Promise.resolve(axiosRequestConfig);
  }

  function ensureValidJWTCookieInterceptor(axiosRequestConfig) {
    return authenticatedAPIClient.accessToken.get()
      .then((authenticatedUserAccessToken) => {
        if (authenticatedUserAccessToken === null) {
          authenticatedAPIClient.handleRefreshAccessTokenFailure(new Error('User is not authenticated'));
        }

        return axiosRequestConfig;
      })
      .catch((error) => {
        // There were unexpected errors getting the access token.
        logFrontendAuthError(error);
        authenticatedAPIClient.logout();
        throw error;
      });
  }

  // Log info for unauthorized API responses
  function handleUnauthorizedAPIResponse(error) {
    const response = error && error.response;
    const errorStatus = response && response.status;
    const requestUrl = response && response.config && response.config.url;

    switch (errorStatus) { // eslint-disable-line default-case
      case 401:
        getLoggingService().logInfo(`Unauthorized API response from ${requestUrl}`);
        break;
      case 403:
        getLoggingService().logInfo(`Forbidden API response from ${requestUrl}`);
        break;
    }

    return Promise.reject(error);
  }

  // Apply Axios interceptors
  // Axios runs the interceptors in reverse order from how they are listed.
  // ensureValidJWTCookie needs to run first to ensure the user is authenticated
  // before making the CSRF token request.
  authenticatedAPIClient.interceptors.request.use(ensureCsrfTokenInterceptor);
  authenticatedAPIClient.interceptors.request.use(ensureValidJWTCookieInterceptor);
  authenticatedAPIClient.interceptors.response.use(
    response => response,
    handleUnauthorizedAPIResponse,
  );
}

export {
  applyAxiosDefaults,
  applyAxiosInterceptors,
};
