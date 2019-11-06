import { getAuthenticatedApiClient, redirectToLogin, getAuthenticatedUser } from '@edx/frontend-auth';

import authentication from './authentication';
import App, { AUTHENTICATED_USER_CHANGED } from '../App';

const mockAuthenticatedUser = {
  userId: 'user123',
  username: 'user_person',
  roles: [],
  administrator: true,
};

jest.mock('@edx/frontend-auth', () => ({
  getAuthenticatedApiClient: jest.fn(() => ({
    get: jest.fn(async () => ({
      data: {
        name: 'edX User',
      },
    })),
  })),
  redirectToLogin: jest.fn(),
  getAuthenticatedUser: jest.fn(),
}));

describe('authentication', () => {
  beforeEach(() => {
    redirectToLogin.mockReset();
    getAuthenticatedUser.mockClear();
  });

  it('should create an API client, ensure we have an authenticated user, and extract user data from the token', async () => {
    getAuthenticatedUser.mockReturnValueOnce(mockAuthenticatedUser);
    window.history.pushState({}, '', '/i/am/a/path');
    App.requireAuthenticatedUser = true;
    await authentication(App);

    expect(getAuthenticatedApiClient).toHaveBeenCalledWith({
      accessTokenCookieName: 'edx-jwt-cookie-header-payload',
      appBaseUrl: 'localhost:1995',
      csrfTokenApiPath: '/csrf/api/v1/token',
      loggingService: undefined,
      loginUrl: 'http://localhost:18000/login',
      logoutUrl: 'http://localhost:18000/login',
      refreshAccessTokenEndpoint: 'http://localhost:18000/login_refresh',
    });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(App.authenticatedUser).toEqual({
      userId: 'user123',
      username: 'user_person',
      roles: [],
      administrator: true,
    });
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('should perform a login redirect if the user is not authenticated and requireAuthenticatedUser is true', async () => {
    getAuthenticatedUser.mockReturnValueOnce(null);
    App.requireAuthenticatedUser = true;
    window.history.pushState({}, '', '/authenticated');

    await authentication(App);
    expect(getAuthenticatedApiClient).toHaveBeenCalledWith({
      accessTokenCookieName: 'edx-jwt-cookie-header-payload',
      appBaseUrl: 'localhost:1995',
      csrfTokenApiPath: '/csrf/api/v1/token',
      loggingService: undefined,
      loginUrl: 'http://localhost:18000/login',
      logoutUrl: 'http://localhost:18000/login',
      refreshAccessTokenEndpoint: 'http://localhost:18000/login_refresh',
    });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(App.authenticatedUser).toEqual(null);
    expect(redirectToLogin).toHaveBeenCalledWith('http://localhost/authenticated');
  });

  it('should perform a user account fetch if hydrateAuthenticatedUser is true', async (done) => {
    getAuthenticatedUser.mockReturnValueOnce(mockAuthenticatedUser);
    window.history.pushState({}, '', '/');
    App.hydrateAuthenticatedUser = true;

    App.subscribe(AUTHENTICATED_USER_CHANGED, () => {
      expect(App.authenticatedUser).toEqual({
        userId: 'user123',
        username: 'user_person',
        roles: [],
        administrator: true,
        name: 'edX User',
      });
      done();
    });

    await authentication(App);
    expect(getAuthenticatedApiClient).toHaveBeenCalledWith({
      accessTokenCookieName: 'edx-jwt-cookie-header-payload',
      appBaseUrl: 'localhost:1995',
      csrfTokenApiPath: '/csrf/api/v1/token',
      loggingService: undefined,
      loginUrl: 'http://localhost:18000/login',
      logoutUrl: 'http://localhost:18000/login',
      refreshAccessTokenEndpoint: 'http://localhost:18000/login_refresh',
    });
    expect(getAuthenticatedUser).toHaveBeenCalledWith();
    // Name shouldn't be in authenticatedUser yet.
    expect(App.authenticatedUser).toEqual({
      userId: 'user123',
      username: 'user_person',
      roles: [],
      administrator: true,
    });
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});
