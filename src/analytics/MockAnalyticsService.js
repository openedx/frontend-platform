/**
 * The MockAnalyticsService implements all functions of AnalyticsService as Jest mocks (jest.fn())).
 * It emulates the behavior of a real analytics service but witohut making any requests. It has no
 * other functionality.
 *
 * @implements {AnalyticsService}
 * @memberof module:Analytics
 */
class MockAnalyticsService {
  static hasIdentifyBeenCalled = false;

  constructor({ httpClient, loggingService }) {
    this.loggingService = loggingService;
    this.httpClient = httpClient;
  }

  checkIdentifyCalled = jest.fn(() => {
    if (!this.hasIdentifyBeenCalled) {
      this.loggingService.logError('Identify must be called before other tracking events.');
    }
  });

  /**
   * Returns a resolved promise.
   *
   * @returns {Promise} The promise returned by HttpClient.post.
   */
  sendTrackingLogEvent = jest.fn(() => Promise.resolve());

  /**
   * No-op, but records that identify has been called.
   *
   * @param {string} userId
   * @throws {Error} If userId argument is not supplied.
   */
  identifyAuthenticatedUser = jest.fn((userId) => {
    if (!userId) {
      throw new Error('UserId is required for identifyAuthenticatedUser.');
    }
    this.hasIdentifyBeenCalled = true;
  });

  /**
   * No-op, but records that it has been called to prevent double-identification.
   * @returns {Promise} A resolved promise.
   */
  identifyAnonymousUser = jest.fn(() => {
    this.hasIdentifyBeenCalled = true;
    return Promise.resolve();
  });

  /**
   * Logs the event to the console.
   *
   * Checks whether identify has been called, logging an error to the logging service if not.
   */
  sendTrackEvent = jest.fn(() => {
    this.checkIdentifyCalled();
  });

  /**
   * Logs the event to the console.
   *
   * Checks whether identify has been called, logging an error to the logging service if not.
   */
  sendPageEvent = jest.fn(() => {
    this.checkIdentifyCalled();
  });
}

export default MockAnalyticsService;
