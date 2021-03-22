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
export default function initializeMockApp({
  messages = mockMessages,
  authenticatedUser = null,
} = {}) {
  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });

  const authService = configureAuth(MockAuthService, {
    config: { ...getConfig(), authenticatedUser },
    loggingService,
  });

  const analyticsService = configureAnalytics(MockAnalyticsService, {
    config: getConfig(),
    httpClient: authService.getAuthenticatedHttpClient(),
    loggingService,
  });

  // The i18n service configure function has no return value, since there isn't a service class.
  configureI18n({
    config: getConfig(),
    loggingService,
    messages,
  });

  return {
    analyticsService,
    authService,
    loggingService,
  };
}
