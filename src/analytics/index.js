// @ts-check
/**
 * **Import members from `@openedx/frontend-platform/analytics`**
 *
 * Contains a shared interface for tracking events.  Has a default implementation of
 * SegmentAnalyticsService, which supports Segment and the Tracking Log API (hosted in LMS).
 *
 * The `initialize` function performs much of the analytics configuration for you.  If, however,
 * you're not using the `initialize` function, analytics can be configured via:
 *
 * ```
 * import { configure, SegmentAnalyticsService } from '@edx/frontend-platform/analytics';
 * import { getConfig } from '@edx/frontend-platform';
 * import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
 * import { getLoggingService } from '@edx/frontend-platform/logging';
 *
 * configure(SegmentAnalyticsService, {
 *   config: getConfig(),
 *   loggingService: getLoggingService(),
 *   httpClient: getAuthenticatedHttpClient(),
 * });
 * ```
 *
 * As shown in this example, analytics depends on the configuration document, logging, and having
 * an authenticated HTTP client.
 *
 * @module Analytics
 */
export {
  configure,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
  getAnalyticsService,
  resetAnalyticsService,
} from './interface.js';
export { default as SegmentAnalyticsService } from './SegmentAnalyticsService.js';
export { default as MockAnalyticsService } from './MockAnalyticsService.js';

// Export types too - required for interfaces to be documented by TypeDoc:
/** @typedef {import('./interface.js').AnalyticsService} AnalyticsService */
/** @typedef {import('./interface.js').AnalyticsServiceConstructor} AnalyticsServiceConstructor */
/** @typedef {import('./interface.js').AnalyticsServiceOptions} AnalyticsServiceOptions */
