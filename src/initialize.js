import { getAuthenticatedAPIClient } from '@edx/frontend-auth';
import {
  identifyAuthenticatedUser,
  sendPageEvent,
  configureAnalytics,
  initializeSegment,
} from '@edx/frontend-analytics';
import { configure as configureI18n } from '@edx/frontend-i18n';
import { configureLoggingService } from '@edx/frontend-logging';

import App from './App';
import { configureUserAccountApiService, getAuthentication } from './frontendAuthWrapper';

export default async function initialize(configuration, messages, loggingService) {
  try {
    // Initialize App singleton
    App.config = configuration;
    App.apiClient = getAuthenticatedAPIClient({
      appBaseUrl: configuration.BASE_URL,
      authBaseUrl: configuration.LMS_BASE_URL,
      loginUrl: configuration.LOGIN_URL,
      logoutUrl: configuration.LOGOUT_URL,
      csrfTokenApiPath: configuration.CSRF_TOKEN_API_PATH,
      refreshAccessTokenEndpoint: configuration.REFRESH_ACCESS_TOKEN_ENDPOINT,
      accessTokenCookieName: configuration.ACCESS_TOKEN_COOKIE_NAME,
      userInfoCookieName: configuration.USER_INFO_COOKIE_NAME,
      csrfCookieName: configuration.CSRF_COOKIE_NAME,
      loggingService,
    });

    // Get a valid access token for authenticated API access.
    const accessToken =
      await App.apiClient.ensurePublicOrAuthenticationAndCookies(global.location.pathname);
    // Once we have refreshed our authentication, extract it for use later.
    if (!accessToken) {
      const error = new Error('Empty accessToken returned from ensurePublicOrAuthenticationAndCookies callback.');
      loggingService.logError(error.message);
      throw error;
    }
    App.authentication = getAuthentication(App.apiClient);

    // Configure services.
    configureI18n(configuration, messages);
    configureLoggingService(loggingService);
    initializeSegment(configuration.SEGMENT_KEY);
    configureAnalytics({
      loggingService,
      authApiClient: App.apiClient,
      analyticsApiBaseUrl: configuration.LMS_BASE_URL,
    });
    configureUserAccountApiService(configuration, App.apiClient);

    // Application is now ready to be used.
    App.ready();

    // Send analytics events indicating a successful initialization.
    identifyAuthenticatedUser(accessToken.userId);
    sendPageEvent();
  } catch (error) {
    loggingService.logError(error.message);
    App.error(error);
  }
}
