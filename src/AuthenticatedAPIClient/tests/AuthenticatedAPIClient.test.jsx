import Cookies from 'universal-cookie';

import applyMockAuthInterface from './mockAuthInterface';
import axiosConfig from '../axiosConfig';
import getAuthenticatedAPIClient from '../index';

const authConfig = {
  appBaseUrl: process.env.BASE_URL,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  userInfoCookieName: process.env.USER_INFO_COOKIE_NAME,
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const jwt = {
  user_id: '12345',
  preferred_username: 'test',
};
const expiredJwt = Object.assign({ exp: yesterday.getTime() / 1000 }, jwt);
const encodedExpiredJwt = `header.${btoa(JSON.stringify(expiredJwt))}`;
const validJwt = Object.assign({ exp: tomorrow.getTime() / 1000 }, jwt);
const encodedValidJwt = `header.${btoa(JSON.stringify(validJwt))}`;
const userInfo = JSON.stringify({ username: 'test-user' });

const mockCookies = {
  get: jest.fn(),
};
jest.genMockFromModule('universal-cookie');
Cookies.mockImplementation(() => mockCookies);
jest.mock('universal-cookie');

function expectLogoutToHaveBeenCalled(client) {
  expect(client.logout).toHaveBeenCalled();
}

function expectLogoutToNotHaveBeenCalled(client) {
  expect(client.logout).not.toHaveBeenCalled();
}

function expectRefreshAccessTokenToHaveBeenCalled(client) {
  expect(client.refreshAccessToken).toHaveBeenCalled();
}

function expectRefreshAccessTokenToNotHaveBeenCalled(client) {
  expect(client.refreshAccessToken).not.toHaveBeenCalled();
}

function expectGetCsrfTokenToHaveBeenCalled(client) {
  expect(client.getCsrfToken).toHaveBeenCalled();
}

function expectGetCsrfTokenToNotHaveBeenCalled(client) {
  expect(client.getCsrfToken).not.toHaveBeenCalled();
}

function expectCsrfHeaderSet(request) {
  expect(request.headers['X-CSRFToken']).toBe('test-csrf-token');
}

function testJwtCookieInterceptorFulfillment(
  isAuthUrl,
  isAccessTokenExpired,
  queueRequests,
  rejectRefreshAccessToken,
  expects,
) {
  it(`${expects.name} when isAuthUrl=${isAuthUrl} isAccessTokenExpired=${isAccessTokenExpired}`, () => {
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client, rejectRefreshAccessToken);
    client.isAuthUrl.mockReturnValue(isAuthUrl);
    client.isAccessTokenExpired.mockReturnValue(isAccessTokenExpired);
    // eslint-disable-next-line no-underscore-dangle
    axiosConfig.__Rewire__('queueRequests', queueRequests);
    const fulfilledResult = client.interceptors.request.handlers[0].fulfilled({});
    expects(client);

    if (rejectRefreshAccessToken) {
      fulfilledResult.catch(() => {
        expect(client.logout).toHaveBeenCalled();
      });
    }
  });
}

function testCsrfTokenInterceptorFulfillment(
  isCsrfExempt,
  method,
  queueRequests,
  csrfTokens,
  expects,
  expectHeaderSet,
) {
  it(`${expects.name} when isCsrfExempt=${isCsrfExempt} and method=${method} and queueRequests=${queueRequests} and csrfTokens=${JSON.stringify(csrfTokens)}`, () => {
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client);
    client.isCsrfExempt.mockReturnValue(isCsrfExempt);
    /* eslint-disable no-underscore-dangle */
    axiosConfig.__Rewire__('queueRequests', queueRequests);
    axiosConfig.__Rewire__('csrfTokens', csrfTokens);
    /* eslint-enable no-underscore-dangle */
    const fulfilledResult = client.interceptors.request.handlers[1].fulfilled({
      url: 'https://testserver.org',
      method,
      headers: {},
    });
    expects(client);

    if (expectHeaderSet) {
      if (client.getCsrfToken.mock.calls.length || queueRequests) {
        fulfilledResult.then((request) => {
          expectCsrfHeaderSet(request);
        });
      } else {
        expectCsrfHeaderSet(fulfilledResult);
      }
    }
  });
}

function testResponseInterceptorRejection(error, expects) {
  it(`${expects.name} when error=${error}`, () => {
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client);
    client.interceptors.response.handlers[0].rejected(error)
      .catch(() => {
        expects(client);
      });
  });
}

describe('getAuthenticatedAPIClient', () => {
  it('returns a singleton', () => {
    const client1 = getAuthenticatedAPIClient(authConfig);
    const client2 = getAuthenticatedAPIClient(authConfig);
    expect(client2).toBe(client1);
  });
});

describe('logAPIErrorResponse', () => {
  it('logs API request that caused error', () => {
    const client1 = getAuthenticatedAPIClient(authConfig);
    const client2 = getAuthenticatedAPIClient(authConfig);
    expect(client2).toBe(client1);
  });
});

describe('AuthenticatedAPIClient auth interface', () => {
  const client = getAuthenticatedAPIClient(authConfig);

  it('has method getAuthenticationState that returns authentication state when valid JWT cookie exists', () => {
    mockCookies.get.mockReturnValueOnce(encodedValidJwt);
    const result = client.getAuthenticationState();
    expect(result.authentication.userId).toBeDefined();
    expect(result.authentication.userId).toEqual(validJwt.user_id);
    expect(result.authentication.username).toBeDefined();
    expect(result.authentication.username).toEqual(validJwt.preferred_username);
  });

  it('has method getAuthenticationState that returns empty state when no JWT cookie exists', () => {
    const result = client.getAuthenticationState();
    expect(result.authentication).toBeUndefined();
  });

  it('ensurePublicOrAuthencationAndCookies redirects to login', () => {
    window.location.assign = jest.fn();
    const loginUrl = process.env.LOGIN_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${loginUrl}?next=${expectedRedirectUrl}`;
    expect(client.ensurePublicOrAuthencationAndCookies()).toBe(false);
    expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
  });

  it('ensurePublicOrAuthencationAndCookies redirects to logout', () => {
    window.location.assign = jest.fn();
    const logoutUrl = process.env.LOGOUT_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${logoutUrl}?redirect_url=${expectedRedirectUrl}`;
    mockCookies.get.mockReturnValueOnce(null).mockReturnValueOnce(userInfo);
    expect(client.ensurePublicOrAuthencationAndCookies()).toBe(false);
    expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
  });

  it('ensurePublicOrAuthencationAndCookies returns true', () => {
    mockCookies.get.mockReturnValueOnce(encodedValidJwt);
    expect(client.ensurePublicOrAuthencationAndCookies()).toBe(true);
  });

  it('has method isAccessTokenExpired', () => {
    mockCookies.get.mockReturnValueOnce(encodedValidJwt);
    expect(client.isAccessTokenExpired()).toBe(false);
    mockCookies.get.mockReturnValueOnce(encodedExpiredJwt);
    expect(client.isAccessTokenExpired()).toBe(true);
  });

  it('has method login', () => {
    const loginUrl = process.env.LOGIN_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${loginUrl}?next=${expectedRedirectUrl}`;
    [process.env.BASE_URL, undefined].forEach((redirectUrl) => {
      window.location.assign = jest.fn();
      client.login(redirectUrl);
      expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
    });
  });

  it('has method logout', () => {
    const logoutUrl = process.env.LOGOUT_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${logoutUrl}?redirect_url=${expectedRedirectUrl}`;
    [process.env.BASE_URL, undefined].forEach((redirectUrl) => {
      window.location.assign = jest.fn();
      client.logout(redirectUrl);
      expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
    });
  });

  it('has method refreshAccessToken', () => {
    client.post = jest.fn();

    client.post.mockReturnValueOnce(new Promise(resolve => resolve()));
    client.refreshAccessToken();
    expect(client.post).toHaveBeenCalled();

    const message = 'Failed to refresh access token.';
    // eslint-disable-next-line prefer-promise-reject-errors
    client.post.mockReturnValueOnce(new Promise((resolve, reject) => reject({ message })));
    client.refreshAccessToken()
      .catch((error) => {
        expect(error.message).toEqual(message);
      });
  });

  it('has method isAuthUrl', () => {
    const authUrl = process.env.REFRESH_ACCESS_TOKEN_ENDPOINT;
    const nonAuthUrl = 'http://example.com';
    expect(client.isAuthUrl(authUrl)).toBe(true);
    expect(client.isAuthUrl(nonAuthUrl)).toBe(false);
  });

  it('has method getCsrfToken', () => {
    client.get = jest.fn();
    const mockResponse = {};

    client.get.mockReturnValueOnce(new Promise(resolve => resolve(mockResponse)));
    client.getCsrfToken();
    expect(client.get).toHaveBeenCalled();
  });

  it('has method isCsrfExempt', () => {
    const csrfExemptUrl = process.env.REFRESH_ACCESS_TOKEN_ENDPOINT;
    const nonCsrfExemptUrl = 'http://example.com';
    expect(client.isCsrfExempt(csrfExemptUrl)).toBe(true);
    expect(client.isCsrfExempt(nonCsrfExemptUrl)).toBe(false);
  });
});

describe('AuthenticatedAPIClient request headers', () => {
  it('should contain USE-JWT-COOKIE', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    expect(client.defaults.headers.common['USE-JWT-COOKIE']).toBe(true);
  });
});

describe('AuthenticatedAPIClient ensureValidJWTCookie request interceptor', () => {
  [
    /* isAuthUrl, isAccessTokenExpired, queueRequests, rejectRefreshAccessToken, expects */
    [true, true, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [true, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [false, true, false, false, expectRefreshAccessTokenToHaveBeenCalled],
    [false, true, false, true, expectRefreshAccessTokenToHaveBeenCalled],
    [false, true, true, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [false, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
  ].forEach((mockValues) => {
    testJwtCookieInterceptorFulfillment(...mockValues);
  });

  it('returns error if it is rejected', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const error = new Error('It failed!');
    client.interceptors.request.handlers[0].rejected(error)
      .catch((rejection) => {
        expect(rejection).toBe(error);
      });
  });
});

describe('AuthenticatedAPIClient ensureCsrfToken request interceptor', () => {
  [
    /* isCsrfExempt, method, queueRequests, csrfTokens, expects, expectHeaderSet */
    [false, 'POST', false, {}, expectGetCsrfTokenToHaveBeenCalled, true],
    [false, 'POST', true, {}, expectGetCsrfTokenToNotHaveBeenCalled, true],
    [false, 'POST', false, { 'testserver.org': 'test-csrf-token' }, expectGetCsrfTokenToNotHaveBeenCalled, true],
    [true, 'POST', false, {}, expectGetCsrfTokenToNotHaveBeenCalled, false],
    [false, 'GET', false, {}, expectGetCsrfTokenToNotHaveBeenCalled, false],
    [true, 'GET', false, {}, expectGetCsrfTokenToNotHaveBeenCalled, false],
  ].forEach((mockValues) => {
    testCsrfTokenInterceptorFulfillment(...mockValues);
  });

  it('returns error if it is rejected', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const error = new Error('It failed!');
    client.interceptors.request.handlers[1].rejected(error)
      .catch((rejection) => {
        expect(rejection).toBe(error);
      });
  });
});

describe('AuthenticatedAPIClient response interceptor', () => {
  const data = 'Response data';
  const request = { url: 'https://example.com' };
  [
    [{ response: { status: 401, data }, request, message: 'Failed' }, expectLogoutToHaveBeenCalled],
    [{ response: {} }, expectLogoutToNotHaveBeenCalled],
    [{ request }, expectLogoutToNotHaveBeenCalled],
    [{}, expectLogoutToNotHaveBeenCalled],
  ].forEach((mockValues) => {
    testResponseInterceptorRejection(...mockValues);
  });

  it('returns response if it is fulfilled', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const response = { data: 'It worked!' };
    const result = client.interceptors.response.handlers[0].fulfilled(response);
    expect(result).toBe(response);
  });
});
