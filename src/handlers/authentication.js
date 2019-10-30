/* eslint-disable no-param-reassign */
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

import { loginRedirect, getAuthenticatedUserAccount } from '../data/service';

export default async function authentication(app) {
  app.apiClient = getAuthenticatedAPIClient({
    appBaseUrl: app.config.BASE_URL,
    authBaseUrl: app.config.LMS_BASE_URL,
    accessTokenCookieName: app.config.ACCESS_TOKEN_COOKIE_NAME,
    userInfoCookieName: app.config.USER_INFO_COOKIE_NAME,
    csrfTokenApiPath: app.config.CSRF_TOKEN_API_PATH,
    loginUrl: app.config.LOGIN_URL,
    logoutUrl: app.config.LOGOUT_URL,
    refreshAccessTokenEndpoint: app.config.REFRESH_ACCESS_TOKEN_ENDPOINT,
    loggingService: app.loggingService,
  });

  // NOTE: Remove this "attach" line once frontend-auth gets its own getAuthenticatedUser method.
  // eslint-disable-next-line no-use-before-define
  attachGetAuthenticatedUser(app.apiClient);

  // Get a valid access token for authenticated API access.
  const { authenticatedUser, decodedAccessToken } =
    await app.apiClient.getAuthenticatedUser(global.location.pathname);

  // Once we have refreshed our authentication, extract it for use later.
  app.authenticatedUser = authenticatedUser;
  app.decodedAccessToken = decodedAccessToken;

  if (app.requireAuthenticatedUser && app.authenticatedUser === null) {
    loginRedirect();
  }

  if (app.authenticatedUser !== null && app.hydrateAuthenticatedUser) {
    getAuthenticatedUserAccount().then((user) => {
      app.authenticatedUser = Object.assign({}, app.authenticatedUser, user);
    });
  }
}

// NOTE: Remove everything below here when frontend-auth gets its own getAuthenticatedUser method.
/* istanbul ignore next */
function getAuthenticatedUserFromDecodedAccessToken(decodedAccessToken) {
  /* istanbul ignore next */
  if (decodedAccessToken === null) {
    throw new Error('Decoded access token is required to get authenticated user.');
  }

  return {
    userId: decodedAccessToken.user_id,
    username: decodedAccessToken.preferred_username,
    roles: decodedAccessToken.roles ? decodedAccessToken.roles : [],
    administrator: decodedAccessToken.administrator,
  };
}
/* istanbul ignore next */
function formatAuthenticatedResponse(decodedAccessToken) {
  return {
    authenticatedUser: getAuthenticatedUserFromDecodedAccessToken(decodedAccessToken),
    decodedAccessToken,
  };
}
/* istanbul ignore next */
function attachGetAuthenticatedUser(httpClient) {
  // Bail if there's a real implementation of getAuthenticatedUser
  if (httpClient.getAuthenticatedUser !== undefined) {
    return;
  }

  httpClient.getAuthenticatedUser = () =>
    new Promise((resolve, reject) => {
      // Validate auth-related cookies are in a consistent state.
      const accessToken = httpClient.getDecodedAccessToken();
      const tokenExpired = httpClient.isAccessTokenExpired(accessToken);
      if (!tokenExpired) {
        // We already have valid JWT cookies
        resolve(formatAuthenticatedResponse(accessToken));
      }
      // Attempt to refresh the JWT cookies.
      httpClient
        .refreshAccessToken()
        // Successfully refreshed the JWT cookies
        .then((response) => {
          const refreshedAccessToken = httpClient.getDecodedAccessToken();

          if (refreshedAccessToken === null) {
            // This should never happen, but it does. See ARCH-948 for past research into why.
            const errorMessage = 'Access token is null after supposedly successful refresh.';
            httpClient.loggingService.logError(`frontend-auth: ${errorMessage}`, {
              previousAccessToken: accessToken,
              axiosResponse: response,
            });
            reject(new Error(errorMessage));
            return;
          }

          resolve(formatAuthenticatedResponse(refreshedAccessToken));
        }).catch((e) => {
          if (e.response.status === 401) {
            return resolve({
              authenticatedUser: null,
              decodedAccessToken: null,
            });
          }
          return reject(e);
        });
    });
}
