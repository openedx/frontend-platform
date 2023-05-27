/* eslint-disable arrow-body-style, no-console */
import axios from 'axios';
import Cookies from 'universal-cookie';
import MockAdapter from 'axios-mock-adapter';
import AxiosJwtAuthService from './AxiosJwtAuthService';

const mockLoggingService = {
  logInfo: jest.fn(),
  logError: jest.fn(),
  setCustomAttribute: jest.fn(),
};

const authOptions = {
  config: {
    BASE_URL: process.env.BASE_URL,
    ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
    CSRF_TOKEN_API_PATH: '/get-csrf-token',
    LMS_BASE_URL: process.env.LMS_BASE_URL,
    LOGIN_URL: process.env.LOGIN_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
    REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  },
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

global.location ??= { ...global.location, assign: jest.fn() };

const mockCookies = new Cookies();

let accessTokenAxios = null;
let csrfTokensAxios = null;
let axiosMock = null;
let accessTokenAxiosMock = null;
let csrfTokensAxiosMock = null;
let client = null;
let cachedClient = null;

// Helpers
const setJwtCookieTo = (jwtCookieValue) => {
  mockCookies.get.mockImplementation((cookieName) => {
    if (cookieName === authOptions.config.ACCESS_TOKEN_COOKIE_NAME) {
      return jwtCookieValue;
    }
    return undefined;
  });
};

const setJwtTokenRefreshResponseTo = (status, jwtCookieValue, responseEpochSeconds = null) => {
  accessTokenAxiosMock.onPost().reply(() => {
    setJwtCookieTo(jwtCookieValue);
    if (responseEpochSeconds) {
      const data = { response_epoch_seconds: responseEpochSeconds, expires_epoch_seconds: responseEpochSeconds + 3600 };
      return [status, data];
    }
    return [status];
  });
};

function expectLogout(redirectUrl = process.env.BASE_URL) {
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  expect(global.location.assign)
    .toHaveBeenCalledWith(`${process.env.LOGOUT_URL}?redirect_url=${encodedRedirectUrl}`);
}

function expectLogin(redirectUrl = process.env.BASE_URL) {
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  expect(global.location.assign)
    .toHaveBeenCalledWith(`${process.env.LOGIN_URL}?next=${encodedRedirectUrl}`);
}

// customAttributes is sent into expect.objectContaining
// and can include other matchers in the object like expect.any(Number)
const expectLogFunctionToHaveBeenCalledWithMessage = (
  callParams,
  errorMessage,
  customAttributes,
) => {
  const loggedError = callParams[0];
  expect(typeof loggedError === 'string' ? loggedError : loggedError.message).toEqual(errorMessage);
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

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    };
  },
});

const { location } = global;
const service = new AxiosJwtAuthService(authOptions);

beforeEach(() => {
  accessTokenAxios = service.getJwtTokenService().getHttpClient();
  csrfTokensAxios = service.getCsrfTokenService().getHttpClient();
  // This sets the mock adapter on the default instance
  axiosMock = new MockAdapter(service.getAuthenticatedHttpClient());
  accessTokenAxiosMock = new MockAdapter(accessTokenAxios);
  csrfTokensAxiosMock = new MockAdapter(csrfTokensAxios);

  client = service.getAuthenticatedHttpClient();
  cachedClient = service.getAuthenticatedHttpClient({ useCache: true });

  service.setAuthenticatedUser(null);
  axiosMock.reset();
  accessTokenAxiosMock.reset();
  csrfTokensAxiosMock.reset();
  mockCookies.get.mockReset();
  delete global.location;
  global.location = {
    assign: jest.fn(),
    origin: 'http://localhost',
  };
  mockLoggingService.logInfo.mockReset();
  mockLoggingService.logError.mockReset();
  mockLoggingService.setCustomAttribute.mockReset();
  service.getCsrfTokenService().clearCsrfTokenCache();
  axiosMock.onGet('/unauthorized').reply(401);
  axiosMock.onGet('/forbidden').reply(403);
  axiosMock.onAny().reply(200);
  csrfTokensAxiosMock
    .onGet(process.env.CSRF_TOKEN_REFRESH)
    .reply(200, { csrfToken: mockCsrfToken });
  axios.defaults.maxRetries = 0;
  csrfTokensAxios.defaults.maxRetries = 0;
  accessTokenAxios.defaults.maxRetries = 0;
});

afterEach(() => {
  global.location = location;
});

describe('applyMiddleware', () => {
  it('should apply all middleware to the http clients in the service', () => {
    const clients = [
      service.authenticatedHttpClient, service.httpClient,
      service.cachedAuthenticatedHttpClient, service.cachedHttpClient,
    ].filter(Boolean);

    const middleware1 = jest.fn();
    const middleware2 = jest.fn();

    service.applyMiddleware([middleware1, middleware2]);
    expect(middleware1).toHaveBeenCalledTimes(clients.length);
    expect(middleware2).toHaveBeenCalledTimes(clients.length);
  });

  it('throws an error and calls logError', () => {
    const error = new Error('middleware error');
    const middleware = jest.fn(() => { throw error; });

    try {
      service.applyMiddleware([middleware]);
    } catch (e) {
      expectLogFunctionToHaveBeenCalledWithMessage(
        mockLoggingService.logError.mock.calls[0],
        `[frontend-auth] ${error.message}`,
      );
    }
  });
});

describe('getAuthenticatedHttpClient', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it('returns a singleton', () => {
    const client1 = service.getAuthenticatedHttpClient();
    const client2 = service.getAuthenticatedHttpClient();
    expect(client2).toBe(client1);
  });

  it('returns a cached singleton', () => {
    const client1 = service.getAuthenticatedHttpClient({ useCache: true });
    const client2 = service.getAuthenticatedHttpClient({ useCache: true });
    expect(client2).toBe(client1);
    expect(client1).not.toBeNull();
    expect(client2).not.toBeNull();
  });

  it('returns a different singleton between the cached and non cached versions', () => {
    const client1 = service.getAuthenticatedHttpClient({ useCache: true });
    const client2 = service.getAuthenticatedHttpClient();
    expect(client2).not.toBe(client1);
    expect(client1).not.toBeNull();
    expect(client2).not.toBeNull();

    // the cached client should have ``storage`` property if configured properly
    expect(client1).toHaveProperty('storage');
    expect(client2).not.toHaveProperty('storage');
  });
});

describe('authenticatedHttpClient usage', () => {
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
                .toEqual(`${global.location.origin}${authOptions.config.CSRF_TOKEN_API_PATH}`);
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
              '[frontend-auth] Axios Error (Response): 403 - See custom attributes for details.',
              {
                httpErrorRequestMethod: 'post',
                httpErrorResponseData: '(empty response)',
                httpErrorStatus: 403,
                httpErrorType: 'api-response-error',
                httpErrorRequestUrl: 'http://localhost:18000/login_refresh',
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

      it('throws an error and calls logError', async () => {
        expect.hasAssertions();
        try {
          await client.get(mockApiEndpointPath);
        } catch (e) {
          expectSingleCallToJwtTokenRefresh();
          expectNoCallToCsrfTokenFetch();
          expectLogFunctionToHaveBeenCalledWithMessage(
            mockLoggingService.logError.mock.calls[0],
            '[frontend-auth] Axios Error (Config): See custom attributes for details.',
            {
              httpErrorRequestMethod: 'post',
              httpErrorMessage: 'timeout of 0ms exceeded',
              httpErrorType: 'api-request-config-error',
              httpErrorRequestUrl: 'http://localhost:18000/login_refresh',
            },
          );
        }
      });

      it('retries the refresh request and succeeds', async () => {
        accessTokenAxiosMock.reset();
        accessTokenAxiosMock.onPost().timeoutOnce();
        accessTokenAxiosMock.onPost().replyOnce(() => {
          setJwtCookieTo(jwtTokens.valid.encoded);
          return [200];
        });
        accessTokenAxios.defaults.maxRetries = 1;

        await client.get(mockApiEndpointPath);
        expect(accessTokenAxiosMock.history.post.length).toBe(2);
        expectNoCallToCsrfTokenFetch();
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

    // This tests adding additional debug info for an unexpected error occurring in production.
    describe('Unexpected case where token refresh succeeds with response time, but no new cookie is found', () => {
      const browserDriftSeconds = 4;

      beforeEach(() => {
        setJwtCookieTo(null);
        // set server time to be 4 seconds in future
        const responseEpochSeconds = (Date.now() / 1000) + browserDriftSeconds;
        // The JWT cookie is null despite a 200 response.
        setJwtTokenRefreshResponseTo(200, null, responseEpochSeconds);
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
              {
                axiosResponse: expect.any(Object),
                browserDriftSeconds: expect.toBeWithinRange(browserDriftSeconds - 0.1, browserDriftSeconds + 0.1),
              },
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
          expect(global.location.assign).not.toHaveBeenCalled();
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

  describe('Info logging for authorization errors from api requests with a valid token', () => {
    beforeEach(() => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    it('logs info for 401 unauthorized api responses', () => {
      setJwtCookieTo(jwtTokens.valid.encoded);
      expect.hasAssertions();
      return client.get('/unauthorized').catch(() => {
        expectLogFunctionToHaveBeenCalledWithMessage(
          mockLoggingService.logInfo.mock.calls[0],
          'Axios Error (Response): 401 - See custom attributes for details.',
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
          'Axios Error (Response): 403 - See custom attributes for details.',
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
});

describe('redirectToLogin', () => {
  it('can redirect to login with different redirect url parameters', () => {
    service.redirectToLogin('http://edx.org/dashboard');
    expectLogin('http://edx.org/dashboard');
    service.redirectToLogin();
    expectLogin(process.env.BASE_URL);
  });
});

describe('redirectToLogout', () => {
  it('can redirect to logout with different redirect url parameters', () => {
    service.redirectToLogout('http://edx.org/');
    expectLogout('http://edx.org/');
    service.redirectToLogout();
    expectLogout(process.env.BASE_URL);
  });
});

describe('hydrateAuthenticatedUser', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  it('should not change authenticated user if it is null', async () => {
    await service.hydrateAuthenticatedUser();
    expect(service.getAuthenticatedUser()).toBeNull();
  });

  it('should call the user accounts API and merge the result into authenticatedUser', async () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    service.setAuthenticatedUser({
      userId: 'abc123',
      username: 'the_user',
      roles: [],
      administrator: false,
      name: 'test user',
    });
    axiosMock.onGet(`${authOptions.config.LMS_BASE_URL}/api/user/v1/accounts/the_user`).reply(200, {
      additional: 'data',
    });
    await service.hydrateAuthenticatedUser();
    const authenticatedUser = service.getAuthenticatedUser();
    expect(authenticatedUser).toEqual({
      userId: 'abc123',
      username: 'the_user',
      roles: [],
      administrator: false,
      additional: 'data',
      name: 'test user',
    });
  });
});

describe('ensureAuthenticatedUser', () => {
  describe('when the user is logged in', () => {
    it('refreshes a missing jwt token and returns a user access token', () => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
      return service.ensureAuthenticatedUser().then((authenticatedUserAccessToken) => {
        expect(authenticatedUserAccessToken).toEqual(jwtTokens.valid.formatted);
        expectSingleCallToJwtTokenRefresh();
      });
    });

    it('refreshes a missing jwt token and returns a user access token with roles', () => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.validWithRoles.encoded);
      return service.ensureAuthenticatedUser().then((authenticatedUserAccessToken) => {
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
      return service.ensureAuthenticatedUser().catch(() => {
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
      expect.hasAssertions();
      return service.ensureAuthenticatedUser(`${process.env.BASE_URL}/route`).catch((unauthorizedError) => {
        expect(unauthorizedError.isRedirecting).toBe(true);
        expectSingleCallToJwtTokenRefresh();
        expectLogin(`${process.env.BASE_URL}/route`);
      });
    });

    it('throws an error and does not redirect if the referrer is the login page', () => {
      jest.spyOn(global.document, 'referrer', 'get').mockReturnValue(process.env.LOGIN_URL);
      setJwtCookieTo(null);
      expect.hasAssertions();
      return service.ensureAuthenticatedUser().catch(() => {
        expectSingleCallToJwtTokenRefresh();
        expect(global.location.assign).not.toHaveBeenCalled();
        expectLogFunctionToHaveBeenCalledWithMessage(
          mockLoggingService.logError.mock.calls[0],
          '[frontend-auth] Redirect from login page. Rejecting to avoid infinite redirect loop.',
        );
      });
    });
  });
});

describe('fetchAuthenticatedUser', () => {
  it('refreshes a missing jwt token and returns a user access token', () => {
    setJwtCookieTo(null);
    setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    return service.fetchAuthenticatedUser().then((authenticatedUserAccessToken) => {
      expect(authenticatedUserAccessToken).toEqual(jwtTokens.valid.formatted);
      expect(mockLoggingService.setCustomAttribute).toHaveBeenCalledWith('userId', jwtTokens.valid.formatted.userId);
      expectSingleCallToJwtTokenRefresh();
    });
  });

  it('found a valid token from cache and no call for refresh', () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    return service.fetchAuthenticatedUser().then((authenticatedUserAccessToken) => {
      expect(authenticatedUserAccessToken).toEqual(jwtTokens.valid.formatted);
      expectNoCallToJwtTokenRefresh();
    });
  });

  it('refreshes the token forcefully even if token is not yet expired', () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    setJwtTokenRefreshResponseTo(401, null);
    return service.fetchAuthenticatedUser({ forceRefresh: true }).then((authenticatedUserAccessToken) => {
      expect(authenticatedUserAccessToken).toEqual(null);
      expect(mockLoggingService.setCustomAttribute).not.toHaveBeenCalled();
      expectSingleCallToJwtTokenRefresh();
    });
  });
});

// These tests all make real network calls to http://httpbin.org.
describe('Cache Functionality', () => {
  const getUrl = 'https://jsonplaceholder.typicode.com/posts/1';
  const postUrl = 'https://jsonplaceholder.typicode.com/posts';
  const requestId = 'get-jsonplaceholder-posts';

  const getWithRequestId = async (config = {}) => cachedClient.get(getUrl, {
    id: requestId,
    ...config,
  });

  const postWithRequestId = async (config = {}) => cachedClient.post(postUrl, {
    ...config,
  });

  describe('No JWT Token Found on Load', () => {
    beforeEach(async () => {
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);

      // Remove cache for previous requests
      await cachedClient.storage.remove(requestId);
    });

    it('Cached GET: does not refresh JWT on second request with valid JWT', async () => {
      const response1 = await getWithRequestId();

      // Verify first request was not pulled from cache
      expect(response1.cached).toEqual(false);

      const response2 = await getWithRequestId();
      expectSingleCallToJwtTokenRefresh();
      // Like the uncached, client the CSRF token shouldn't be fetched either
      expectNoCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(response2.config);
      expect(response2.cached).toEqual(true);
    });

    it('Cached GET: clears cached entry if cache.override = true', async () => {
      const response1 = await getWithRequestId();
      // Verify first request was not pulled from cache
      expect(response1.cached).toEqual(false);

      const response2 = await getWithRequestId();
      expect(response2.cached).toEqual(true);

      const response3 = await getWithRequestId({
        cache: {
          override: true,
        },
      });
      expect(response3.cached).toEqual(false);
    });

    it('Always refreshes the JWT on GET requests with invalid JWT', async () => {
      const response1 = await getWithRequestId();
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
      expectRequestToHaveJwtAuth(response1.config);

      const response2 = await getWithRequestId();
      expect(accessTokenAxiosMock.history.post.length).toBe(2);
      // Like the uncached client, the CSRF token shouldn't be fetched either
      expectNoCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(response2.config);
      expect(response2.cached).toEqual(true);
    });

    it('Always refreshes the JWT on POST requests', async () => {
      const response1 = await postWithRequestId();
      setJwtCookieTo(null);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
      expectRequestToHaveJwtAuth(response1.config);

      const response2 = await postWithRequestId();
      expectRequestToHaveJwtAuth(response2.config);
      // Verify the JWT got refreshed for both requests that do not have a JWT
      expect(accessTokenAxiosMock.history.post.length).toBe(2);
      // Like the uncached client the CSRF token should only be fetched once
      expect(csrfTokensAxiosMock.history.get.length).toBe(1);
      // Making a post request with axios-cache-adapter automatically invalidates the cache
      expect(response2.request.fromCache).toEqual(undefined);
    });

    it('Parallel GET Requests: refresh the jwt token only once', async () => {
      const responses = await Promise.all([
        getWithRequestId(),
        getWithRequestId(),
      ]);

      expectSingleCallToJwtTokenRefresh();
      expectNoCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(responses[0].config);
      expectRequestToHaveJwtAuth(responses[1].config);
    });

    it('Parallel POST Requests: refresh the jwt and csrf tokens only once', async () => {
      const responses = await Promise.all([
        postWithRequestId(),
        postWithRequestId(),
      ]);
      expectSingleCallToJwtTokenRefresh();
      expectSingleCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(responses[0].config);
      expectRequestToHaveCsrfToken(responses[0].config);
      expectRequestToHaveJwtAuth(responses[1].config);
      expectRequestToHaveCsrfToken(responses[1].config);
    });
  });

  describe('An expired token is found on load', () => {
    beforeEach(() => {
      setJwtCookieTo(jwtTokens.expired.encoded);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    it('GET request: refreshes the jwt token', async () => {
      const response = await cachedClient.get(getUrl);
      expectSingleCallToJwtTokenRefresh();
      expectNoCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(response.config);
    });

    ['post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: refreshes the csrf and jwt tokens`, async () => {
        const response = await cachedClient[method](method === 'post' ? postUrl : getUrl);
        expectSingleCallToJwtTokenRefresh();
        expectSingleCallToCsrfTokenFetch();
        expectRequestToHaveJwtAuth(response.config);
        expectRequestToHaveCsrfToken(response.config);
      });
    });
  });

  describe('A valid token is found on load', () => {
    beforeEach(() => {
      setJwtCookieTo(jwtTokens.valid.encoded);
      setJwtTokenRefreshResponseTo(200, jwtTokens.valid.encoded);
    });

    it('GET request: does not attempt to refresh the jwt token', async () => {
      setJwtCookieTo(jwtTokens.valid.encoded);
      const response = await getWithRequestId();
      expectNoCallToJwtTokenRefresh();
      expectNoCallToCsrfTokenFetch();
      expectRequestToHaveJwtAuth(response.config);
    });

    ['post', 'put', 'patch', 'delete'].forEach((method) => {
      it(`${method.toUpperCase()}: refreshes the csrf token but does not attempt to refresh the jwt token`, async () => {
        setJwtCookieTo(jwtTokens.valid.encoded);
        const response = await cachedClient[method](method === 'post' ? postUrl : getUrl, {
          id: requestId,
        });
        expectNoCallToJwtTokenRefresh();
        expectSingleCallToCsrfTokenFetch();
        expectRequestToHaveJwtAuth(response.config);
        expectRequestToHaveCsrfToken(response.config);
      });
    });
  });

  describe('Token refresh failures', () => {
    describe('The refresh request fails for an unknown reason', () => {
      beforeEach(() => {
        setJwtCookieTo(null);
        setJwtTokenRefreshResponseTo(403, null);
      });

      ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
        it(`${method.toUpperCase()}: throws an error and calls logError`, async () => {
          expect.hasAssertions();
          try {
            await cachedClient[method](getUrl, {
              id: requestId,
            });
          } catch (err) {
            expectSingleCallToJwtTokenRefresh();
            expectNoCallToCsrfTokenFetch();
            expectLogFunctionToHaveBeenCalledWithMessage(
              mockLoggingService.logError.mock.calls[0],
              '[frontend-auth] Axios Error (Response): 403 - See custom attributes for details.',
              {
                httpErrorRequestMethod: 'post',
                httpErrorResponseData: '(empty response)',
                httpErrorStatus: 403,
                httpErrorType: 'api-response-error',
                httpErrorRequestUrl: 'http://localhost:18000/login_refresh',
              },
            );
          }
        });
      });
    });
  });
});
