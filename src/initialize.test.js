import PubSub from 'pubsub-js';
import {
  APP_PUBSUB_INITIALIZED,
  APP_CONFIG_INITIALIZED,
  APP_LOGGING_INITIALIZED,
  APP_AUTH_INITIALIZED,
  APP_ANALYTICS_INITIALIZED,
  APP_I18N_INITIALIZED,
  APP_READY,
  initialize,
  APP_INIT_ERROR,
} from './initialize';
import { subscribe } from './pubSub';

import { configure as configureLogging, NewRelicLoggingService, getLoggingService, logError } from './logging';
import { configure as configureAuth, getAuthenticatedHttpClient, ensureAuthenticatedUser, fetchAuthenticatedUser, hydrateAuthenticatedUser, getAuthenticatedUser, AxiosJwtAuthService } from './auth';
import { configure as configureAnalytics, SegmentAnalyticsService } from './analytics';
import { configure as configureI18n } from './i18n';
import { getConfig } from './config';

jest.mock('./logging');
jest.mock('./auth');
jest.mock('./analytics');
jest.mock('./i18n');

let config = null;
describe('initialize', () => {
  beforeEach(() => {
    config = getConfig();
    fetchAuthenticatedUser.mockReset();
    ensureAuthenticatedUser.mockReset();
    hydrateAuthenticatedUser.mockReset();
    logError.mockReset();
    PubSub.clearAllSubscriptions();
  });

  it('should call default handlers in the absence of overrides', async (done) => {
    const expectedEvents = [
      APP_PUBSUB_INITIALIZED,
      APP_CONFIG_INITIALIZED,
      APP_LOGGING_INITIALIZED,
      APP_AUTH_INITIALIZED,
      APP_ANALYTICS_INITIALIZED,
      APP_I18N_INITIALIZED,
      APP_READY,
    ];

    function checkDispatchedDone(eventName) {
      const index = expectedEvents.indexOf(eventName);
      if (index > -1) {
        expectedEvents.splice(index, 1);
        if (expectedEvents.length === 0) {
          done();
        }
      } else {
        throw new Error(`Unexpected event dispatched! ${eventName}`);
      }
    }

    subscribe(APP_PUBSUB_INITIALIZED, checkDispatchedDone);
    subscribe(APP_CONFIG_INITIALIZED, checkDispatchedDone);
    subscribe(APP_LOGGING_INITIALIZED, checkDispatchedDone);
    subscribe(APP_AUTH_INITIALIZED, checkDispatchedDone);
    subscribe(APP_ANALYTICS_INITIALIZED, checkDispatchedDone);
    subscribe(APP_I18N_INITIALIZED, checkDispatchedDone);
    subscribe(APP_READY, checkDispatchedDone);

    const messages = { i_am: 'a message' };
    await initialize({ messages });

    expect(configureLogging).toHaveBeenCalledWith(NewRelicLoggingService, { config });
    expect(configureAuth).toHaveBeenCalledWith(AxiosJwtAuthService, {
      loggingService: getLoggingService(),
      config,
    });
    expect(configureAnalytics).toHaveBeenCalledWith(SegmentAnalyticsService, {
      config,
      loggingService: getLoggingService(),
      httpClient: getAuthenticatedHttpClient(),
    });
    expect(configureI18n).toHaveBeenCalledWith({
      messages,
      config,
      loggingService: getLoggingService(),
    });
    expect(fetchAuthenticatedUser).toHaveBeenCalled();
    expect(ensureAuthenticatedUser).not.toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should call ensureAuthenticatedUser', async () => {
    const messages = { i_am: 'a message' };
    await initialize({ messages, requireAuthenticatedUser: true });

    expect(fetchAuthenticatedUser).not.toHaveBeenCalled();
    expect(ensureAuthenticatedUser).toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should call hydrateAuthenticatedUser if option is set and authenticated', async () => {
    getAuthenticatedUser.mockReturnValue({ userId: 'abc123', username: 'Barry' });

    const messages = { i_am: 'a message' };
    await initialize({ messages, hydrateAuthenticatedUser: true });

    expect(fetchAuthenticatedUser).toHaveBeenCalled();
    expect(ensureAuthenticatedUser).not.toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should not call hydrateAuthenticatedUser if option is set but anonymous', async () => {
    getAuthenticatedUser.mockReturnValue(null);

    const messages = { i_am: 'a message' };
    await initialize({ messages, hydrateAuthenticatedUser: true });

    expect(fetchAuthenticatedUser).toHaveBeenCalled();
    expect(ensureAuthenticatedUser).not.toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should call override handlers if they exist', async () => {
    const overrideHandlers = {
      pubSub: jest.fn(),
      config: jest.fn(),
      logging: jest.fn(),
      auth: jest.fn(),
      analytics: jest.fn(),
      i18n: jest.fn(),
      ready: jest.fn(),
      initError: jest.fn(),
    };

    await initialize({
      messages: null,
      handlers: overrideHandlers,
    });

    expect(overrideHandlers.pubSub).toHaveBeenCalled();
    expect(overrideHandlers.config).toHaveBeenCalled();
    expect(overrideHandlers.logging).toHaveBeenCalled();
    expect(overrideHandlers.auth).toHaveBeenCalled();
    expect(overrideHandlers.analytics).toHaveBeenCalled();
    expect(overrideHandlers.i18n).toHaveBeenCalled();
    expect(overrideHandlers.ready).toHaveBeenCalled();
    expect(overrideHandlers.initError).not.toHaveBeenCalled();
    expect(fetchAuthenticatedUser).not.toHaveBeenCalled();
    expect(ensureAuthenticatedUser).not.toHaveBeenCalled();
    expect(hydrateAuthenticatedUser).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('should call the default initError handler if something throws', async (done) => {
    const overrideHandlers = {
      pubSub: jest.fn(() => {
        throw new Error('uhoh!');
      }),
      config: jest.fn(),
      logging: jest.fn(),
      auth: jest.fn(),
      analytics: jest.fn(),
      i18n: jest.fn(),
      ready: jest.fn(),
    };

    function errorHandler(eventName, data) {
      expect(eventName).toEqual(APP_INIT_ERROR);
      expect(data).toEqual(new Error('uhoh!'));
      done();
    }

    subscribe(APP_INIT_ERROR, errorHandler);

    await initialize({
      messages: null,
      handlers: overrideHandlers,
    });

    expect(overrideHandlers.pubSub).toHaveBeenCalled();
    expect(overrideHandlers.config).not.toHaveBeenCalled();
    expect(overrideHandlers.logging).not.toHaveBeenCalled();
    expect(overrideHandlers.auth).not.toHaveBeenCalled();
    expect(overrideHandlers.analytics).not.toHaveBeenCalled();
    expect(overrideHandlers.i18n).not.toHaveBeenCalled();
    expect(overrideHandlers.ready).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(new Error('uhoh!'));
  });

  it('should call the override initError handler if something throws', async (done) => {
    const overrideHandlers = {
      pubSub: jest.fn(() => {
        throw new Error('uhoh!');
      }),
      config: jest.fn(),
      logging: jest.fn(),
      auth: jest.fn(),
      analytics: jest.fn(),
      i18n: jest.fn(),
      ready: jest.fn(),
      initError: jest.fn(),
    };

    function errorHandler(eventName, data) {
      expect(eventName).toEqual(APP_INIT_ERROR);
      expect(data).toEqual(new Error('uhoh!'));
      done();
    }

    subscribe(APP_INIT_ERROR, errorHandler);

    await initialize({
      messages: null,
      handlers: overrideHandlers,
    });

    expect(overrideHandlers.pubSub).toHaveBeenCalled();
    expect(overrideHandlers.config).not.toHaveBeenCalled();
    expect(overrideHandlers.logging).not.toHaveBeenCalled();
    expect(overrideHandlers.auth).not.toHaveBeenCalled();
    expect(overrideHandlers.analytics).not.toHaveBeenCalled();
    expect(overrideHandlers.i18n).not.toHaveBeenCalled();
    expect(overrideHandlers.ready).not.toHaveBeenCalled();
    expect(overrideHandlers.initError).toHaveBeenCalledWith(new Error('uhoh!'));
  });
});
