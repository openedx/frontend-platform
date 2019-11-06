/* eslint-disable no-param-reassign */
import { getAuthenticatedApiClient, getAuthenticatedUser } from '@edx/frontend-auth';

import { loginRedirect, getAuthenticatedUserAccount } from '../data/service';

export default async function authentication(app) {
  app.apiClient = getAuthenticatedApiClient({
    appBaseUrl: app.config.BASE_URL,
    accessTokenCookieName: app.config.ACCESS_TOKEN_COOKIE_NAME,
    csrfTokenApiPath: app.config.CSRF_TOKEN_API_PATH,
    loginUrl: app.config.LOGIN_URL,
    logoutUrl: app.config.LOGOUT_URL,
    refreshAccessTokenEndpoint: app.config.REFRESH_ACCESS_TOKEN_ENDPOINT,
    loggingService: app.loggingService,
  });

  // Get a valid access token for authenticated API access.
  const authenticatedUser = await getAuthenticatedUser();

  // Once we have refreshed our authentication, extract it for use later.
  app.authenticatedUser = authenticatedUser;

  if (app.requireAuthenticatedUser && app.authenticatedUser === null) {
    loginRedirect();
  }

  if (app.authenticatedUser !== null && app.hydrateAuthenticatedUser) {
    getAuthenticatedUserAccount().then((user) => {
      app.authenticatedUser = Object.assign({}, app.authenticatedUser, user);
    });
  }
}
