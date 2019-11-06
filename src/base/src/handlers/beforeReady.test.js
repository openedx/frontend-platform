import { identifyAuthenticatedUser, identifyAnonymousUser, sendPageEvent } from '@edx/frontend-analytics';

import beforeReady from './beforeReady';

jest.mock('@edx/frontend-analytics', () => ({
  identifyAuthenticatedUser: jest.fn(),
  identifyAnonymousUser: jest.fn(),
  sendPageEvent: jest.fn(),
}));

it('should call identifyAuthenticatedUser and sendPageEvent when authenticated', () => {
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

it('should call identifyAnonymousUser and sendPageEvent when anonymous', () => {
  const app = {
    authenticatedUser: null,
  };

  beforeReady(app);

  expect(identifyAnonymousUser).toHaveBeenCalled();
  expect(sendPageEvent).toHaveBeenCalled();

  // App should be unchanged.
  expect(app).toEqual({
    authenticatedUser: null,
  });
});
