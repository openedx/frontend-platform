function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import axios from 'axios';
import PropTypes from 'prop-types';
import { logFrontendAuthError } from './utils';
import { camelCaseObject, ensureDefinedConfig } from '../utils';
import createJwtTokenProviderInterceptor from './interceptors/createJwtTokenProviderInterceptor';
import createCsrfTokenProviderInterceptor from './interceptors/createCsrfTokenProviderInterceptor';
import createProcessAxiosRequestErrorInterceptor from './interceptors/createProcessAxiosRequestErrorInterceptor';
import AxiosJwtTokenService from './AxiosJwtTokenService';
import AxiosCsrfTokenService from './AxiosCsrfTokenService';
import configureCache from './LocalForageCache';
var optionsPropTypes = {
  config: PropTypes.shape({
    BASE_URL: PropTypes.string.isRequired,
    LMS_BASE_URL: PropTypes.string.isRequired,
    LOGIN_URL: PropTypes.string.isRequired,
    LOGOUT_URL: PropTypes.string.isRequired,
    REFRESH_ACCESS_TOKEN_ENDPOINT: PropTypes.string.isRequired,
    ACCESS_TOKEN_COOKIE_NAME: PropTypes.string.isRequired,
    CSRF_TOKEN_API_PATH: PropTypes.string.isRequired
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired
  }).isRequired
};

/**
 * @implements {AuthService}
 * @memberof module:Auth
 */
var AxiosJwtAuthService = /*#__PURE__*/function () {
  /**
   * @param {Object} options
   * @param {Object} options.config
   * @param {string} options.config.BASE_URL
   * @param {string} options.config.LMS_BASE_URL
   * @param {string} options.config.LOGIN_URL
   * @param {string} options.config.LOGOUT_URL
   * @param {string} options.config.REFRESH_ACCESS_TOKEN_ENDPOINT
   * @param {string} options.config.ACCESS_TOKEN_COOKIE_NAME
   * @param {string} options.config.CSRF_TOKEN_API_PATH
   * @param {Object} options.loggingService requires logError and logInfo methods
   */
  function AxiosJwtAuthService(options) {
    var _this = this;
    _classCallCheck(this, AxiosJwtAuthService);
    this.authenticatedHttpClient = null;
    this.httpClient = null;
    this.cachedAuthenticatedHttpClient = null;
    this.cachedHttpClient = null;
    this.authenticatedUser = null;
    ensureDefinedConfig(options, 'AuthService');
    PropTypes.checkPropTypes(optionsPropTypes, options, 'options', 'AuthService');
    this.config = options.config;
    this.loggingService = options.loggingService;
    this.jwtTokenService = new AxiosJwtTokenService(this.loggingService, this.config.ACCESS_TOKEN_COOKIE_NAME, this.config.REFRESH_ACCESS_TOKEN_ENDPOINT);
    this.csrfTokenService = new AxiosCsrfTokenService(this.config.CSRF_TOKEN_API_PATH);
    this.authenticatedHttpClient = this.addAuthenticationToHttpClient(axios.create());
    this.httpClient = axios.create();
    configureCache().then(function (cachedAxiosClient) {
      _this.cachedAuthenticatedHttpClient = _this.addAuthenticationToHttpClient(cachedAxiosClient);
      _this.cachedHttpClient = cachedAxiosClient;
    })["catch"](function (e) {
      // fallback to non-cached HTTP clients and log error
      _this.cachedAuthenticatedHttpClient = _this.authenticatedHttpClient;
      _this.cachedHttpClient = _this.httpClient;
      logFrontendAuthError(_this.loggingService, "configureCache failed with error: ".concat(e.message));
    })["finally"](function () {
      _this.middleware = options.middleware;
      _this.applyMiddleware(options.middleware);
    });
  }

  /**
   * Applies middleware to the axios instances in this service.
   *
   * @param {Array} middleware Middleware to apply.
   */
  return _createClass(AxiosJwtAuthService, [{
    key: "applyMiddleware",
    value: function applyMiddleware() {
      var middleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var clients = [this.authenticatedHttpClient, this.httpClient, this.cachedAuthenticatedHttpClient, this.cachedHttpClient];
      try {
        middleware.forEach(function (middlewareFn) {
          clients.forEach(function (client) {
            return client && middlewareFn(client);
          });
        });
      } catch (error) {
        logFrontendAuthError(this.loggingService, error);
        throw error;
      }
    }

    /**
     * Gets the authenticated HTTP client for the service.  This is an axios instance.
     *
     * @param {Object} [options] Optional options for how the HTTP client should be configured.
     * @param {boolean} [options.useCache] Whether to use front end caching for all requests made
     * with the returned client.
     *
     * @returns {HttpClient} A configured axios http client which can be used for authenticated
     * requests.
     */
  }, {
    key: "getAuthenticatedHttpClient",
    value: function getAuthenticatedHttpClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.useCache) {
        return this.cachedAuthenticatedHttpClient;
      }
      return this.authenticatedHttpClient;
    }

    /**
     * Gets the unauthenticated HTTP client for the service.  This is an axios instance.
     *
     * @param {Object} [options] Optional options for how the HTTP client should be configured.
     * @param {boolean} [options.useCache] Whether to use front end caching for all requests made
     * with the returned client.
     * @returns {HttpClient} A configured axios http client.
     */
  }, {
    key: "getHttpClient",
    value: function getHttpClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.useCache) {
        return this.cachedHttpClient;
      }
      return this.httpClient;
    }

    /**
     * Used primarily for testing.
     *
     * @ignore
     */
  }, {
    key: "getJwtTokenService",
    value: function getJwtTokenService() {
      return this.jwtTokenService;
    }

    /**
     * Used primarily for testing.
     *
     * @ignore
     */
  }, {
    key: "getCsrfTokenService",
    value: function getCsrfTokenService() {
      return this.csrfTokenService;
    }

    /**
     * Builds a URL to the login page with a post-login redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLoginRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/login?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */
  }, {
    key: "getLoginRedirectUrl",
    value: function getLoginRedirectUrl() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      return "".concat(this.config.LOGIN_URL, "?next=").concat(encodeURIComponent(redirectUrl));
    }

    /**
     * Redirects the user to the login page.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging in.
     */
  }, {
    key: "redirectToLogin",
    value: function redirectToLogin() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      global.location.assign(this.getLoginRedirectUrl(redirectUrl));
    }

    /**
     * Builds a URL to the logout page with a post-logout redirect URL attached as a query parameter.
     *
     * ```
     * const url = getLogoutRedirectUrl('http://localhost/mypage');
     * console.log(url); // http://localhost/logout?next=http%3A%2F%2Flocalhost%2Fmypage
     * ```
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */
  }, {
    key: "getLogoutRedirectUrl",
    value: function getLogoutRedirectUrl() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      return "".concat(this.config.LOGOUT_URL, "?redirect_url=").concat(encodeURIComponent(redirectUrl));
    }

    /**
     * Redirects the user to the logout page.
     *
     * @param {string} redirectUrl The URL the user should be redirected to after logging out.
     */
  }, {
    key: "redirectToLogout",
    value: function redirectToLogout() {
      var redirectUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.BASE_URL;
      global.location.assign(this.getLogoutRedirectUrl(redirectUrl));
    }

    /**
     * If it exists, returns the user data representing the currently authenticated user. If the
     * user is anonymous, returns null.
     *
     * @returns {UserData|null}
     */
  }, {
    key: "getAuthenticatedUser",
    value: function getAuthenticatedUser() {
      return this.authenticatedUser;
    }

    /**
     * Sets the authenticated user to the provided value.
     *
     * @param {UserData} authUser
     */
  }, {
    key: "setAuthenticatedUser",
    value: function setAuthenticatedUser(authUser) {
      this.authenticatedUser = authUser;
    }

    /**
     * Reads the authenticated user's access token. Resolves to null if the user is
     * unauthenticated.
     *
     * @returns {Promise<UserData>|Promise<null>} Resolves to the user's access token if they are
     * logged in.
     */
  }, {
    key: "fetchAuthenticatedUser",
    value: (function () {
      var _fetchAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var options,
          decodedAccessToken,
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              _context.next = 3;
              return this.jwtTokenService.getJwtToken(options.forceRefresh || false);
            case 3:
              decodedAccessToken = _context.sent;
              if (decodedAccessToken !== null) {
                this.setAuthenticatedUser({
                  email: decodedAccessToken.email,
                  userId: decodedAccessToken.user_id,
                  username: decodedAccessToken.preferred_username,
                  roles: decodedAccessToken.roles || [],
                  administrator: decodedAccessToken.administrator,
                  name: decodedAccessToken.name
                });
                // Sets userId as a custom attribute that will be included with all subsequent log messages.
                // Very helpful for debugging.
                this.loggingService.setCustomAttribute('userId', decodedAccessToken.user_id);
              } else {
                this.setAuthenticatedUser(null);
                // Intentionally not setting `userId` in the logging service here because it would be useful
                // to know the previously logged in user for debugging refresh issues.
              }
              return _context.abrupt("return", this.getAuthenticatedUser());
            case 6:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function fetchAuthenticatedUser() {
        return _fetchAuthenticatedUser.apply(this, arguments);
      }
      return fetchAuthenticatedUser;
    }()
    /**
     * Ensures a user is authenticated. It will redirect to login when not
     * authenticated.
     *
     * @param {string} [redirectUrl=config.BASE_URL] to return user after login when not
     * authenticated.
     * @returns {Promise<UserData>}
     */
    )
  }, {
    key: "ensureAuthenticatedUser",
    value: (function () {
      var _ensureAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var redirectUrl,
          isRedirectFromLoginPage,
          redirectLoopError,
          unauthorizedError,
          _args2 = arguments;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              redirectUrl = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : this.config.BASE_URL;
              _context2.next = 3;
              return this.fetchAuthenticatedUser();
            case 3:
              if (!(this.getAuthenticatedUser() === null)) {
                _context2.next = 13;
                break;
              }
              isRedirectFromLoginPage = global.document.referrer && global.document.referrer.startsWith(this.config.LOGIN_URL);
              if (!isRedirectFromLoginPage) {
                _context2.next = 9;
                break;
              }
              redirectLoopError = new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
              logFrontendAuthError(this.loggingService, redirectLoopError);
              throw redirectLoopError;
            case 9:
              // The user is not authenticated, send them to the login page.
              this.redirectToLogin(redirectUrl);
              unauthorizedError = new Error('Failed to ensure the user is authenticated');
              unauthorizedError.isRedirecting = true;
              throw unauthorizedError;
            case 13:
              return _context2.abrupt("return", this.getAuthenticatedUser());
            case 14:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function ensureAuthenticatedUser() {
        return _ensureAuthenticatedUser.apply(this, arguments);
      }
      return ensureAuthenticatedUser;
    }()
    /**
     * Fetches additional user account information for the authenticated user and merges it into the
     * existing authenticatedUser object, available via getAuthenticatedUser().
     *
     * ```
     *  console.log(authenticatedUser); // Will be sparse and only contain basic information.
     *  await hydrateAuthenticatedUser()
     *  const authenticatedUser = getAuthenticatedUser();
     *  console.log(authenticatedUser); // Will contain additional user information
     * ```
     *
     * @returns {Promise<null>}
     */
    )
  }, {
    key: "hydrateAuthenticatedUser",
    value: (function () {
      var _hydrateAuthenticatedUser = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var user, response;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              user = this.getAuthenticatedUser();
              if (!(user !== null)) {
                _context3.next = 6;
                break;
              }
              _context3.next = 4;
              return this.authenticatedHttpClient.get("".concat(this.config.LMS_BASE_URL, "/api/user/v1/accounts/").concat(user.username));
            case 4:
              response = _context3.sent;
              this.setAuthenticatedUser(_objectSpread(_objectSpread({}, user), camelCaseObject(response.data)));
            case 6:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function hydrateAuthenticatedUser() {
        return _hydrateAuthenticatedUser.apply(this, arguments);
      }
      return hydrateAuthenticatedUser;
    }()
    /**
    * Adds authentication defaults and interceptors to an HTTP client instance.
    *
    * @param {HttpClient} newHttpClient
    * @param {Object} config
    * @param {string} [config.REFRESH_ACCESS_TOKEN_ENDPOINT]
    * @param {string} [config.ACCESS_TOKEN_COOKIE_NAME]
    * @param {string} [config.CSRF_TOKEN_API_PATH]
    * @returns {HttpClient} A configured Axios HTTP client.
    */
    )
  }, {
    key: "addAuthenticationToHttpClient",
    value: function addAuthenticationToHttpClient(newHttpClient) {
      var httpClient = Object.create(newHttpClient);
      // Set withCredentials to true. Enables cross-site Access-Control requests
      // to be made using cookies, authorization headers or TLS client
      // certificates. More on MDN:
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
      httpClient.defaults.withCredentials = true;

      // Axios interceptors

      // The JWT access token interceptor attempts to refresh the user's jwt token
      // before any request unless the isPublic flag is set on the request config.
      var refreshAccessTokenInterceptor = createJwtTokenProviderInterceptor({
        jwtTokenService: this.jwtTokenService,
        shouldSkip: function shouldSkip(axiosRequestConfig) {
          return axiosRequestConfig.isPublic;
        }
      });
      // The CSRF token intercepter fetches and caches a csrf token for any post,
      // put, patch, or delete request. That token is then added to the request
      // headers.
      var attachCsrfTokenInterceptor = createCsrfTokenProviderInterceptor({
        csrfTokenService: this.csrfTokenService,
        CSRF_TOKEN_API_PATH: this.config.CSRF_TOKEN_API_PATH,
        shouldSkip: function shouldSkip(axiosRequestConfig) {
          var method = axiosRequestConfig.method,
            isCsrfExempt = axiosRequestConfig.isCsrfExempt;
          var CSRF_PROTECTED_METHODS = ['post', 'put', 'patch', 'delete'];
          return isCsrfExempt || !CSRF_PROTECTED_METHODS.includes(method);
        }
      });
      var processAxiosRequestErrorInterceptor = createProcessAxiosRequestErrorInterceptor({
        loggingService: this.loggingService
      });

      // Request interceptors: Axios runs the interceptors in reverse order from
      // how they are listed. After fetching csrf tokens no longer require jwt
      // authentication, it won't matter which happens first. This change is
      // coming soon in edx-platform. Nov. 2019
      httpClient.interceptors.request.use(attachCsrfTokenInterceptor);
      httpClient.interceptors.request.use(refreshAccessTokenInterceptor);

      // Response interceptor: moves axios response error data into the error
      // object at error.customAttributes
      httpClient.interceptors.response.use(function (response) {
        return response;
      }, processAxiosRequestErrorInterceptor);
      return httpClient;
    }
  }]);
}();
export default AxiosJwtAuthService;
//# sourceMappingURL=AxiosJwtAuthService.js.map