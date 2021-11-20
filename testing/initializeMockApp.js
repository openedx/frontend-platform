function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { configure as configureAnalytics, MockAnalyticsService } from '../analytics';
import { configure as configureI18n } from '../i18n';
import { configure as configureLogging, MockLoggingService } from '../logging';
import { configure as configureAuth, MockAuthService } from '../auth';
import { getConfig } from '../config';
import mockMessages from './mockMessages';
/**
 * Initializes a mock application for component testing. The mock application includes
 * mock analytics, auth, and logging services, and the real i18n service.
 *
 * See MockAnalyticsService, MockAuthService, and MockLoggingService for mock implementation
 * details. For the most part, the analytics and logging services just implement their functions
 * with jest.fn() and do nothing else, whereas the MockAuthService actually has some behavior
 * implemented, it just doesn't make any HTTP calls.
 *
 * Note that this mock application is not sufficient for testing the full application lifecycle or
 * initialization callbacks/custom handlers as described in the 'initialize' function's
 * documentation. It exists merely to set up the mock services that components themselves tend to
 * interact with most often. It could be extended to allow for setting up custom handlers fairly
 * easily, as this functionality would be more-or-less identical to what the real initialize
 * function does.
 *
 * Example:
 *
 * ```
 * import { initializeMockApp } from '@edx/frontend-platform/testing';
 * import { logInfo } from '@edx/frontend-platform/logging';
 *
 * describe('initializeMockApp', () => {
 *   it('mocks things correctly', () => {
 *     const { loggingService } = initializeMockApp();
 *     logInfo('test', {});
 *     expect(loggingService.logInfo).toHaveBeenCalledWith('test', {});
 *   });
 * });
 * ```
 *
 * @param {Object} [options]
 * @param {*} [options.messages] A i18n-compatible messages object, or an array of such objects. If
 * an array is provided, duplicate keys are resolved with the last-one-in winning.
 * @param {UserData|null} [options.authenticatedUser] A UserData object representing the
 * authenticated user. This is passed directly to MockAuthService.
 * @memberof module:Testing
 */

export default function initializeMockApp() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$messages = _ref.messages,
      messages = _ref$messages === void 0 ? mockMessages : _ref$messages,
      _ref$authenticatedUse = _ref.authenticatedUser,
      authenticatedUser = _ref$authenticatedUse === void 0 ? null : _ref$authenticatedUse;

  var loggingService = configureLogging(MockLoggingService, {
    config: getConfig()
  });
  var authService = configureAuth(MockAuthService, {
    config: _objectSpread(_objectSpread({}, getConfig()), {}, {
      authenticatedUser: authenticatedUser
    }),
    loggingService: loggingService
  });
  var analyticsService = configureAnalytics(MockAnalyticsService, {
    config: getConfig(),
    httpClient: authService.getAuthenticatedHttpClient(),
    loggingService: loggingService
  }); // The i18n service configure function has no return value, since there isn't a service class.

  configureI18n({
    config: getConfig(),
    loggingService: loggingService,
    messages: messages
  });
  return {
    analyticsService: analyticsService,
    authService: authService,
    loggingService: loggingService
  };
}
//# sourceMappingURL=initializeMockApp.js.map