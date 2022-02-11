import initializeMockApp from './initializeMockApp';
import {
  getAnalyticsService,
  MockAnalyticsService,
  sendTrackEvent,
} from '../analytics';
import {
  MockAuthService,
  ensureAuthenticatedUser,
  getAuthService,
  getLoginRedirectUrl,
  setAuthenticatedUser,
} from '../auth';
import {
  getLoggingService,
  logInfo,
  MockLoggingService,
} from '../logging';

describe('initializeMockApp', () => {
  it('should create mock analytics, auth, and logging services, and a real i18n service', () => {
    const {
      analyticsService,
      authService,
      loggingService,
    } = initializeMockApp();

    expect(getAnalyticsService()).toBeInstanceOf(MockAnalyticsService);
    expect(getAuthService()).toBeInstanceOf(MockAuthService);
    expect(getLoggingService()).toBeInstanceOf(MockLoggingService);

    const customAttributes = { custom: 'attribute' };

    // Next, test a representative sample of functionality to prove mocking is working the way we hope.

    // Analytics
    sendTrackEvent('testEvent', customAttributes);
    expect(analyticsService.sendTrackEvent).toHaveBeenCalledWith('testEvent', customAttributes);
    // The mock analytics service calls checkIdentifyCalled when sendTrackEvent is called.  Prove
    // the jest.fn() works.
    expect(analyticsService.checkIdentifyCalled).toHaveBeenCalledTimes(1);

    // Auth
    getLoginRedirectUrl('http://localhost/redirect/url');
    setAuthenticatedUser({
      userId: 'abc123',
      username: 'Mock User',
      roles: [],
      administrator: false,
      name: 'mock tester',
    });
    ensureAuthenticatedUser();

    expect(authService.getLoginRedirectUrl).toHaveBeenCalledWith('http://localhost/redirect/url');
    expect(authService.ensureAuthenticatedUser).toHaveBeenCalled();
    // ensureAuthenticatedUser calls a few other things under the covers.  Prove our mocking is
    // working as expected across multiple levels.
    expect(authService.fetchAuthenticatedUser).toHaveBeenCalled();
    expect(authService.getAuthenticatedUser).toHaveBeenCalled();
    expect(authService.redirectToLogin).not.toHaveBeenCalled();

    // Logging
    logInfo('logging info', customAttributes);
    expect(loggingService.logInfo).toHaveBeenCalledWith('logging info', customAttributes);
  });
});
