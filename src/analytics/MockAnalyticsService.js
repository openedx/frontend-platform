import formurlencoded from 'form-urlencoded';
import { snakeCaseObject } from '../utils';

/**
 * @implements {AnalyticsService}
 * @memberof module:Analytics
 */
class MockAnalyticsService {
  static hasIdentifyBeenCalled = false;

  constructor({ httpClient, loggingService }) {
    this.loggingService = loggingService;
    this.httpClient = httpClient;
  }

  /**
   * Implemented as a jest.fn().
   */
  sendTrackingLogEvent = jest.fn();

  /**
   * Implemented as a jest.fn().
   */
  identifyAuthenticatedUser = jest.fn();

  /**
   * Implemented as a jest.fn().
   */
  identifyAnonymousUser = jest.fn();

  /**
   * Implemented as a jest.fn().
   */
  sendTrackEvent = jest.fn();

  /**
   * Implemented as a jest.fn().
   */
  sendPageEvent = jest.fn();
}

export default MockAnalyticsService;
