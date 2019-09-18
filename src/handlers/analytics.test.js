import {
  configureAnalytics,
} from '@edx/frontend-analytics';

import analytics from './analytics';

jest.mock('@edx/frontend-analytics', () => ({
  configureAnalytics: jest.fn(),
}));

it('should configure analytics with the necessary data', () => {
  const app = {
    loggingService: 'logging service',
    apiClient: 'api client',
    config: {
      LMS_BASE_URL: 'http://localhost:18000',
    },
  };
  analytics(app);
  expect(configureAnalytics).toHaveBeenCalledWith({
    loggingService: 'logging service',
    authApiClient: 'api client',
    analyticsApiBaseUrl: 'http://localhost:18000',
  });
});
