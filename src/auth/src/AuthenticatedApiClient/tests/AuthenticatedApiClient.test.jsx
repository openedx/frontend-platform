/* eslint-disable arrow-body-style */
import axios from 'axios';
import Cookies from 'universal-cookie';
import MockAdapter from 'axios-mock-adapter';
import getJwtToken from '../getJwtToken';
import getCsrfToken from '../getCsrfToken';
import {
  configure,
  getAuthenticatedApiClient,
  ensureAuthenticatedUser,
  redirectToLogin,
  redirectToLogout,
} from '../index';

const mockLoggingService = {
  logInfo: jest.fn(),
  logError: jest.fn(),
};

const authConfig = {
  appBaseUrl: process.env.BASE_URL,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  csrfTokenApiPath: '/get-csrf-token',
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  loggingService: mockLoggingService,
};

// Set up mocks
// ---------------------------------------------------------------

const secondsInDay = 60 * 60 * 24;
const yesterdayInSeconds = (Date.now() / 1000) - secondsInDay;
const tomorrowInSeconds = (Date.now() / 1000) + secondsInDay;

const jwtTokens = {
  expired: {
    decoded: {
      user_id: '12345',
      preferred_username: 'test',
      administrator: false,
      exp: yesterdayInSeconds,
    },
  },
  valid: {
    decoded: {
      user_id: '12345',
      preferred_username: 'test',
      administrator: false,
      exp: tomorrowInSeconds,
    },
    formatted: {
      userId: '12345',
      username: 'test',
      administrator: false,
      roles: [],
    },
  },
  validWithRoles: {
    decoded: {
      user_id: '12345',
      preferred_username: 'test',
      administrator: true,
      roles: ['role1', 'role2'],
      exp: tomorrowInSeconds,
    },
    formatted: {
      userId: '12345',
      username: 'test',
      administrator: true,
      roles: ['role1', 'role2'],
    },
  },
};

// encode mock JWT tokens
Object.keys(jwtTokens).forEach((jwtTokenName) => {
  const decodedJwt = jwtTokens[jwtTokenName].decoded;
  jwtTokens[jwtTokenName].encoded = `header.${btoa(JSON.stringify(decodedJwt))}`;
});

const mockCsrfToken = 'thetokenvalue';
const mockApiEndpointPath = `${process.env.BASE_URL}/api/v1/test`;

window.location.assign = jest.fn();
const mockCookies = new Cookies();

// This sets the mock adapter on the default instance
const axiosMock = new MockAdapter(axios);
const accessTokenAxios = axios.create();
const accessTokenAxiosMock = new MockAdapter(accessTokenAxios);
getJwtToken.__Rewire__('httpClient', accessTokenAxios); // eslint-disable-line no-underscore-dangle
const csrfTokensAxios = axios.create();
const csrfTokensAxiosMock = new MockAdapter(csrfTokensAxios);
getCsrfToken.__Rewire__('httpClient', csrfTokensAxios); // eslint-disable-line no-underscore-dangle


const client = getAuthenticatedApiClient(authConfig);

// Helpers
const setJwtCookieTo = (jwtCookieValue) => {
  mockCookies.get.mockImplementation((cookieName) => {
    if (cookieName === authConfig.accessTokenCookieName) {
      return jwtCookieValue;
    }
    return undefined;
  });
};

const setJwtTokenRefreshResponseTo = (status, jwtCookieValue) => {
  accessTokenAxiosMock.onPost().reply(() => {
    setJwtCookieTo(jwtCookieValue);
    return [status];
  });
};


function expectLogout(redirectUrl = process.env.BASE_URL) {
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  expect(window.location.assign)
    .toHaveBeenCalledWith(`${process.env.LOGOUT_URL}?redirect_url=${encodedRedirectUrl}`);
}

function expectLogin(redirectUrl = process.env.BASE_URL) {
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  expect(window.location.assign)
    .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
}

// customAttributes is sent into expect.objectContaining
// and can include other matchers in the object like expect.any(Number)
const expectLogFunctionToHaveBeenCalledWithMessage = (callParams, errorMessage, customAttributes) => {
  const loggedError = callParams[0];
  expect(loggedError.message).toEqual(errorMessage);
  if (customAttributes) {
    expect(callParams[1]).toEqual(expect.objectContaining(customAttributes));
  }
};

const expectSingleCallToJwtTokenRefresh = () => {
  expect(accessTokenAxiosMock.history.post.length).toBe(1);
};

const expectNoCallToJwtTokenRefresh = () => {
  expect(accessTokenAxiosMock.history.post.length).toBe(0);
};

const expectSingleCallToCsrfTokenFetch = () => {
  expect(csrfTokensAxiosMock.history.get.length).toBe(1);
};

const expectNoCallToCsrfTokenFetch = () => {
  expect(csrfTokensAxiosMock.history.get.length).toBe(0);
};

const expectRequestToHaveJwtAuth = (request) => {
  expect(request.headers['USE-JWT-COOKIE']).toBe(true);
  expect(request.withCredentials).toBe(true);
};

const expectRequestToHaveCsrfToken = (request) => {
  expect(request.headers['X-CSRFToken']).toEqual(mockCsrfToken);
};

beforeEach(() => {
  axiosMock.reset();
  accessTokenAxiosMock.reset();
  csrfTokensAxiosMock.reset();
  mockCookies.get.mockReset();
  window.location.assign.mockReset();
  mockLoggingService.logInfo.mockReset();
  mockLoggingService.logError.mockReset();
  getCsrfToken.__Rewire__('csrfTokenCache', {}); // eslint-disable-line no-underscore-dangle
  axiosMock.onGet('/unauthorized').reply(401);
  axiosMock.onGet('/forbidden').reply(403);
  axiosMock.onAny().reply(200);
  csrfTokensAxiosMock
    .onGet(process.env.CSRF_TOKEN_REFRESH)
    .reply(200, { csrfToken: mockCsrfToken });
});

describe('getAuthenticatedApiClient', () => {
  it('returns a singleton', () => {
    const client1 = getAuthenticatedApiClient(authConfig);
    const client2 = getAuthenticatedApiClient(authConfig);
    expect(client2).toBe(client1);
  });

  it('throws an error if supplied an incomplete config', () => {
    expect.hasAssertions();
    try {
      configure({
        notwhatitneeds: 'yup',
      });
    } catch (e) {
      expect(e.message).toEqual('Invalid configuration supplied to frontend auth. appBaseUrl is required.');
    }
  });

  it('throws an error if supplied a logging service without logError', () => {
    expect.hasAssertions();
    try {
      configure({
        ...authConfig,
        loggingService: { logInfo: () => {} },
      });
    } catch (e) {
      expect(e.message).toEqual('Invalid configuration supplied to frontend auth. loggingService.logError must be a function.');
    }
  });

  it('throws an error if supplied a logging service without logInfo', () => {
    expect.hasAssertions();
    try {
      configure({
        ...authConfig,
        loggingService: { logError: () => {} },
      });
    } catch (e) {
      expect(e.message).toEqual('Invalid configuration supplied to frontend auth. loggingService.logInfo must be a function.');
    }
  });

  configure(authConfig);
});

describe('User is logged in', () => {
  describe('No jwt cookie exists on load', () => {
    beforeEach(() => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    describe('Single requests', () => {
      ['get', 'options'].forEach((method) => {
        it(`${method.toUpperCase()}: refreshes the jwt token`, () => {
          return client[method](mockApiEndpointPath).then(() => {
            expectSingleCallToJwtTokenRefresh();
            expectNoCallToCsrfTokenFetch();
            expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
          });
        });
      });

      ['post', 'put', 'patch', 'delete'].forEach((method) => {
        it(`${method.toUpperCase()}: refreshes the csrf and jwt tokens`, () => {
          return client[method](mockApiEndpointPath).then(() => {
            expectSingleCallToJwtTokenRefresh();
            expectSingleCallToCsrfTokenFetch();
            expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
            expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
          });
        });
      });
    });

    describe('Single request to relative url', () => {
      ['post', 'put', 'patch', 'delete'].forEach((method) => {
        it(`${method.toUpperCase()}: refreshes the csrf and jwt tokens`, () => {
          return client[method]('/local/path').then(() => {
            expectSingleCallToJwtTokenRefresh();
            expectSingleCallToCsrfTokenFetch();
            expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
            expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
            expect(csrfTokensAxiosMock.history.get[0].url)
              .toEqual(`${global.location.origin}${authConfig.csrfTokenApiPath}`);
          });
        });
      });
    });

    describe('Multiple parallel requests', () => {
      ['get', 'options'].forEach((method) => {
        it(`${method.toUpperCase()}: refresh the jwt token only once`, () => {
          return Promise.all([
            client[method](mockApiEndpointPath),
            client[method](mockApiEndpointPath),
          ]).then(() => {
            expectSingleCallToJwtTokenRefresh();
            expectNoCallToCsrfTokenFetch();
            expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
            expectRequestToHaveJwtAuth(axiosMock.history[method][1]);
          });
        });
      });

      ['post', 'put', 'patch', 'delete'].forEach((method) => {
        it(`${method.toUpperCase()}: refresh the jwt and csrf tokens only once`, () => {
          return Promise.all([
            client[method](mockApiEndpointPath),
            client[method](mockApiEndpointPath),
          ]).then(() => {
            expectSingleCallToJwtTokenRefresh();
            expectSingleCallToCsrfTokenFetch();
            expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
            expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
            expectRequestToHaveJwtAuth(axiosMock.history[method][1]);
            expectRequestToHaveCsrfToken(axiosMock.history[method][1]);
          });
        });
      });
    });

    describe('Multiple serial requests', () => {
      ['get', 'options'].forEach((method) => {
        it(`${method.toUpperCase()}: refresh the jwt token only once`, () => {
          return client[method](mockApiEndpointPath)
            .then(() => client[method](mockApiEndpointPath))
            .then(() => {
              expectSingleCallToJwtTokenRefresh();
              expectNoCallToCsrfTokenFetch();
              expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
              expectRequestToHaveJwtAuth(axiosMock.history[method][1]);
            });
        });
      });

      ['post', 'put', 'patch', 'delete'].forEach((method) => {
        it(`${method.toUpperCase()}: refreshes the csrf and jwt tokens only once`, () => {
          return client[method](mockApiEndpointPath)
            .then(() => client[method](mockApiEndpointPath))
            .then(() => {
              expectSingleCallToJwtTokenRefresh();
              expectSingleCallToCsrfTokenFetch();
              expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
              expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
              expectRequestToHaveJwtAuth(axiosMock.history[method][1]);
              expectRequestToHaveCsrfToken(axiosMock.history[method][1]);
            });
        });
      });
    });
  });

  describe('An expired token is found on load', () => {
    beforeEach(() => {
      setJwtCookieTo(jwtTokens.expired.encoded);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    ['get', 'options'].forEach((method) => {
      it(`${method.toUpperCase()}: refreshes the jwt token`, () => {
        return client[method](mockApiEndpointPath).then(() => {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
        });
      });
    });

    ['post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: refreshes the csrf and jwt tokens`, () => {
        return client[method](mockApiEndpointPath).then(() => {
          expectSingleCallToJwtTokenRefresh();
          expectSingleCallToCsrfTokenFetch();
          expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
          expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
        });
      });
    });
  });

  describe('A valid token is found on load', () => {
    beforeEach(() => {
      setJwtCookieTo(jwtTokens.valid.encoded);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    ['get', 'options'].forEach((method) => {
      it(`${method.toUpperCase()}: does not attempt to refresh the jwt token`, () => {
        setJwtCookieTo(jwtTokens.valid.encoded);
        return client[method](mockApiEndpointPath).then(() => {
          expectNoCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
        });
      });
    });

    ['post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: refreshes the csrf token but does not attempt to refresh the jwt token`, () => {
        setJwtCookieTo(jwtTokens.valid.encoded);
        return client[method](mockApiEndpointPath).then(() => {
          expectNoCallToJwtTokenRefresh();
          expectSingleCallToCsrfTokenFetch();
          expectRequestToHaveJwtAuth(axiosMock.history[method][0]);
          expectRequestToHaveCsrfToken(axiosMock.history[method][0]);
        });
      });
    });
  });
});

describe('Token refresh failures', () => {
  describe('The refresh request fails for an unknown reason', () => {
    beforeEach(() => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(403, null);
    });

    ['get', 'options', 'post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: throws an error and calls logError`, () => {
        expect.hasAssertions();
        return client[method](mockApiEndpointPath).catch(() => {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[0],
            '[frontend-auth] HTTP Client Error: 403 http://auth.example.com/api/refreshToken (empty response)',
            {
              httpErrorRequestMethod: 'post',
              httpErrorResponseData: '(empty response)',
              httpErrorStatus: 403,
              httpErrorType: 'api-response-error',
              httpErrorRequestUrl: 'http://auth.example.com/api/refreshToken',
            },
          );
        });
      });
    });
  });

  describe('The refresh request fails due to a timeout', () => {
    beforeEach(() => {
      setJwtCookieTo(null);
      accessTokenAxiosMock.onPost().timeout();
    });

    ['get', 'options', 'post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: throws an error and calls logError`, () => {
        expect.hasAssertions();
        return client[method](mockApiEndpointPath).catch(() => {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[0],
            '[frontend-auth] HTTP Client Error: timeout of 0ms exceeded post http://auth.example.com/api/refreshToken',
            {
              httpErrorRequestMethod: 'post',
              httpErrorMessage: 'timeout of 0ms exceeded',
              httpErrorType: 'api-request-config-error',
              httpErrorRequestUrl: 'http://auth.example.com/api/refreshToken',
            },
          );
        });
      });
    });
  });

  // This test case is unexpected, but occurring in production. See ARCH-948 for
  // more information on a similar situation that was happening prior to this
  // refactor in Oct 2019.
  describe('Unexpected case where token refresh succeeds but no new cookie is found', () => {
    beforeEach(() => {
      setJwtCookieTo(null);
      // The JWT cookie is null despite a 200 response.
      setJwtTokenRefreshResponseTo(200, null);
    });

    ['get', 'options', 'post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: throws an error and calls logError`, () => {
        expect.hasAssertions();
        return client[method](mockApiEndpointPath).catch(() => {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[0],
            '[frontend-auth] Access token is still null after successful refresh.',
            { axiosResponse: expect.any(Object) },
          );
        });
      });
    });
  });

  // This test case is unexpected, but occurring in production. See ARCH-948 for
  // more information on a similar situation that was happening prior to this
  // refactor in Oct 2019.
  describe('Unexpected case where token refresh succeeds but the cookie is malformed', () => {
    beforeEach(() => {
      setJwtCookieTo('malformed jwt');
      // The JWT cookie is malformed despite a 200 response.
      setJwtTokenRefreshResponseTo(200, 'malformed jwt');
    });

    ['get', 'options', 'post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: throws an error and calls logError`, () => {
        expect.hasAssertions();
        return client[method](mockApiEndpointPath).catch(() => {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[0],
            '[frontend-auth] Error decoding JWT token',
            { cookieValue: 'malformed jwt' },
          );
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[1],
            '[frontend-auth] Error decoding JWT token',
            { cookieValue: 'malformed jwt' },
          );
        });
      });
    });
  });
});

describe('User is logged out', () => {
  beforeEach(() => {
    setJwtCookieTo(null);
    setJwtTokenRefreshResponseTo(401, null);
  });

  ['get', 'options', 'post', 'put', 'patch', 'delete'].forEach((method) => {
    it(`${method.toUpperCase()}: does not redirect to login`, () => {
      return client[method](mockApiEndpointPath).then(() => {
        expectSingleCallToJwtTokenRefresh();
        expect(window.location.assign).not.toHaveBeenCalled();
      });
    });
  });
});

describe('JWT exempt requests using isPublic request configuration', () => {
  beforeEach(() => {
    setJwtCookieTo(null);
    setJwtTokenRefreshResponseTo(401, null);
  });

  ['get', 'options'].forEach((method) => {
    it(`${method.toUpperCase()}: does not refresh the JWT`, () => {
      return client[method](mockApiEndpointPath, { isPublic: true }).then(() => {
        expectNoCallToJwtTokenRefresh();
        expectNoCallToCsrfTokenFetch();
      });
    });
  });

  ['post', 'put', 'patch'].forEach((method) => {
    it(`${method.toUpperCase()}: does not refresh the JWT`, () => {
      return client[method](mockApiEndpointPath, {}, { isPublic: true }).then(() => {
        expectNoCallToJwtTokenRefresh();
        expectSingleCallToCsrfTokenFetch();
      });
    });
  });

  it('DELETE: does not refresh the JWT', () => {
    return client.delete(mockApiEndpointPath, { isPublic: true }).then(() => {
      expectNoCallToJwtTokenRefresh();
      expectSingleCallToCsrfTokenFetch();
    });
  });
});

describe('CSRF exempt requests using isCsrfExempt request configuration', () => {
  beforeEach(() => {
    setJwtCookieTo(null);
    setJwtTokenRefreshResponseTo(401, null);
  });

  ['get', 'options', 'delete'].forEach((method) => {
    it(`${method.toUpperCase()}: does not fetch a Csrf token`, () => {
      return client[method](mockApiEndpointPath, { isCsrfExempt: true }).then(() => {
        expectSingleCallToJwtTokenRefresh();
        expectNoCallToCsrfTokenFetch();
      });
    });
  });

  ['post', 'put', 'patch'].forEach((method) => {
    it(`${method.toUpperCase()}: does not fetch a Csrf token`, () => {
      return client[method](mockApiEndpointPath, {}, { isCsrfExempt: true }).then(() => {
        expectSingleCallToJwtTokenRefresh();
        expectNoCallToCsrfTokenFetch();
      });
    });
  });
});

beforeEach(() => {
  setJwtCookieTo(null);
  setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
});

describe('Info logging for authorization errors from api requests with a valid token', () => {
  it('logs info for 401 unauthorized api responses', () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    expect.hasAssertions();
    return client.get('/unauthorized').catch(() => {
      expectLogFunctionToHaveBeenCalledWithMessage(
        mockLoggingService.logInfo.mock.calls[0],
        'HTTP Client Error: 401 /unauthorized (empty response)',
        {
          httpErrorRequestMethod: 'get',
          httpErrorStatus: 401,
          httpErrorType: 'api-response-error',
          httpErrorRequestUrl: '/unauthorized',
          httpErrorResponseData: '(empty response)',
        },
      );
      expectRequestToHaveJwtAuth(axiosMock.history.get[0]);
    });
  });

  it('logs info for 403 forbidden api responses', () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    expect.hasAssertions();
    return client.get('/forbidden').catch(() => {
      expectLogFunctionToHaveBeenCalledWithMessage(
        mockLoggingService.logInfo.mock.calls[0],
        'HTTP Client Error: 403 /forbidden (empty response)',
        {
          httpErrorRequestMethod: 'get',
          httpErrorStatus: 403,
          httpErrorType: 'api-response-error',
          httpErrorRequestUrl: '/forbidden',
          httpErrorResponseData: '(empty response)',
        },
      );
      expectRequestToHaveJwtAuth(axiosMock.history.get[0]);
    });
  });
});

describe('Redirect helper functions', () => {
  it('can redirect to login with different redirect url parameters', () => {
    redirectToLogin('http://edx.org/dashboard');
    expectLogin('http://edx.org/dashboard');
    redirectToLogin();
    expectLogin(process.env.BASE_URL);
  });

  it('can redirect to logout with different redirect url parameters', () => {
    redirectToLogout('http://edx.org/');
    expectLogout('http://edx.org/');
    redirectToLogout();
    expectLogout(process.env.BASE_URL);
  });
});

describe('ensureAuthenticatedUser', () => {
  describe('when the user is logged in', () => {
    it('refreshes a missing jwt token and returns a user access token', () => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
      return ensureAuthenticatedUser().then((authenticatedUserAccessToken) => {
        expect(authenticatedUserAccessToken).toEqual(jwtTokens.valid.formatted);
        expectSingleCallToJwtTokenRefresh();
      });
    });

    it('refreshes a missing jwt token and returns a user access token with roles', () => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.validWithRoles.encoded);
      return ensureAuthenticatedUser().then((authenticatedUserAccessToken) => {
        expect(authenticatedUserAccessToken).toEqual(jwtTokens.validWithRoles.formatted);
        expectSingleCallToJwtTokenRefresh();
      });
    });

    // This test case is unexpected, but occurring in production. See ARCH-948 for
    // more information on a similar situation that was happening prior to this
    // refactor in Oct 2019.
    it('throws an error and calls logError if there was a problem getting the jwt cookie', () => {
      setJwtCookieTo(null);
      // The JWT cookie is null despite a 200 response.
      setJwtTokenRefreshResponseTo(200, null);
      expect.hasAssertions();
      return ensureAuthenticatedUser().catch(() => {
        expectSingleCallToJwtTokenRefresh();
        expectLogFunctionToHaveBeenCalledWithMessage(
          mockLoggingService.logError.mock.calls[0],
          '[frontend-auth] Access token is still null after successful refresh.',
          { axiosResponse: expect.any(Object) },
        );
      });
    });
  });

  describe('when the user is logged out', () => {
    beforeEach(() => {
      setJwtTokenRefreshResponseTo(401, null);
    });

    it('attempts to refresh a missing jwt token and redirects user to login', () => {
      setJwtCookieTo(null);
      return ensureAuthenticatedUser('/route').then((authenticatedUserAccessToken) => {
        expect(authenticatedUserAccessToken).toBeNull();
        expectSingleCallToJwtTokenRefresh();
        expectLogin(`${process.env.BASE_URL}/route`);
      });
    });

    it('throws an error and does not redirect if the referrer is the login page', () => {
      jest.spyOn(global.document, 'referrer', 'get').mockReturnValue(process.env.LOGIN_URL);
      setJwtCookieTo(null);
      expect.hasAssertions();
      return ensureAuthenticatedUser().catch(() => {
        expectSingleCallToJwtTokenRefresh();
        expect(window.location.assign).not.toHaveBeenCalled();
        expectLogFunctionToHaveBeenCalledWithMessage(
          mockLoggingService.logError.mock.calls[0],
          '[frontend-auth] Redirect from login page. Rejecting to avoid infinite redirect loop.',
        );
      });
    });
  });
});
