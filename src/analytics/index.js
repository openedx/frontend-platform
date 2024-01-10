// @ts-check
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
