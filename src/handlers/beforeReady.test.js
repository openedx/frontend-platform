import { identifyAuthenticatedUser, sendPageEvent } from '@edx/frontend-analytics';

import beforeReady from './beforeReady';

jest.mock('@edx/frontend-analytics', () => ({
  identifyAuthenticatedUser: jest.fn(),
  sendPageEvent: jest.fn(),
}));

it('should do nothing to the app', () => {
  const app = {
    authenticatedUser: {
      userId: 12345,
    },
  };

  beforeReady(app);

  expect(identifyAuthenticatedUser).toHaveBeenCalledWith(12345);
  expect(sendPageEvent).toHaveBeenCalled();

  // App should be unchanged.
  expect(app).toEqual({
    authenticatedUser: {
      userId: 12345,
    },
  });
});
