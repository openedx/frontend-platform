import { createBrowserHistory } from 'history';
import {
  configure as configurePubSub,
  publish,
  getPubSubService,
  PubSubJsService,
} from '../pubSub';
import { configure as configureConfig, ProcessEnvConfigService, getConfigService } from '../config';
import { configureLogging, getLoggingService, NewRelicLoggingService } from '../logging';
import { auth, initError } from './handlers';
import { configure as configureAnalytics, SegmentAnalyticsService } from '../analytics';
import { getAuthenticatedHttpClient } from '../auth';
import { configure as configureI18n } from '../i18n';

export const APP_TOPIC = 'APP';
export const APP_PUBSUB_INITIALIZED = `${APP_TOPIC}.PUBSUB_INITIALIZED`;
export const APP_CONFIG_INITIALIZED = `${APP_TOPIC}.CONFIG_INITIALIZED`;
export const APP_AUTH_INITIALIZED = `${APP_TOPIC}.AUTH_INITIALIZED`;
export const APP_I18N_INITIALIZED = `${APP_TOPIC}.I18N_INITIALIZED`;
export const APP_LOGGING_INITIALIZED = `${APP_TOPIC}.LOGGING_INITIALIZED`;
export const APP_ANALYTICS_INITIALIZED = `${APP_TOPIC}.ANALYTICS_INITIALIZED`;
export const APP_BEFORE_READY = `${APP_TOPIC}.BEFORE_READY`;
export const APP_READY = `${APP_TOPIC}.READY`;
export const APP_INIT_ERROR = `${APP_TOPIC}.INIT_ERROR`;

export const history = createBrowserHistory();

function applyHandlerOverrides(overrides) {
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
  pubSubService = PubSubJsService,
  configService = ProcessEnvConfigService,
  loggingService = NewRelicLoggingService,
  analyticsService = SegmentAnalyticsService,
  // authService = null,
  // i18nService = null,
  requireAuthenticatedUser = false,
  hydrateAuthenticatedUser = false,
  messages,
  handlers = {},
} = {}) {
  const finalHandlers = applyHandlerOverrides(handlers);
  try {
    // Pub/Sub
    configurePubSub(pubSubService);
    await finalHandlers.pubSub();
    publish(APP_PUBSUB_INITIALIZED);

    // Configuration
    configureConfig(configService, {
      pubSubService: getPubSubService(),
    });
    await finalHandlers.config();
    publish(APP_CONFIG_INITIALIZED);

    // Logging
    configureLogging(loggingService, {
      configService: getConfigService(),
    });
    await finalHandlers.logging();
    publish(APP_LOGGING_INITIALIZED);

    // Authentication
    // configureAuth(authService, {
    //   configService: getConfigService(),
    //   loggingService: getLoggingService(),
    //   pubSubService: getPubSubService(),
    // });
    await finalHandlers.auth(requireAuthenticatedUser, hydrateAuthenticatedUser);
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
