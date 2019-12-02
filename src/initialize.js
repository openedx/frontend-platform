import { createBrowserHistory } from 'history';
import {
  publish,
} from './pubSub';
import {
  getConfig,
} from './config';
import { configure as configureLogging, getLoggingService, NewRelicLoggingService, logError } from './logging';
import { configure as configureAnalytics, SegmentAnalyticsService } from './analytics';
import { getAuthenticatedHttpClient, configure as configureAuth, ensureAuthenticatedUser, fetchAuthenticatedUser, hydrateAuthenticatedUser, getAuthenticatedUser } from './auth';
import { configure as configureI18n } from './i18n';


export const APP_TOPIC = 'APP';
export const APP_PUBSUB_INITIALIZED = `${APP_TOPIC}.PUBSUB_INITIALIZED`;
export const APP_CONFIG_INITIALIZED = `${APP_TOPIC}.CONFIG_INITIALIZED`;
export const APP_AUTH_INITIALIZED = `${APP_TOPIC}.AUTH_INITIALIZED`;
export const APP_I18N_INITIALIZED = `${APP_TOPIC}.I18N_INITIALIZED`;
export const APP_LOGGING_INITIALIZED = `${APP_TOPIC}.LOGGING_INITIALIZED`;
export const APP_ANALYTICS_INITIALIZED = `${APP_TOPIC}.ANALYTICS_INITIALIZED`;
export const APP_READY = `${APP_TOPIC}.READY`;
export const APP_INIT_ERROR = `${APP_TOPIC}.INIT_ERROR`;

export const history = createBrowserHistory();

export async function initError(error) {
  logError(error);
}

export async function auth(requireUser, hydrateUser) {
  if (requireUser) {
    await ensureAuthenticatedUser(global.location.href);
  } else {
    await fetchAuthenticatedUser();
  }

  if (hydrateUser && getAuthenticatedUser() !== null) {
    // We intentionally do not await the promise returned by hydrateAuthenticatedUser. All the
    // critical data is returned as part of fetch/ensureAuthenticatedUser above, and anything else
    // is a nice-to-have for application code.
    hydrateAuthenticatedUser();
  }
}

function applyOverrideHandlers(overrides) {
  const noOp = async () => {};
  return {
    pubSub: noOp,
    config: noOp,
    logging: noOp,
    auth,
    analytics: noOp,
    i18n: noOp,
    ready: noOp,
    initError,
    ...overrides, // This will override any same-keyed handlers from above.
  };
}

export async function initialize({
  loggingService = NewRelicLoggingService,
  analyticsService = SegmentAnalyticsService,
  requireAuthenticatedUser: requireUser = false,
  hydrateAuthenticatedUser: hydrateUser = false,
  messages,
  handlers: overrideHandlers = {},
}) {
  const handlers = applyOverrideHandlers(overrideHandlers);
  try {
    // Pub/Sub
    await handlers.pubSub();
    publish(APP_PUBSUB_INITIALIZED);

    // Configuration
    await handlers.config();
    publish(APP_CONFIG_INITIALIZED);

    // Logging
    configureLogging(loggingService, {
      config: getConfig(),
    });
    await handlers.logging();
    publish(APP_LOGGING_INITIALIZED);

    // Authentication
    configureAuth({
      loggingService: getLoggingService(),
      appBaseUrl: getConfig().BASE_URL,
      lmsBaseUrl: getConfig().LMS_BASE_URL,
      loginUrl: getConfig().LOGIN_URL,
      logoutUrl: getConfig().LOGIN_URL,
      refreshAccessTokenEndpoint: getConfig().REFRESH_ACCESS_TOKEN_ENDPOINT,
      accessTokenCookieName: getConfig().ACCESS_TOKEN_COOKIE_NAME,
      csrfTokenApiPath: getConfig().CSRF_TOKEN_API_PATH,
    });
    await handlers.auth(requireUser, hydrateUser);
    publish(APP_AUTH_INITIALIZED);

    // Analytics
    configureAnalytics(analyticsService, {
      config: getConfig(),
      loggingService: getLoggingService(),
      httpClient: getAuthenticatedHttpClient(),
    });
    await handlers.analytics();
    publish(APP_ANALYTICS_INITIALIZED);

    // Internationalization
    configureI18n({
      messages,
      config: getConfig(),
      loggingService: getLoggingService(),
    });
    await handlers.i18n();
    publish(APP_I18N_INITIALIZED);

    // Application Ready
    await handlers.ready();
    publish(APP_READY);
  } catch (error) {
    // Initialization Error
    await handlers.initError(error);
    publish(APP_INIT_ERROR, error);
  }
}
