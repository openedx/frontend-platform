/* eslint-disable no-param-reassign */
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

import { getAuthenticatedUser } from '../frontendAuthWrapper';

export default async function authentication(app) {
  app.apiClient = getAuthenticatedAPIClient({
    appBaseUrl: app.config.BASE_URL,
    authBaseUrl: app.config.LMS_BASE_URL,
    loginUrl: app.config.LOGIN_URL,
    logoutUrl: app.config.LOGOUT_URL,
    csrfTokenApiPath: app.config.CSRF_TOKEN_API_PATH,
    refreshAccessTokenEndpoint: app.config.REFRESH_ACCESS_TOKEN_ENDPOINT,
    accessTokenCookieName: app.config.ACCESS_TOKEN_COOKIE_NAME,
    userInfoCookieName: app.config.USER_INFO_COOKIE_NAME,
    csrfCookieName: app.config.CSRF_COOKIE_NAME,
    loggingService: app.loggingService,
  });

  // Get a valid access token for authenticated API access.
  const accessToken =
    await app.apiClient.ensurePublicOrAuthenticationAndCookies(global.location.pathname);
  // Once we have refreshed our authentication, extract it for use later.
  app.authenticatedUser = getAuthenticatedUser(accessToken);
}
