import { logError } from '../../logging';

import initError from './initError';

jest.mock('../../logging');

it('should log the App error', () => {
  const error = {
    message: 'oh no!',
  };
  initError(error);
  expect(logError).toHaveBeenCalledWith({ message: 'oh no!' });
});
