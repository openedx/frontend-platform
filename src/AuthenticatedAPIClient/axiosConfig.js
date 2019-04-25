import PubSub from 'pubsub-js';
import Url from 'url-parse';
import { logAPIErrorResponse, logInfo } from '@edx/frontend-logging';

const ACCESS_TOKEN_REFRESH = 'ACCESS_TOKEN_REFRESH';
const CSRF_TOKEN_REFRESH = 'CSRF_TOKEN_REFRESH';
const CSRF_HEADER_NAME = 'X-CSRFToken';
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const csrfTokens = {};
let queueRequests = false;

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
  function ensureCsrfToken(request) {
    const originalRequest = request;
    const method = request.method.toUpperCase();
    const isCsrfExempt = authenticatedAPIClient.isCsrfExempt(originalRequest.url);
    if (!isCsrfExempt && CSRF_PROTECTED_METHODS.includes(method)) {
      const url = new Url(request.url);
      const { protocol } = url;
      const { host } = url;
      const csrfToken = csrfTokens[host];
      if (csrfToken) {
        request.headers[CSRF_HEADER_NAME] = csrfToken;
      } else {
        if (!queueRequests) {
          queueRequests = true;
          authenticatedAPIClient.getCsrfToken(protocol, host)
            .then((response) => {
              queueRequests = false;
              PubSub.publishSync(CSRF_TOKEN_REFRESH, response.data.csrfToken);
            });
        }

        return new Promise((resolve) => {
          logInfo(`Queuing API request ${originalRequest.url} while CSRF token is retrieved`);
          PubSub.subscribeOnce(CSRF_TOKEN_REFRESH, (msg, token) => {
            logInfo(`Resolving queued API request ${originalRequest.url}`);
            csrfTokens[host] = token;
            originalRequest.headers[CSRF_HEADER_NAME] = token;
            resolve(originalRequest);
          });
        });
      }
    }
    return request;
  }

  /**
   * Ensure the browser has an unexpired JWT cookie before making API requests.
   *
   * This will attempt to refresh the JWT cookie if a valid refresh token cookie exists.
   */
  function ensureValidJWTCookie(request) {
    const originalRequest = request;
    const isAuthUrl = authenticatedAPIClient.isAuthUrl(originalRequest.url);
    const accessToken = authenticatedAPIClient.getDecodedAccessToken();
    const tokenExpired = authenticatedAPIClient.isAccessTokenExpired(accessToken);
    if (isAuthUrl || !tokenExpired) {
      return request;
    }

    if (!queueRequests) {
      queueRequests = true;
      authenticatedAPIClient.refreshAccessToken()
        .then(() => {
          queueRequests = false;
          PubSub.publishSync(ACCESS_TOKEN_REFRESH);
        })
        .catch((error) => {
          logAPIErrorResponse(error, { errorFunctionName: 'ensureValidJWTCookie' });
          authenticatedAPIClient.logout();
        });
    }

    return new Promise((resolve) => {
      logInfo(`Queuing API request ${originalRequest.url} while access token is refreshed`);
      PubSub.subscribeOnce(ACCESS_TOKEN_REFRESH, () => {
        logInfo(`Resolving queued API request ${originalRequest.url}`);
        resolve(originalRequest);
      });
    });
  }

  // Redirect to the logout page if an unauthorized API response was received.
  function handleUnauthorizedAPIResponse(error) {
    const errorStatus = error && error.response && error.response.status;
    if (errorStatus === 401 || errorStatus === 403) {
      logAPIErrorResponse(error, { errorFunctionName: 'handleUnauthorizedAPIResponse' });
      authenticatedAPIClient.logout(authenticatedAPIClient.appBaseUrl);
    }
    return Promise.reject(error);
  }

  // Apply Axios interceptors
  authenticatedAPIClient.interceptors.request.use(
    ensureValidJWTCookie,
    error => Promise.reject(error),
  );
  authenticatedAPIClient.interceptors.request.use(
    ensureCsrfToken,
    error => Promise.reject(error),
  );
  authenticatedAPIClient.interceptors.response.use(
    response => response,
    handleUnauthorizedAPIResponse,
  );
}

export {
  applyAxiosDefaults,
  applyAxiosInterceptors,
};
