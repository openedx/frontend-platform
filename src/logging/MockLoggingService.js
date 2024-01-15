/**
 * The MockLoggingService implements both logInfo and logError as jest mock functions via
 * jest.fn().  It has no other functionality.
 *
 * @implements {LoggingService}
 */
class MockLoggingService {
  /**
   * Implemented as a jest.fn()
   */
  logInfo = jest.fn();

  /**
   * Implemented as a jest.fn()
   */
  logError = jest.fn();

  /**
   * Implemented as a jest.fn()
   */
  setCustomAttribute = jest.fn();
}

export default MockLoggingService;
