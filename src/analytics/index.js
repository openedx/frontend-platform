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
