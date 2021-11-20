function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * #### Import members from **@edx/frontend-platform**
 *
 * The initialization module provides a function for managing an application's initialization
 * lifecycle.  It also provides constants and default handler implementations.
 *
 * ```
 * import {
 *   initialize,
 *   APP_INIT_ERROR,
 *   APP_READY,
 *   subscribe,
 * } from '@edx/frontend-platform';
 * import { AppProvider, ErrorPage, PageRoute } from '@edx/frontend-platform/react';
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import { Switch } from 'react-router-dom';
 *
 * subscribe(APP_READY, () => {
 *   ReactDOM.render(
 *     <AppProvider store={configureStore()}>
 *       <Header />
 *       <main>
 *         <Switch>
 *           <PageRoute exact path="/" component={PaymentPage} />
 *         </Switch>
 *       </main>
 *       <Footer />
 *     </AppProvider>,
 *     document.getElementById('root'),
 *   );
 * });
 *
 * subscribe(APP_INIT_ERROR, (error) => {
 *   ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
 * });
 *
 * initialize({
 *   messages: [appMessages],
 *   requireAuthenticatedUser: true,
 *   hydrateAuthenticatedUser: true,
 * });

```
 * @module Initialization
 */
import { createBrowserHistory, createMemoryHistory } from 'history';
import { publish } from './pubSub'; // eslint-disable-next-line import/no-cycle

import { getConfig } from './config';
import { configure as configureLogging, getLoggingService, NewRelicLoggingService, logError } from './logging';
import { configure as configureAnalytics, SegmentAnalyticsService, identifyAnonymousUser, identifyAuthenticatedUser } from './analytics';
import { getAuthenticatedHttpClient, configure as configureAuth, ensureAuthenticatedUser, fetchAuthenticatedUser, hydrateAuthenticatedUser, getAuthenticatedUser, AxiosJwtAuthService } from './auth';
import { configure as configureI18n } from './i18n';
import { APP_PUBSUB_INITIALIZED, APP_CONFIG_INITIALIZED, APP_AUTH_INITIALIZED, APP_I18N_INITIALIZED, APP_LOGGING_INITIALIZED, APP_ANALYTICS_INITIALIZED, APP_READY, APP_INIT_ERROR } from './constants';
/**
 * A browser history or memory history object created by the [history](https://github.com/ReactTraining/history)
 * package.  Applications are encouraged to use this history object, rather than creating their own,
 * as behavior may be undefined when managing history via multiple mechanisms/instances. Note that
 * in environments where browser history may be inaccessible due to `window` being undefined, this
 * falls back to memory history.
 */

export var history = typeof window !== 'undefined' ? createBrowserHistory({
  basename: getConfig().PUBLIC_PATH
}) : createMemoryHistory();
/**
 * The default handler for the initialization lifecycle's `initError` phase.  Logs the error to the
 * LoggingService using `logError`
 *
 * @see {@link module:frontend-platform/logging~logError}
 * @param {*} error
 */

export function initError(_x) {
  return _initError.apply(this, arguments);
}
/**
 * The default handler for the initialization lifecycle's `auth` phase.
 *
 * The handler has several responsibilities:
 * - Determining the user's authentication state (authenticated or anonymous)
 * - Optionally redirecting to login if the application requires an authenticated user.
 * - Optionally loading additional user information via the application's user account data
 * endpoint.
 *
 * @param {boolean} requireUser Whether or not we should redirect to login if a user is not
 * authenticated.
 * @param {boolean} hydrateUser Whether or not we should fetch additional user account data.
 */

function _initError() {
  _initError = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(error) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            logError(error);

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _initError.apply(this, arguments);
}

export function auth(_x2, _x3) {
  return _auth.apply(this, arguments);
}
/**
 * The default handler for the initialization lifecycle's `analytics` phase.
 *
 * The handler is responsible for identifying authenticated and anonymous users with the analytics
 * service.  This is a pre-requisite for sending analytics events, thus, we do it during the
 * initialization sequence so that analytics is ready once the application's UI code starts to load.
 *
 */

function _auth() {
  _auth = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(requireUser, hydrateUser) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!requireUser) {
              _context3.next = 5;
              break;
            }

            _context3.next = 3;
            return ensureAuthenticatedUser(global.location.href);

          case 3:
            _context3.next = 7;
            break;

          case 5:
            _context3.next = 7;
            return fetchAuthenticatedUser();

          case 7:
            if (hydrateUser && getAuthenticatedUser() !== null) {
              // We intentionally do not await the promise returned by hydrateAuthenticatedUser. All the
              // critical data is returned as part of fetch/ensureAuthenticatedUser above, and anything else
              // is a nice-to-have for application code.
              hydrateAuthenticatedUser();
            }

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _auth.apply(this, arguments);
}

export function analytics() {
  return _analytics.apply(this, arguments);
}

function _analytics() {
  _analytics = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
    var authenticatedUser;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            authenticatedUser = getAuthenticatedUser();

            if (!(authenticatedUser && authenticatedUser.userId)) {
              _context4.next = 5;
              break;
            }

            identifyAuthenticatedUser(authenticatedUser.userId);
            _context4.next = 7;
            break;

          case 5:
            _context4.next = 7;
            return identifyAnonymousUser();

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _analytics.apply(this, arguments);
}

function applyOverrideHandlers(overrides) {
  var noOp = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function noOp() {
      return _ref.apply(this, arguments);
    };
  }();

  return _objectSpread({
    pubSub: noOp,
    config: noOp,
    logging: noOp,
    auth: auth,
    analytics: analytics,
    i18n: noOp,
    ready: noOp,
    initError: initError
  }, overrides);
}
/**
 * Invokes the application initialization sequence.
 *
 * The sequence proceeds through a number of lifecycle phases, during which pertinent services are
 * configured.
 *
 * Using the `handlers` option, lifecycle phase handlers can be overridden to perform custom
 * functionality.  Note that while these override handlers _do_ replace the default handler
 * functionality for analytics, auth, and initError (the other phases have no default
 * functionality), they do _not_ override the configuration of the actual services that those
 * handlers leverage.
 *
 * Some services can be overridden via the loggingService and analyticsService options.  The other
 * services (auth and i18n) cannot currently be overridden.
 *
 * The following lifecycle phases exist:
 *
 * - pubSub: A no-op by default.
 * - config: A no-op by default.
 * - logging: A no-op by default.
 * - auth: Uses the 'auth' handler defined above.
 * - analytics: Uses the 'analytics' handler defined above.
 * - i18n: A no-op by default.
 * - ready: A no-op by default.
 * - initError: Uses the 'initError' handler defined above.
 *
 * @param {Object} [options]
 * @param {*} [options.loggingService=NewRelicLoggingService] The `LoggingService` implementation
 * to use.
 * @param {*} [options.analyticsService=SegmentAnalyticsService] The `AnalyticsService`
 * implementation to use.
 * @param {*} [options.requireAuthenticatedUser=false] If true, turns on automatic login
 * redirection for unauthenticated users.  Defaults to false, meaning that by default the
 * application will allow anonymous/unauthenticated sessions.
 * @param {*} [options.hydrateAuthenticatedUser=false] If true, makes an API call to the user
 * account endpoint (`${App.config.LMS_BASE_URL}/api/user/v1/accounts/${username}`) to fetch
 * detailed account information for the authenticated user. This data is merged into the return
 * value of `getAuthenticatedUser`, overriding any duplicate keys that already exist. Defaults to
 * false, meaning that no additional account information will be loaded.
 * @param {*} [options.messages] A i18n-compatible messages object, or an array of such objects. If
 * an array is provided, duplicate keys are resolved with the last-one-in winning.
 * @param {*} [options.handlers={}] An optional object of handlers which can be used to replace the
 * default behavior of any part of the startup sequence. It can also be used to add additional
 * initialization behavior before or after the rest of the sequence.
 */


export function initialize(_x4) {
  return _initialize.apply(this, arguments);
}

function _initialize() {
  _initialize = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref2) {
    var _ref2$loggingService, loggingService, _ref2$analyticsServic, analyticsService, _ref2$authService, authService, _ref2$requireAuthenti, requireUser, _ref2$hydrateAuthenti, hydrateUser, messages, _ref2$handlers, overrideHandlers, handlers;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _ref2$loggingService = _ref2.loggingService, loggingService = _ref2$loggingService === void 0 ? NewRelicLoggingService : _ref2$loggingService, _ref2$analyticsServic = _ref2.analyticsService, analyticsService = _ref2$analyticsServic === void 0 ? SegmentAnalyticsService : _ref2$analyticsServic, _ref2$authService = _ref2.authService, authService = _ref2$authService === void 0 ? AxiosJwtAuthService : _ref2$authService, _ref2$requireAuthenti = _ref2.requireAuthenticatedUser, requireUser = _ref2$requireAuthenti === void 0 ? false : _ref2$requireAuthenti, _ref2$hydrateAuthenti = _ref2.hydrateAuthenticatedUser, hydrateUser = _ref2$hydrateAuthenti === void 0 ? false : _ref2$hydrateAuthenti, messages = _ref2.messages, _ref2$handlers = _ref2.handlers, overrideHandlers = _ref2$handlers === void 0 ? {} : _ref2$handlers;
            handlers = applyOverrideHandlers(overrideHandlers);
            _context5.prev = 2;
            _context5.next = 5;
            return handlers.pubSub();

          case 5:
            publish(APP_PUBSUB_INITIALIZED); // Configuration

            _context5.next = 8;
            return handlers.config();

          case 8:
            publish(APP_CONFIG_INITIALIZED); // Logging

            configureLogging(loggingService, {
              config: getConfig()
            });
            _context5.next = 12;
            return handlers.logging();

          case 12:
            publish(APP_LOGGING_INITIALIZED); // Authentication

            configureAuth(authService, {
              loggingService: getLoggingService(),
              config: getConfig()
            });
            _context5.next = 16;
            return handlers.auth(requireUser, hydrateUser);

          case 16:
            publish(APP_AUTH_INITIALIZED); // Analytics

            configureAnalytics(analyticsService, {
              config: getConfig(),
              loggingService: getLoggingService(),
              httpClient: getAuthenticatedHttpClient()
            });
            _context5.next = 20;
            return handlers.analytics();

          case 20:
            publish(APP_ANALYTICS_INITIALIZED); // Internationalization

            configureI18n({
              messages: messages,
              config: getConfig(),
              loggingService: getLoggingService()
            });
            _context5.next = 24;
            return handlers.i18n();

          case 24:
            publish(APP_I18N_INITIALIZED); // Application Ready

            _context5.next = 27;
            return handlers.ready();

          case 27:
            publish(APP_READY);
            _context5.next = 36;
            break;

          case 30:
            _context5.prev = 30;
            _context5.t0 = _context5["catch"](2);

            if (_context5.t0.isRedirecting) {
              _context5.next = 36;
              break;
            }

            _context5.next = 35;
            return handlers.initError(_context5.t0);

          case 35:
            publish(APP_INIT_ERROR, _context5.t0);

          case 36:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[2, 30]]);
  }));
  return _initialize.apply(this, arguments);
}
//# sourceMappingURL=initialize.js.map