/**
 * The MockLoggingService implements both logInfo and logError as jest mock functions via
 * jest.fn().  It has no other functionality.
 *
 * @implements {LoggingService}
 * @memberof module:Logging
 */
class MockLoggingService {
  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  logInfo = jest.fn();

  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  logError = jest.fn();

  /**
   * Implemented as a jest.fn()
   *
   * @memberof MockLoggingService
   */
  setCustomAttribute = jest.fn();
}

export default MockLoggingService;
