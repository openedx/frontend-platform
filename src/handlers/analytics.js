import {
  configureAnalytics,
} from '@edx/frontend-analytics';

export default async function analytics(app) {
  configureAnalytics({
    loggingService: app.loggingService,
    authApiClient: app.apiClient,
    analyticsApiBaseUrl: app.config.LMS_BASE_URL,
  });
}
