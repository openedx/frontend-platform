function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
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
 * import { AppProvider, ErrorPage, PageWrap } from '@edx/frontend-platform/react';
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import { Routes, Route } from 'react-router-dom';
 *
 * subscribe(APP_READY, () => {
 *   ReactDOM.render(
 *     <AppProvider store={configureStore()}>
 *       <Header />
 *       <main>
 *         <Routes>
 *           <Route path="/" element={<PageWrap><PaymentPage /></PageWrap>} />
 *         </Routes>
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
/*
This 'env.config' package is a special 'magic' alias in our webpack configuration in frontend-build.
It points at an `env.config.js` file in the root of an MFE's repository if it exists and falls back
to an empty object `{}` if the file doesn't exist.  This acts like an 'optional' import, in a sense.
Note that the env.config.js file in frontend-platform's root directory is NOT used by the actual
initialization code, it's just there for the test suite and example application.
*/
import envConfig from 'env.config'; // eslint-disable-line import/no-unresolved
import { getPath } from './utils';
import { publish } from './pubSub';
// eslint-disable-next-line import/no-cycle
import { getConfig, mergeConfig } from './config';
import { configure as configureLogging, getLoggingService, NewRelicLoggingService, logError } from './logging';
import { configure as configureAnalytics, SegmentAnalyticsService, identifyAnonymousUser, identifyAuthenticatedUser } from './analytics';
import { GoogleAnalyticsLoader } from './scripts';
import { getAuthenticatedHttpClient, configure as configureAuth, ensureAuthenticatedUser, fetchAuthenticatedUser, hydrateAuthenticatedUser, getAuthenticatedUser, AxiosJwtAuthService } from './auth';
import { configure as configureI18n } from './i18n';
import { APP_PUBSUB_INITIALIZED, APP_CONFIG_INITIALIZED, APP_AUTH_INITIALIZED, APP_I18N_INITIALIZED, APP_LOGGING_INITIALIZED, APP_ANALYTICS_INITIALIZED, APP_READY, APP_INIT_ERROR } from './constants';
import configureCache from './auth/LocalForageCache';

/**
 * A browser history or memory history object created by the [history](https://github.com/ReactTraining/history)
 * package.  Applications are encouraged to use this history object, rather than creating their own,
 * as behavior may be undefined when managing history via multiple mechanisms/instances. Note that
 * in environments where browser history may be inaccessible due to `window` being undefined, this
 * falls back to memory history.
 */
export var history = typeof window !== 'undefined' ? createBrowserHistory({
  basename: getPath(getConfig().PUBLIC_PATH)
}) : createMemoryHistory();

/**
 * The string basename that is the root directory of this MFE.
 *
 * In devstack, this should always just return "/", because each MFE is in its own server/domain.
 *
 * In Tutor, all MFEs are deployed to a common server, each under a different top-level directory.
 * The basename is the root path for a given MFE, e.g. "/library-authoring". It is set by tutor-mfe
 * as an ENV variable in the Docker file, and we read it here from that configuration so that it
 * can be passed into a Router later.
 */
export var basename = getPath(getConfig().PUBLIC_PATH);

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
  _initError = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(error) {
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          logError(error);
        case 1:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _initError.apply(this, arguments);
}
export function auth(_x2, _x3) {
  return _auth.apply(this, arguments);
}

/**
 * Set or overrides configuration via an env.config.js file in the consuming application.
 * This env.config.js is loaded at runtime and must export one of two things:
 *
 * - An object which will be merged into the application config via `mergeConfig`.
 * - A function which returns an object which will be merged into the application config via
 * `mergeConfig`.  This function can return a promise.
 */
function _auth() {
  _auth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(requireUser, hydrateUser) {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          console.log('============================================= auth =============================================');
          if (!requireUser) {
            _context3.next = 6;
            break;
          }
          _context3.next = 4;
          return ensureAuthenticatedUser(global.location.href);
        case 4:
          _context3.next = 8;
          break;
        case 6:
          _context3.next = 8;
          return fetchAuthenticatedUser();
        case 8:
          if (hydrateUser && getAuthenticatedUser() !== null) {
            // We intentionally do not await the promise returned by hydrateAuthenticatedUser. All the
            // critical data is returned as part of fetch/ensureAuthenticatedUser above, and anything else
            // is a nice-to-have for application code.
            hydrateAuthenticatedUser();
          }
        case 9:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _auth.apply(this, arguments);
}
function jsFileConfig() {
  return _jsFileConfig.apply(this, arguments);
}
/*
 * Set or overrides configuration through an API.
 * This method allows runtime configuration.
 * Set a basic configuration when an error happen and allow initError and display the ErrorPage.
 */
function _jsFileConfig() {
  _jsFileConfig = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
    var config;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          console.log('============================================= jsFileConfig =============================================');
          config = {};
          if (!(typeof envConfig === 'function')) {
            _context4.next = 8;
            break;
          }
          _context4.next = 5;
          return envConfig();
        case 5:
          config = _context4.sent;
          _context4.next = 9;
          break;
        case 8:
          config = envConfig;
        case 9:
          mergeConfig(config);
        case 10:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _jsFileConfig.apply(this, arguments);
}
function runtimeConfig() {
  return _runtimeConfig.apply(this, arguments);
}
function _runtimeConfig() {
  _runtimeConfig = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
    var _getConfig, MFE_CONFIG_API_URL, APP_ID, apiConfig, apiService, params, url, _yield$apiService$get, data;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          console.log('============================================= runtimeConfig =============================================');
          _context5.prev = 1;
          _getConfig = getConfig(), MFE_CONFIG_API_URL = _getConfig.MFE_CONFIG_API_URL, APP_ID = _getConfig.APP_ID;
          if (!MFE_CONFIG_API_URL) {
            _context5.next = 16;
            break;
          }
          apiConfig = {
            headers: {
              accept: 'application/json'
            }
          };
          _context5.next = 7;
          return configureCache();
        case 7:
          apiService = _context5.sent;
          params = new URLSearchParams();
          params.append('mfe', APP_ID);
          url = "".concat(MFE_CONFIG_API_URL, "?").concat(params.toString());
          _context5.next = 13;
          return apiService.get(url, apiConfig);
        case 13:
          _yield$apiService$get = _context5.sent;
          data = _yield$apiService$get.data;
          mergeConfig(data);
        case 16:
          _context5.next = 21;
          break;
        case 18:
          _context5.prev = 18;
          _context5.t0 = _context5["catch"](1);
          // eslint-disable-next-line no-console
          console.error('Error with config API', _context5.t0.message);
        case 21:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 18]]);
  }));
  return _runtimeConfig.apply(this, arguments);
}
export function loadExternalScripts(externalScripts, data) {
  console.log('============================================= loadExternalScripts =============================================');
  externalScripts.forEach(function (ExternalScript) {
    var script = new ExternalScript(data);
    script.loadScript();
  });
}

/**
 * The default handler for the initialization lifecycle's `analytics` phase.
 *
 * The handler is responsible for identifying authenticated and anonymous users with the analytics
 * service.  This is a pre-requisite for sending analytics events, thus, we do it during the
 * initialization sequence so that analytics is ready once the application's UI code starts to load.
 *
 */
export function analytics() {
  return _analytics.apply(this, arguments);
}
function _analytics() {
  _analytics = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    var authenticatedUser;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          console.log('============================================= analytics =============================================');
          authenticatedUser = getAuthenticatedUser();
          if (!(authenticatedUser && authenticatedUser.userId)) {
            _context6.next = 6;
            break;
          }
          identifyAuthenticatedUser(authenticatedUser.userId);
          _context6.next = 8;
          break;
        case 6:
          _context6.next = 8;
          return identifyAnonymousUser();
        case 8:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _analytics.apply(this, arguments);
}
function applyOverrideHandlers(overrides) {
  var noOp = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
          case "end":
            return _context.stop();
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
 * @param {*} [options.authMiddleware=[]] An array of middleware to apply to http clients in the auth service.
 * @param {*} [options.externalScripts=[GoogleAnalyticsLoader]] An array of externalScripts.
 * By default added GoogleAnalyticsLoader.
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
  _initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(_ref2) {
    var _ref2$loggingService, loggingService, _ref2$analyticsServic, analyticsService, _ref2$authService, authService, _ref2$authMiddleware, authMiddleware, _ref2$externalScripts, externalScripts, _ref2$requireAuthenti, requireUser, _ref2$hydrateAuthenti, hydrateUser, messages, _ref2$handlers, overrideHandlers, handlers, loggingServiceImpl, analyticsServiceImpl, authServiceImpl;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _ref2$loggingService = _ref2.loggingService, loggingService = _ref2$loggingService === void 0 ? NewRelicLoggingService : _ref2$loggingService, _ref2$analyticsServic = _ref2.analyticsService, analyticsService = _ref2$analyticsServic === void 0 ? SegmentAnalyticsService : _ref2$analyticsServic, _ref2$authService = _ref2.authService, authService = _ref2$authService === void 0 ? AxiosJwtAuthService : _ref2$authService, _ref2$authMiddleware = _ref2.authMiddleware, authMiddleware = _ref2$authMiddleware === void 0 ? [] : _ref2$authMiddleware, _ref2$externalScripts = _ref2.externalScripts, externalScripts = _ref2$externalScripts === void 0 ? [GoogleAnalyticsLoader] : _ref2$externalScripts, _ref2$requireAuthenti = _ref2.requireAuthenticatedUser, requireUser = _ref2$requireAuthenti === void 0 ? false : _ref2$requireAuthenti, _ref2$hydrateAuthenti = _ref2.hydrateAuthenticatedUser, hydrateUser = _ref2$hydrateAuthenti === void 0 ? false : _ref2$hydrateAuthenti, messages = _ref2.messages, _ref2$handlers = _ref2.handlers, overrideHandlers = _ref2$handlers === void 0 ? {} : _ref2$handlers;
          console.log('============================================= initialize =============================================');
          handlers = applyOverrideHandlers(overrideHandlers);
          _context7.prev = 3;
          _context7.next = 6;
          return handlers.pubSub();
        case 6:
          publish(APP_PUBSUB_INITIALIZED);

          // Configuration
          _context7.next = 9;
          return handlers.config();
        case 9:
          _context7.next = 11;
          return jsFileConfig();
        case 11:
          _context7.next = 13;
          return runtimeConfig();
        case 13:
          publish(APP_CONFIG_INITIALIZED);
          loadExternalScripts(externalScripts, {
            config: getConfig()
          });

          // This allows us to replace the implementations of the logging, analytics, and auth services
          // based on keys in the ConfigDocument.  The JavaScript File Configuration method is the only
          // one capable of supplying an alternate implementation since it can import other modules.
          // If a service wasn't supplied we fall back to the default parameters on the initialize
          // function signature.
          loggingServiceImpl = getConfig().loggingService || loggingService;
          analyticsServiceImpl = getConfig().analyticsService || analyticsService;
          authServiceImpl = getConfig().authService || authService; // Logging
          configureLogging(loggingServiceImpl, {
            config: getConfig()
          });
          _context7.next = 21;
          return handlers.logging();
        case 21:
          publish(APP_LOGGING_INITIALIZED);

          // Internationalization
          configureI18n({
            messages: messages,
            config: getConfig(),
            loggingService: getLoggingService()
          });
          _context7.next = 25;
          return handlers.i18n();
        case 25:
          publish(APP_I18N_INITIALIZED);

          // Authentication
          configureAuth(authServiceImpl, {
            loggingService: getLoggingService(),
            config: getConfig(),
            middleware: authMiddleware
          });
          _context7.next = 29;
          return handlers.auth(requireUser, hydrateUser);
        case 29:
          publish(APP_AUTH_INITIALIZED);

          // Analytics
          configureAnalytics(analyticsServiceImpl, {
            config: getConfig(),
            loggingService: getLoggingService(),
            httpClient: getAuthenticatedHttpClient()
          });
          _context7.next = 33;
          return handlers.analytics();
        case 33:
          publish(APP_ANALYTICS_INITIALIZED);

          // Application Ready
          _context7.next = 36;
          return handlers.ready();
        case 36:
          publish(APP_READY);
          _context7.next = 45;
          break;
        case 39:
          _context7.prev = 39;
          _context7.t0 = _context7["catch"](3);
          if (_context7.t0.isRedirecting) {
            _context7.next = 45;
            break;
          }
          _context7.next = 44;
          return handlers.initError(_context7.t0);
        case 44:
          publish(APP_INIT_ERROR, _context7.t0);
        case 45:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[3, 39]]);
  }));
  return _initialize.apply(this, arguments);
}
//# sourceMappingURL=initialize.js.map