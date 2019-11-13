import { createBrowserHistory } from 'history';
import {
  configure as configurePubSub,
  publish,
  getPubSubService,
  PubSubJsService,
} from '../pubSub';
import { configure as configureConfig, ProcessEnvConfigService, getConfigService } from '../config';
import { configureLogging, NewRelicLoggingService } from '../logging'; // getLoggingService
import { auth, initError } from './handlers';

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

const override = async (defaultHandler, overrideHandler, ...args) => {
  if (overrideHandler !== undefined) {
    await overrideHandler(args);
  } else {
    await defaultHandler(args);
  }
};

export const history = createBrowserHistory();

export default async function initialize({
  pubSubService = PubSubJsService,
  configService = ProcessEnvConfigService,
  loggingService = NewRelicLoggingService,
  // analyticsService = null,
  // authService = null,
  // i18nService = null,
  requireAuthenticatedUser = false,
  hydrateAuthenticatedUser = false,
  // messages,
  handlers = {},
} = {}) {
  try {
    configurePubSub(pubSubService);
    await override(() => {}, handlers.pubSub);
    publish(APP_PUBSUB_INITIALIZED);

    configureConfig(configService, {
      pubSubService: getPubSubService(),
    });
    await override(() => {}, handlers.config);
    publish(APP_CONFIG_INITIALIZED);

    configureLogging(loggingService, {
      configService: getConfigService(),
    });
    await override(() => {}, handlers.logging);
    publish(APP_LOGGING_INITIALIZED);

    // configureAuth(authService, {
    //   configService: getConfigService(),
    //   loggingService: getLoggingService(),
    // });
    await override(auth, handlers.auth, requireAuthenticatedUser, hydrateAuthenticatedUser);
    publish(APP_AUTH_INITIALIZED);

    // configureAnalytics(analyticsService, {
    //   configService: getConfigService(),
    //   loggingService: getLoggingService(),
    // });
    await override(() => {}, handlers.analytics);
    publish(APP_ANALYTICS_INITIALIZED);

    // configureI18n(i18nService, messages, {
    //   configService: getConfigService(),
    //   loggingService: getLoggingService(),
    // });
    await override(() => {}, handlers.i18n);
    publish(APP_I18N_INITIALIZED);

    await override(() => {}, handlers.ready);
    publish(APP_READY);
  } catch (error) {
    await override(initError, handlers.initError);
    publish(APP_INIT_ERROR, error);
  }
}
