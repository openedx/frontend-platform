import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';

// Apply the auth-related properties and functions to the Axios API client.
export default function applyAuthInterface(httpClient, authConfig) {
  /* eslint-disable no-param-reassign */
  httpClient.appBaseUrl = authConfig.appBaseUrl;
  httpClient.authBaseUrl = authConfig.authBaseUrl;
  httpClient.accessTokenCookieName = authConfig.accessTokenCookieName;
  httpClient.userInfoCookieName = authConfig.userInfoCookieName;
  httpClient.csrfTokenApiPath = authConfig.csrfTokenApiPath;
  httpClient.loginUrl = authConfig.loginUrl;
  httpClient.logoutUrl = authConfig.logoutUrl;
  httpClient.refreshAccessTokenEndpoint = authConfig.refreshAccessTokenEndpoint;
  httpClient.handleRefreshAccessTokenFailure = authConfig.handleRefreshAccessTokenFailure;
  httpClient.loggingService = authConfig.loggingService;

  /**
   * We will not try to refresh an expired access token before
   * making requests to these auth-related URLs.
   */
  httpClient.authUrls = [
    httpClient.refreshAccessTokenEndpoint,
  ];
  /**
   * We will not try to retrieve a CSRF token before
   * making requests to these CSRF-exempt URLS.
   */
  httpClient.csrfExemptUrls = [
    httpClient.refreshAccessTokenEndpoint,
  ];

  /**
   * WARNING: This function provides unreliable results.
   * TODO: ARCH-948: See for details on potential fix.
   */
  httpClient.getAuthenticationState = () => {
    const state = {};

    const token = httpClient.getDecodedAccessToken();
    if (token) {
      state.authentication = {
        userId: token.user_id,
        username: token.preferred_username,
        roles: token.roles,
        administrator: token.administrator,
      };
    }

    return state;
  };


  httpClient.ensurePublicOrAuthenticationAndCookies = (route, callback) => {
    if (httpClient.isRoutePublic(route)) {
      return callback();
    }
    return httpClient.ensureAuthenticationAndCookies(route, callback);
  };

  // JWT expiration is serialized as seconds since the epoch,
  // Date.now returns the number of milliseconds since the epoch.
  httpClient.isAccessTokenExpired = token => !token || token.exp < Date.now() / 1000;


  httpClient.login = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
  };

  httpClient.logout = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  httpClient.refreshAccessToken = () =>
    httpClient.post(httpClient.refreshAccessTokenEndpoint);

  httpClient.isAuthUrl = url =>
    httpClient.authUrls.includes(url);

  httpClient.getDecodedAccessToken = () => {
    const cookies = new Cookies();
    let decodedToken = null;
    /* istanbul ignore next */
    try {
      const cookieValue = cookies.get(httpClient.accessTokenCookieName);
      try {
        decodedToken = jwtDecode(cookieValue);
      } catch (error) {
        if (httpClient.loggingService && httpClient.loggingService.logInfo) {
          httpClient.loggingService.logInfo(
            'Error decoding JWT token.',
            {
              jwtDecodeError: error,
              cookieValue,
            },
          );
        }
      }
    } catch (error) {
      httpClient.loggingService.logInfo(`Error reading the cookie: ${httpClient.accessTokenCookieName}.`);
    }

    return decodedToken;
  };

  httpClient.getCsrfToken = (apiProtocol, apiHost) =>
    httpClient.get(`${apiProtocol}//${apiHost}${httpClient.csrfTokenApiPath}`);

  httpClient.isCsrfExempt = url =>
    httpClient.csrfExemptUrls.includes(url);

  httpClient.ensureAuthenticationAndCookies = (route, callback) => {
    // Validate auth-related cookies are in a consistent state.
    const accessToken = httpClient.getDecodedAccessToken();
    const tokenExpired = httpClient.isAccessTokenExpired(accessToken);
    if (tokenExpired) {
      // Attempt to refresh the JWT cookies.
      return httpClient.refreshAccessToken()
        // Successfully refreshed the JWT cookies, fire the callback function.
        .then((response) => {
          const refreshedAccessToken = httpClient.getDecodedAccessToken();

          /* istanbul ignore next */
          if (refreshedAccessToken === null) {
            // This is the success block for refreshing an access token.
            // Sometimes the access token is null for an unknown reason.
            // Log here to learn more.
            if (httpClient.loggingService && httpClient.loggingService.logError) {
              httpClient.loggingService.logError(
                new Error('Access token is null after refresh.'),
                {
                  previousAccessToken: accessToken,
                  axiosResponse: response,
                },
              );

              // Wait some time and check again.
              // Maybe we're in a race to set the cookie?
              const checkForAccessTokenAfterDelay = (delay) => {
                setTimeout(() => {
                  const delayedRefreshAccessToken = httpClient.getDecodedAccessToken();
                  httpClient.loggingService.logInfo(
                    `Access token check after ${delay}ms after null refresh token: ${delayedRefreshAccessToken !== null}`,
                    {
                      delayedRefreshAccessTokenIsNotNull: delayedRefreshAccessToken !== null,
                      delayedRefreshAccessToken,
                      refreshedAccessToken,
                      accessToken,
                    },
                  );
                }, delay);
              };

              checkForAccessTokenAfterDelay(50);
              checkForAccessTokenAfterDelay(500);
            }
          }

          // TODO: Determine what to do in the case that the token is still null.
          callback(refreshedAccessToken);
        })
        .catch(() => {
          // The user is not authenticated, send them to the login page.
          httpClient.login(httpClient.appBaseUrl + route);
        });
    }
    // We already have valid JWT cookies, fire the callback function.
    return callback(accessToken);
  };

  httpClient.isRoutePublic = route => /^\/public.*$/.test(route);
  /* eslint-enable no-param-reassign */
}
