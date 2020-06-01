/* eslint-disable arrow-body-style, no-console */
import axios from 'axios';
import Cookies from 'universal-cookie';
import MockAdapter from 'axios-mock-adapter';
import { httpClient as accessTokenAxios } from './getJwtToken';
import { httpClient as csrfTokensAxios, clearCsrfTokenCache } from './getCsrfToken';
import {
  configure,
  getAuthenticatedHttpClient,
  ensureAuthenticatedUser,
  redirectToLogin,
  redirectToLogout,
  hydrateAuthenticatedUser,
  getAuthenticatedUser,
  setAuthenticatedUser,
} from './AxiosJwtAuthService';

const mockLoggingService = {
  logInfo: jest.fn(),
  logError: jest.fn(),
};

const authOptions = {
  config: {
    appBaseUrl: process.env.BASE_URL,
    accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
    csrfTokenApiPath: '/get-csrf-token',
    lmsBaseUrl: process.env.LMS_BASE_URL,
    loginUrl: process.env.LOGIN_URL,
    logoutUrl: process.env.LOGOUT_URL,
    refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
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

window.location.assign = jest.fn();
const mockCookies = new Cookies();

// This sets the mock adapter on the default instance
const axiosMock = new MockAdapter(axios);
const accessTokenAxiosMock = new MockAdapter(accessTokenAxios);
const csrfTokensAxiosMock = new MockAdapter(csrfTokensAxios);


configure(authOptions);
const client = getAuthenticatedHttpClient();

// Helpers
const setJwtCookieTo = (jwtCookieValue) => {
  mockCookies.get.mockImplementation((cookieName) => {
    if (cookieName === authOptions.config.accessTokenCookieName) {
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
const expectLogFunctionToHaveBeenCalledWithMessage = (
  callParams,
  errorMessage,
  customAttributes,
) => {
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
  setAuthenticatedUser(null);
  axiosMock.reset();
  accessTokenAxiosMock.reset();
  csrfTokensAxiosMock.reset();
  mockCookies.get.mockReset();
  window.location.assign.mockReset();
  mockLoggingService.logInfo.mockReset();
  mockLoggingService.logError.mockReset();
  clearCsrfTokenCache();
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

describe('getAuthenticatedHttpClient', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    configure(authOptions);
    console.error.mockRestore();
  });

  it('returns a singleton', () => {
    const client1 = getAuthenticatedHttpClient();
    const client2 = getAuthenticatedHttpClient();
    expect(client2).toBe(client1);
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
                .toEqual(`${global.location.origin}${authOptions.config.csrfTokenApiPath}`);
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
              '[frontend-auth] Axios Error (Response): 403 http://localhost:18000/login_refresh (empty response)',
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
            '[frontend-auth] Axios Error (Config): timeout of 0ms exceeded post http://localhost:18000/login_refresh',
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
          'Axios Error (Response): 401 /unauthorized (empty response)',
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
          'Axios Error (Response): 403 /forbidden (empty response)',
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
    redirectToLogin('http://edx.org/dashboard');
    expectLogin('http://edx.org/dashboard');
    redirectToLogin();
    expectLogin(process.env.BASE_URL);
  });
});

describe('redirectToLogout', () => {
  it('can redirect to logout with different redirect url parameters', () => {
    redirectToLogout('http://edx.org/');
    expectLogout('http://edx.org/');
    redirectToLogout();
    expectLogout(process.env.BASE_URL);
  });
});

describe('hydrateAuthenticatedUser', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  it('should not change authenticated user if it is null', async () => {
    await hydrateAuthenticatedUser();
    expect(getAuthenticatedUser()).toBeNull();
  });

  it('should call the user accounts API and merge the result into authenticatedUser', async () => {
    setJwtCookieTo(jwtTokens.valid.encoded);
    setAuthenticatedUser({
      userId: 'abc123',
      username: 'the_user',
      roles: [],
      administrator: false,
    });
    axiosMock.onGet(`${authOptions.config.lmsBaseUrl}/api/user/v1/accounts/the_user`).reply(200, {
      additional: 'data',
    });
    await hydrateAuthenticatedUser();
    const authenticatedUser = getAuthenticatedUser();
    expect(authenticatedUser).toEqual({
      userId: 'abc123',
      username: 'the_user',
      roles: [],
      administrator: false,
      additional: 'data',
    });
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
      expect.hasAssertions();
      return ensureAuthenticatedUser(`${process.env.BASE_URL}/route`).catch((unauthorizedError) => {
        expect(unauthorizedError.isRedirecting).toBe(true);
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
