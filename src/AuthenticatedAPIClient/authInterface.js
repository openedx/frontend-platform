import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';

/**
 * Temporary helper function to log information about a missing access token.
 */
/* istanbul ignore next */
function logMissingAccessToken(httpClient, accessToken, response) {
  // This is the success block for refreshing an access token.
  // Sometimes the access token is null for an unknown reason.
  // Log here to learn more.
  httpClient.loggingService.logError(new Error('Access token is null after refresh.'), {
    previousAccessToken: accessToken,
    axiosResponse: response,
  });
}

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
  httpClient.authUrls = [httpClient.refreshAccessTokenEndpoint];
  /**
   * We will not try to retrieve a CSRF token before
   * making requests to these CSRF-exempt URLS.
   */
  httpClient.csrfExemptUrls = [httpClient.refreshAccessTokenEndpoint];

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

  httpClient.ensurePublicOrAuthenticationAndCookies = (route, callback = null) =>
    new Promise((resolve) => {
      if (httpClient.isRoutePublic(route)) {
        if (callback !== null) {
          callback();
        }
        // TODO: Return accessToken if it exists even for public routes.
        resolve();
      } else {
        httpClient
          .ensureAuthenticationAndCookies(route, callback)
          .then(accessToken => resolve(accessToken));
      }
    });

  // JWT expiration is serialized as seconds since the epoch,
  // Date.now returns the number of milliseconds since the epoch.
  httpClient.isAccessTokenExpired = token => !token || token.exp < Date.now() / 1000;

  httpClient.login = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.loginUrl}?next=${encodeURIComponent(redirectUrl)}`);
  };

  httpClient.logout = (redirectUrl = authConfig.appBaseUrl) => {
    global.location.assign(`${httpClient.logoutUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  httpClient.refreshAccessToken = () => httpClient.post(httpClient.refreshAccessTokenEndpoint);

  httpClient.isAuthUrl = url => httpClient.authUrls.includes(url);

  httpClient.getDecodedAccessToken = () => {
    const cookies = new Cookies();
    let decodedToken = null;
    /* istanbul ignore next */
    try {
      const cookieValue = cookies.get(httpClient.accessTokenCookieName);
      try {
        if (cookieValue) {
          decodedToken = jwtDecode(cookieValue);
        /* istanbul ignore next */
        } else {
          const simplestCookieFound = global.document.cookie
            .includes(httpClient.accessTokenCookieName);
          const simpleCookieFound = !!httpClient.getCookie(httpClient.accessTokenCookieName);
          httpClient.loggingService.logInfo('No access token cookie found with universal-cookie.', {
            simplestCookieFound,
            simpleCookieFound,
          });
        }
      } catch (error) {
        httpClient.loggingService.logInfo('Error decoding JWT token.', {
          jwtDecodeError: error,
          cookieValue,
        });
      }
    } catch (error) {
      httpClient.loggingService.logInfo(`Error reading the cookie: ${httpClient.accessTokenCookieName}.`);
    }

    return decodedToken;
  };

  /* TODO: Add a test if we use this, but not if we delete it. */
  /* istanbul ignore next */
  httpClient.getCookie = (name) => {
    const v = global.document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return v ? v[2] : null;
  };

  httpClient.getCsrfToken = (apiProtocol, apiHost) =>
    httpClient.get(`${apiProtocol}//${apiHost}${httpClient.csrfTokenApiPath}`);

  httpClient.isCsrfExempt = url => httpClient.csrfExemptUrls.includes(url);

  httpClient.ensureAuthenticationAndCookies = (route, callback) =>
    new Promise((resolve) => {
      // Validate auth-related cookies are in a consistent state.
      const accessToken = httpClient.getDecodedAccessToken();
      const tokenExpired = httpClient.isAccessTokenExpired(accessToken);
      if (tokenExpired) {
        // Attempt to refresh the JWT cookies.
        httpClient
          .refreshAccessToken()
          // Successfully refreshed the JWT cookies, fire the callback function.
          .then((response) => {
            const refreshedAccessToken = httpClient.getDecodedAccessToken();

            /* istanbul ignore next */
            if (refreshedAccessToken === null) {
              logMissingAccessToken(httpClient, accessToken, response);
            }

            // TODO: Determine what to do in the case that the token is still null.
            if (callback !== null) {
              callback(refreshedAccessToken);
            }
            resolve(refreshedAccessToken);
          })
          .catch(() => {
            // The user is not authenticated, send them to the login page.
            httpClient.login(httpClient.appBaseUrl + route);
          });
      } else {
        // We already have valid JWT cookies, fire the callback function.
        if (callback !== null) {
          callback(accessToken);
        }
        resolve(accessToken);
      }
    });

  httpClient.isRoutePublic = route => /^\/public.*$/.test(route);
}
