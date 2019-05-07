import PubSub from 'pubsub-js';
import Cookies from 'universal-cookie';
import { NewRelicLoggingService } from '@edx/frontend-logging';

import applyMockAuthInterface from './mockAuthInterface';
import axiosConfig from '../axiosConfig';
import getAuthenticatedAPIClient from '../index';

const authConfig = {
  appBaseUrl: process.env.BASE_URL,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  loggingService: NewRelicLoggingService, // any concrete logging service will do
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
const validJwt = Object.assign({ exp: tomorrow.getTime() / 1000 }, jwt);
const encodedValidJwt = `header.${btoa(JSON.stringify(validJwt))}`;

const mockCookies = {
  get: jest.fn(),
};
jest.genMockFromModule('universal-cookie');
Cookies.mockImplementation(() => mockCookies);
jest.mock('universal-cookie');

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
  mockAccessToken,
  isAccessTokenExpired,
  queueRequests,
  rejectRefreshAccessToken,
  expects,
) {
  // eslint-disable-next-line consistent-return
  it(`${expects.name} when isAuthUrl=${isAuthUrl} mockAccessToken=${mockAccessToken} isAccessTokenExpired=${isAccessTokenExpired}`, () => {
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client, rejectRefreshAccessToken);
    client.isAuthUrl.mockReturnValue(isAuthUrl);
    client.getDecodedAccessToken.mockReturnValue(mockAccessToken);
    client.isAccessTokenExpired.mockReturnValue(isAccessTokenExpired);
    // eslint-disable-next-line no-underscore-dangle
    axiosConfig.__Rewire__('queueRequests', queueRequests);
    const fulfilledResult = client.interceptors.request.handlers[0].fulfilled({});
    expects(client);

    if (rejectRefreshAccessToken) {
      return fulfilledResult.catch(() => {
        expect(client.logout).toHaveBeenCalled();
      });
    } else { // eslint-disable-line no-else-return
      expect(client.logout).not.toHaveBeenCalled();
      expect(fulfilledResult).toBeInstanceOf(Object); // from above: fullfilled({})
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

describe('getAuthenticatedAPIClient', () => {
  it('returns a singleton', () => {
    const client1 = getAuthenticatedAPIClient(authConfig);
    const client2 = getAuthenticatedAPIClient(authConfig);
    expect(client2).toBe(client1);
  });
});

describe('AuthenticatedAPIClient auth interface', () => {
  const client = getAuthenticatedAPIClient(authConfig);
  window.location.assign = jest.fn();

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

  it('has method isAccessTokenExpired', () => {
    expect(client.isAccessTokenExpired(validJwt)).toBe(false);
    expect(client.isAccessTokenExpired(expiredJwt)).toBe(true);
    expect(client.isAccessTokenExpired()).toBe(true);
  });

  it('has method login', () => {
    const loginUrl = process.env.LOGIN_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${loginUrl}?next=${expectedRedirectUrl}`;
    [process.env.BASE_URL, undefined].forEach((redirectUrl) => {
      client.login(redirectUrl);
      expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
    });
  });

  it('has method logout', () => {
    const logoutUrl = process.env.LOGOUT_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${logoutUrl}?redirect_url=${expectedRedirectUrl}`;
    [process.env.BASE_URL, undefined].forEach((redirectUrl) => {
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

  it('ensurePublicOrAuthenticationAndCookies fires callback when public route', () => {
    const mockCallback = jest.fn();
    client.refreshAccessToken = jest.fn();
    client.ensurePublicOrAuthenticationAndCookies('/public/', mockCallback);
    expect(client.refreshAccessToken).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });

  it('ensurePublicOrAuthenticationAndCookies redirects to login when no valid JWT', () => {
    const mockCallback = jest.fn();
    const loginUrl = process.env.LOGIN_URL;
    const expectedRedirectUrl = encodeURIComponent(process.env.BASE_URL);
    const expectedLocation = `${loginUrl}?next=${expectedRedirectUrl}`;
    client.isAccessTokenExpired = jest.fn();
    client.isAccessTokenExpired.mockReturnValueOnce(true);
    client.refreshAccessToken = jest.fn();
    client.refreshAccessToken.mockReturnValueOnce(new Promise((resolve, reject) => {
      reject({ message: 'Failed!' }); // eslint-disable-line prefer-promise-reject-errors
    }));
    client.ensurePublicOrAuthenticationAndCookies('', mockCallback);
    expect(mockCallback).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith(expectedLocation);
  });

  it('ensurePublicOrAuthenticationAndCookies fires callback after JWT refreshed', () => {
    const mockCallback = jest.fn();
    client.isAccessTokenExpired = jest.fn();
    client.isAccessTokenExpired.mockReturnValueOnce(true);
    client.refreshAccessToken = jest.fn();
    client.refreshAccessToken.mockReturnValueOnce(new Promise((resolve) => {
      resolve();
    }));
    client.ensurePublicOrAuthenticationAndCookies('', mockCallback)
      .then(() => {
        expect(mockCallback).toHaveBeenCalled();
      });
  });

  it('ensurePublicOrAuthenticationAndCookies fires callback when valid JWT', () => {
    const mockCallback = jest.fn();
    client.isAccessTokenExpired = jest.fn();
    client.isAccessTokenExpired.mockReturnValueOnce(false);
    client.refreshAccessToken = jest.fn();
    client.ensurePublicOrAuthenticationAndCookies('', mockCallback);
    expect(client.refreshAccessToken).not.toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
  });
});

describe('AuthenticatedAPIClient request headers', () => {
  it('should contain USE-JWT-COOKIE', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    expect(client.defaults.headers.common['USE-JWT-COOKIE']).toBe(true);
  });
});

describe('AuthenticatedAPIClient ensureValidJWTCookie request interceptor', () => {
  beforeEach(() => {
    PubSub.clearAllSubscriptions();
  });

  [
    /*
    isAuthUrl, mockAccessToken, isAccessTokenExpired, queueRequests,
    rejectRefreshAccessToken, expects
    */
    [true, null, true, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [true, {}, true, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [true, null, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [true, {}, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [false, null, true, false, false, expectRefreshAccessTokenToHaveBeenCalled],
    [false, {}, true, false, false, expectRefreshAccessTokenToHaveBeenCalled],
    [false, {}, true, false, true, expectRefreshAccessTokenToHaveBeenCalled],
    [false, {}, true, true, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [false, null, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
    [false, {}, false, false, false, expectRefreshAccessTokenToNotHaveBeenCalled],
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

  it('redirects to logout if a token refresh fails', () => {
    const rejectRefreshAccessToken = true;
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client, rejectRefreshAccessToken);
    client.isAuthUrl.mockReturnValue(false);
    client.getDecodedAccessToken.mockReturnValue({});
    client.isAccessTokenExpired.mockReturnValue(true);
    // eslint-disable-next-line no-underscore-dangle
    axiosConfig.__Rewire__('queueRequests', false);
    const fulfilledResult = client.interceptors.request.handlers[0].fulfilled({});
    return fulfilledResult.catch(() => {
      expect(client.logout).toHaveBeenCalled();
    });
  });

  it('executes the handleRefreshAccessTokenFailure instead of logout if a token refresh fails', () => {
    const rejectRefreshAccessToken = true;
    const client = getAuthenticatedAPIClient(authConfig);
    client.handleRefreshAccessTokenFailure = jest.fn();
    applyMockAuthInterface(client, rejectRefreshAccessToken);
    client.isAuthUrl.mockReturnValue(false);
    client.getDecodedAccessToken.mockReturnValue({});
    client.isAccessTokenExpired.mockReturnValue(true);
    // eslint-disable-next-line no-underscore-dangle
    axiosConfig.__Rewire__('queueRequests', false);
    const fulfilledResult = client.interceptors.request.handlers[0].fulfilled({});

    return fulfilledResult.catch(() => {
      expect(client.logout).not.toHaveBeenCalled();
      expect(client.handleRefreshAccessTokenFailure).toHaveBeenCalled();
      delete client.handleRefreshAccessTokenFailure;
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
  it('returns error if it fails with 401', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const errorResponse = { response: { status: 401, data: 'it failed' } };
    client.interceptors.response.handlers[0].rejected(errorResponse)
      .catch((promiseError) => {
        expect(promiseError).toBe(errorResponse);
      });
  });
  it('returns error if token refresh fails with 401', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const errorResponse = {
      response: {
        status: 401,
        data: 'it failed',
        config: { url: authConfig.refreshAccessTokenEndpoint },
      },
    };
    client.interceptors.response.handlers[0].rejected(errorResponse)
      .catch((promiseError) => {
        expect(promiseError).toBe(errorResponse);
      });
  });
  it('returns error if it fails with 403', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const errorResponse = { response: { status: 403, data: 'it failed' } };
    client.interceptors.response.handlers[0].rejected(errorResponse)
      .catch((promiseError) => {
        expect(promiseError).toBe(errorResponse);
      });
  });
  it('returns response if it is fulfilled', () => {
    const client = getAuthenticatedAPIClient(authConfig);
    const response = { data: 'It worked!' };
    const result = client.interceptors.response.handlers[0].fulfilled(response);
    expect(result).toBe(response);
  });
});
