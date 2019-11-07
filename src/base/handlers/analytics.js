import {
  configureAnalytics,
  initializeSegment,
} from '../../analytics';

export default async function analytics(app) {
  initializeSegment(app.config.SEGMENT_KEY);
  configureAnalytics({
    loggingService: app.loggingService,
    authApiClient: app.apiClient,
    analyticsApiBaseUrl: app.config.LMS_BASE_URL,
  });
}
