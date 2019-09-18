import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

import authentication from './authentication';
import { defaultAuthenticatedUser } from '../frontendAuthWrapper';

jest.mock('@edx/frontend-auth', () => ({
  getAuthenticatedAPIClient: jest.fn(() => ({
    ensurePublicOrAuthenticationAndCookies: jest.fn(async () => ({
      user_id: 'user123',
      preferred_username: 'user_person',
      roles: [],
      administrator: true,
    })),
  })),
}));

beforeEach(() => {
  window.history.pushState({}, '', '/i/am/a/path');
});

it('should create an API client, ensure we have an authenticated user, and extract user data from the token', async () => {
  const app = {
    loggingService: 'logging service',
    config: {
      BASE_URL: 'http://localhost:1',
      LMS_BASE_URL: 'http://localhost:2',
      LOGIN_URL: 'http://localhost:3',
      LOGOUT_URL: 'http://localhost:4',
      CSRF_TOKEN_API_PATH: 'csrf/token/path',
      REFRESH_ACCESS_TOKEN_ENDPOINT: 'http://localhost:5',
      ACCESS_TOKEN_COOKIE_NAME: 'access_token_cookie',
      USER_INFO_COOKIE_NAME: 'user_info_cookie',
      CSRF_COOKIE_NAME: 'csrf_cookie',
    },
    authenticatedUser: defaultAuthenticatedUser,
  };

  await authentication(app);

  expect(getAuthenticatedAPIClient).toHaveBeenCalledWith({
    appBaseUrl: 'http://localhost:1',
    authBaseUrl: 'http://localhost:2',
    loginUrl: 'http://localhost:3',
    logoutUrl: 'http://localhost:4',
    csrfTokenApiPath: 'csrf/token/path',
    refreshAccessTokenEndpoint: 'http://localhost:5',
    accessTokenCookieName: 'access_token_cookie',
    userInfoCookieName: 'user_info_cookie',
    csrfCookieName: 'csrf_cookie',
    loggingService: 'logging service',
  });
  // TODO: There's an async in here - we probably need to wait for it.
  expect(app.apiClient.ensurePublicOrAuthenticationAndCookies).toHaveBeenCalledWith('/i/am/a/path');
  expect(app.authenticatedUser).toEqual({
    userId: 'user123',
    username: 'user_person',
    roles: [],
    administrator: true,
  });
});
