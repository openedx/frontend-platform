import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';

// Apply the auth-related properties and functions to the Axios API client.
export default function applyAuthInterface(authenticatedAPIClient, authConfig) {
  /* eslint-disable no-param-reassign */
  authenticatedAPIClient.appBaseUrl = authConfig.appBaseUrl;
  authenticatedAPIClient.accessTokenCookieName = authConfig.accessTokenCookieName;
  authenticatedAPIClient.csrfCookieName = authConfig.csrfCookieName;
  authenticatedAPIClient.loginUrl = authConfig.loginUrl;
  authenticatedAPIClient.logoutUrl = authConfig.logoutUrl;
  authenticatedAPIClient.refreshAccessTokenEndpoint = authConfig.refreshAccessTokenEndpoint;
  /**
   * We will not try to refresh an expired access token before
   * making requests to these auth-related URLs.
   */
  authenticatedAPIClient.authUrls = [
    authenticatedAPIClient.refreshAccessTokenEndpoint,
  ];

  authenticatedAPIClient.getAuthenticationState = () => {
    const state = {};

    const token = authenticatedAPIClient.getDecodedAccessToken();
    if (token) {
      state.authentication = {
        email: token.email,
        username: token.preferred_username,
      };
    }

    return state;
  };

  authenticatedAPIClient.isAuthenticated = () => {
    const cookies = new Cookies();
    return !!cookies.get(authenticatedAPIClient.accessTokenCookieName);
  };

  authenticatedAPIClient.isAccessTokenExpired = () => {
    const token = authenticatedAPIClient.getDecodedAccessToken();
    // JWT expiration is serialized as seconds since the epoch,
    // Date.now returns the number of milliseconds since the epoch.
    return token && token.exp < Date.now() / 1000;
  };

  authenticatedAPIClient.login = (redirectUrl = authConfig.appBaseUrl) => {
    window.location.assign(`${authenticatedAPIClient.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
  };

  authenticatedAPIClient.logout = (redirectUrl = authConfig.appBaseUrl) => {
    window.location.assign(`${authenticatedAPIClient.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  authenticatedAPIClient.refreshAccessToken = () =>
    authenticatedAPIClient.post(authenticatedAPIClient.refreshAccessTokenEndpoint);

  authenticatedAPIClient.isAuthUrl = url =>
    authenticatedAPIClient.authUrls.includes(url);

  authenticatedAPIClient.getDecodedAccessToken = () => {
    const cookies = new Cookies();
    let decodedToken = null;
    try {
      decodedToken = jwtDecode(cookies.get(authenticatedAPIClient.accessTokenCookieName));
    } catch (error) {
      // empty
    }
    return decodedToken;
  };
  /* eslint-enable no-param-reassign */
}
