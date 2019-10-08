/* eslint-disable no-param-reassign */
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

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

  // Get a valid access token for authenticated API access.
  const { authenticatedUser, decodedAccessToken } =
    await app.apiClient.ensureAuthenticatedUser(global.location.pathname);
  // Once we have refreshed our authentication, extract it for use later.
  app.authenticatedUser = authenticatedUser;
  app.decodedAccessToken = decodedAccessToken;
}
