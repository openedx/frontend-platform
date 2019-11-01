import AccessToken from './AccessToken';
import CsrfTokens from './CsrfTokens';
import { logFrontendAuthError } from './utils';

// Apply the auth-related properties and functions to the Axios API client.
export default function applyAuthInterface(httpClient, authConfig) {
  /* eslint-disable no-param-reassign */
  httpClient.appBaseUrl = authConfig.appBaseUrl;
  httpClient.authBaseUrl = authConfig.authBaseUrl;
  httpClient.userInfoCookieName = authConfig.userInfoCookieName;
  httpClient.loginUrl = authConfig.loginUrl;
  httpClient.logoutUrl = authConfig.logoutUrl;
  httpClient.handleRefreshAccessTokenFailure = authConfig.handleRefreshAccessTokenFailure || (() => {
    httpClient.login();
  });

  httpClient.loggingService = authConfig.loggingService;

  httpClient.accessToken = new AccessToken({
    cookieName: authConfig.accessTokenCookieName,
    refreshEndpoint: authConfig.refreshAccessTokenEndpoint,
  });
  httpClient.csrfTokens = new CsrfTokens({
    csrfTokenApiPath: authConfig.csrfTokenApiPath,
  });

  /**
   * Ensures a user is authenticated, including redirecting to login when not authenticated.
   *
   * @param route: used to return user after login when not authenticated.
   * @returns Promise that resolves to { authenticatedUser: {...}, decodedAccessToken: {...}}
   */
  httpClient.ensureAuthenticatedUser = async (route) => {
    let authenticatedUserAccessToken = null;

    try {
      authenticatedUserAccessToken = await httpClient.accessToken.get();
    } catch (error) {
      // There were unexpected errors getting the access token.
      logFrontendAuthError(error);
      httpClient.logout();
      throw error;
    }

    if (authenticatedUserAccessToken === null) {
      const isRedirectFromLoginPage = global.document.referrer &&
        global.document.referrer.startsWith(httpClient.loginUrl);

      if (isRedirectFromLoginPage) {
        const redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
        logFrontendAuthError(redirectLoopError);
        throw redirectLoopError;
      }

      // The user is not authenticated, send them to the login page.
      httpClient.login(httpClient.appBaseUrl + route);
    }

    return authenticatedUserAccessToken;
  };

  httpClient.login = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
  };

  httpClient.logout = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };
}
