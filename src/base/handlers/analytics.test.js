import {
  configureAnalytics,
  initializeSegment,
} from '../../analytics';

import analytics from './analytics';

jest.mock('../../analytics', () => ({
  configureAnalytics: jest.fn(),
  initializeSegment: jest.fn(),
}));

it('should configure analytics with the necessary data', () => {
  const app = {
    loggingService: 'logging service',
    apiClient: 'api client',
    config: {
      LMS_BASE_URL: process.env.LMS_BASE_URL,
      SEGMENT_KEY: process.env.SEGMENT_KEY,
    },
  };
  analytics(app);
  expect(initializeSegment).toHaveBeenCalledWith('segment_whoa');
  expect(configureAnalytics).toHaveBeenCalledWith({
    loggingService: 'logging service',
    authApiClient: 'api client',
    analyticsApiBaseUrl: 'http://localhost:18000',
  });
});
