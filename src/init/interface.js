import { createBrowserHistory } from 'history';
import {
  // configure as configurePubSub,
  publish,
  // PubSubJsService,
  getPubSubService,
} from '../pubSub';
import {
  // configure as configureConfig,
  // ProcessEnvConfigService,
  getConfigService,
} from '../config';
import { configure as configureLogging, getLoggingService, NewRelicLoggingService, logError } from '../logging';
import { configure as configureAnalytics, SegmentAnalyticsService } from '../analytics';
import { getAuthenticatedHttpClient, configure as configureAuth, ensureAuthenticatedUser, fetchAuthenticatedUser, hydrateAuthenticatedUser } from '../auth';
import { configure as configureI18n } from '../i18n';

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
    await ensureAuthenticatedUser();
  } else {
    await fetchAuthenticatedUser();
  }

  if (hydrateUser) {
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

export default async function initialize({
  // pubSubService = PubSubJsService,
  // configService = ProcessEnvConfigService,
  loggingService = NewRelicLoggingService,
  analyticsService = SegmentAnalyticsService,
  requireAuthenticatedUser: requireUser = false,
  hydrateAuthenticatedUser: hydrateUser = false,
  messages,
  handlers = {},
} = {}) {
  const finalHandlers = applyOverrideHandlers(handlers);
  try {
    // Pub/Sub
    // configurePubSub(pubSubService);
    await finalHandlers.pubSub();
    publish(APP_PUBSUB_INITIALIZED);

    // Configuration
    // configureConfig(configService);
    await finalHandlers.config();
    publish(APP_CONFIG_INITIALIZED);

    // Logging
    configureLogging(loggingService, {
      configService: getConfigService(),
    });
    await finalHandlers.logging();
    publish(APP_LOGGING_INITIALIZED);

    // Authentication
    configureAuth({
      configService: getConfigService(),
      loggingService: getLoggingService(),
      appBaseUrl: getConfigService().getConfig().BASE_URL,
      lmsBaseUrl: getConfigService().getConfig().LMS_BASE_URL,
      loginUrl: getConfigService().getConfig().LOGIN_URL,
      logoutUrl: getConfigService().getConfig().LOGIN_URL,
      refreshAccessTokenEndpoint: getConfigService().getConfig().REFRESH_ACCESS_TOKEN_ENDPOINT,
      accessTokenCookieName: getConfigService().getConfig().ACCESS_TOKEN_COOKIE_NAME,
      csrfTokenApiPath: getConfigService().getConfig().CSRF_TOKEN_API_PATH,
    });
    await finalHandlers.auth(requireUser, hydrateUser);
    publish(APP_AUTH_INITIALIZED);

    // Analytics
    configureAnalytics(analyticsService, {
      configService: getConfigService(),
      loggingService: getLoggingService(),
      httpClient: getAuthenticatedHttpClient(),
    });
    await finalHandlers.analytics();
    publish(APP_ANALYTICS_INITIALIZED);

    // Internationalization
    configureI18n({
      messages,
      configService: getConfigService(),
      loggingService: getLoggingService(),
    });
    await finalHandlers.i18n();
    publish(APP_I18N_INITIALIZED);

    // Application Ready
    await finalHandlers.ready();
    publish(APP_READY);
  } catch (error) {
    // Initialization Error
    await finalHandlers.initError(error);
    publish(APP_INIT_ERROR, error);
  }
}
