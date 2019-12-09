export {
  configure,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackingLogEvent,
  getAnalyticsService,
  resetAnalyticsService,
} from './interface';
export { default as SegmentAnalyticsService } from './SegmentAnalyticsService';
