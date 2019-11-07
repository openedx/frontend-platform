import { logError } from '../../logging';

import error from './error';

jest.mock('../../logging');

it('should log the App error', () => {
  const app = {
    loggingService: {
      logError: jest.fn(),
    },
    error: {
      message: 'oh no!',
    },
  };
  error(app);
  expect(logError).toHaveBeenCalledWith({ message: 'oh no!' });
});
