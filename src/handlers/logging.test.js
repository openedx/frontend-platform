import {
  configureLoggingService,
} from '@edx/frontend-logging';

import logging from './logging';

jest.mock('@edx/frontend-logging', () => ({
  configureLoggingService: jest.fn(),
}));

it('should configure logging with the logging service to use', () => {
  const app = {
    loggingService: 'logging service',
  };
  logging(app);
  expect(configureLoggingService).toHaveBeenCalledWith('logging service');
});
