import {
  APP_PUBSUB_INITIALIZED,
  APP_CONFIG_INITIALIZED,
  APP_LOGGING_INITIALIZED,
  APP_AUTH_INITIALIZED,
  APP_ANALYTICS_INITIALIZED,
  APP_I18N_INITIALIZED,
  APP_READY,
} from './initialize';

import { auth, beforeReady, initError } from './handlers';

describe('initialize', () => {
  beforeEach(() => {
    auth.mockClear();
    beforeReady.mockClear();
    initError.mockClear();
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
    App.subscribe(APP_BEFORE_INIT, checkDispatchedDone);
    App.subscribe(APP_CONFIG_LOADED, checkDispatchedDone);
    App.subscribe(APP_AUTHENTICATED, checkDispatchedDone);
    App.subscribe(APP_I18N_CONFIGURED, checkDispatchedDone);
    App.subscribe(APP_LOGGING_CONFIGURED, checkDispatchedDone);
    App.subscribe(APP_ANALYTICS_CONFIGURED, checkDispatchedDone);
    App.subscribe(APP_BEFORE_READY, checkDispatchedDone);
    App.subscribe(APP_READY, checkDispatchedDone);

    await App.initialize();

    expect(analytics).toHaveBeenCalledWith(App);
    expect(auth).toHaveBeenCalledWith(App);
    expect(beforeInit).toHaveBeenCalledWith(App);
    expect(beforeReady).toHaveBeenCalledWith(App);
    expect(loadConfig).toHaveBeenCalledWith(App);
    expect(i18n).toHaveBeenCalledWith(App);
    expect(logging).toHaveBeenCalledWith(App);
    expect(ready).toHaveBeenCalledWith(App);

    // No error, though.
    expect(initError).not.toHaveBeenCalled();
  });

  it('should call override handlers if they exist', async () => {
    const overrideHandlers = {
      analytics: jest.fn(),
      auth: jest.fn(),
      beforeInit: jest.fn(),
      beforeReady: jest.fn(),
      loadConfig: jest.fn(),
      i18n: jest.fn(),
      logging: jest.fn(),
      ready: jest.fn(),
      error: jest.fn(),
    };
    await App.initialize({
      messages: null,
      loggingService: 'logging service',
      overrideHandlers,
    });
    // None of these.
    expect(analytics).not.toHaveBeenCalled();
    expect(auth).not.toHaveBeenCalled();
    expect(beforeInit).not.toHaveBeenCalled();
    expect(beforeReady).not.toHaveBeenCalled();
    expect(loadConfig).not.toHaveBeenCalled();
    expect(i18n).not.toHaveBeenCalled();
    expect(logging).not.toHaveBeenCalled();
    expect(ready).not.toHaveBeenCalled();

    // All of these.
    expect(overrideHandlers.analytics).toHaveBeenCalledWith(App);
    expect(overrideHandlers.auth).toHaveBeenCalledWith(App);
    expect(overrideHandlers.beforeInit).toHaveBeenCalledWith(App);
    expect(overrideHandlers.beforeReady).toHaveBeenCalledWith(App);
    expect(overrideHandlers.loadConfig).toHaveBeenCalledWith(App);
    expect(overrideHandlers.i18n).toHaveBeenCalledWith(App);
    expect(overrideHandlers.logging).toHaveBeenCalledWith(App);
    expect(overrideHandlers.ready).toHaveBeenCalledWith(App);

    // Still no errors
    expect(initError).not.toHaveBeenCalled();
    expect(overrideHandlers.error).not.toHaveBeenCalled();
  });

  // it('should call the error handler if something throws', async () => {
  //   const overrideHandlers = {
  //     auth: jest.fn(() => {
  //       throw new Error('uhoh!');
  //     }),
  //   };
  //   await App.initialize({
  //     messages: null,
  //     loggingService: 'logging service',
  //     overrideHandlers,
  //   });
  //   // All of these.
  //   expect(beforeInit).toHaveBeenCalledWith(App);
  //   expect(loadConfig).toHaveBeenCalledWith(App);
  //   expect(logging).toHaveBeenCalledWith(App);
  //   expect(overrideHandlers.auth).toHaveBeenCalledWith(App);

  //   // None of these.
  //   expect(analytics).not.toHaveBeenCalled();
  //   expect(auth).not.toHaveBeenCalled();
  //   expect(beforeReady).not.toHaveBeenCalled();
  //   expect(i18n).not.toHaveBeenCalled();
  //   expect(ready).not.toHaveBeenCalled();

  //   // Hey, an error!
  //   expect(initError).toHaveBeenCalledWith(App);
  //   expect(App.error).toEqual(new Error('uhoh!'));

  //   expect((done) => {
  //     App.subscribe(APP_ERROR, (e) => {
  //       expect(e.message).toEqual('uhoh!');
  //       done();
  //     });
  //   });
  // });

  it('should call the override error handler if something throws', async () => {
    const overrideHandlers = {
      auth: jest.fn(() => {
        throw new Error('uhoh!');
      }),
      error: jest.fn(),
    };
    await App.initialize({
      messages: null,
      loggingService: 'logging service',
      overrideHandlers,
    });
    // All of these.
    expect(beforeInit).toHaveBeenCalledWith(App);
    expect(loadConfig).toHaveBeenCalledWith(App);
    expect(logging).toHaveBeenCalledWith(App);
    expect(overrideHandlers.auth).toHaveBeenCalledWith(App);

    // None of these.
    expect(analytics).not.toHaveBeenCalled();
    expect(auth).not.toHaveBeenCalled();
    expect(beforeReady).not.toHaveBeenCalled();
    expect(i18n).not.toHaveBeenCalled();
    expect(ready).not.toHaveBeenCalled();
    // Not the default error handler.
    expect(initError).not.toHaveBeenCalled();

    // But yes, the override error handler!
    expect(overrideHandlers.error).toHaveBeenCalledWith(App);
  });
});
