import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { logFrontendAuthError, processAxiosErrorAndThrow } from './utils';

const httpClient = axios.create();
// Set withCredentials to true. Enables cross-site Access-Control requests
// to be made using cookies, authorization headers or TLS client
// certificates. More on MDN:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
httpClient.defaults.withCredentials = true;

const cookies = new Cookies();

const decodeJwtCookie = (cookieName) => {
  const cookieValue = cookies.get(cookieName);

  if (cookieValue) {
    try {
      return jwtDecode(cookieValue);
    } catch (e) {
      const error = Object.create(e);
      error.message = 'Error decoding JWT token';
      error.customAttributes = { cookieValue };
      throw error;
    }
  }

  return null;
};

const isTokenExpired = token => !token || token.exp < Date.now() / 1000;

const refreshRequestPromises = {};

const refresh = (tokenCookieName, refreshEndpoint) => {
  if (refreshRequestPromises[tokenCookieName] === undefined) {
    const makeRefreshRequest = async () => {
      let axiosResponse;
      try {
        try {
          axiosResponse = await httpClient.post(refreshEndpoint);
        } catch (error) {
          processAxiosErrorAndThrow(error);
        }
      } catch (error) {
        const userIsUnauthenticated = error.response && error.response.status === 401;
        if (userIsUnauthenticated) {
          // Clean up the cookie if it exists to eliminate any situation
          // where the cookie is not expired but the jwt is expired.
          cookies.remove(tokenCookieName);
          const decodedJwtToken = null;
          return decodedJwtToken;
        }

        // TODO: Network timeouts and other problems will end up in
        // this block of code. We could add logic for retrying token
        // refreshes if we wanted to.
        throw error;
      }

      const decodedJwtToken = decodeJwtCookie(tokenCookieName);

      if (!decodedJwtToken) {
        // This is an unexpected case. The refresh endpoint should
        // set the cookie that is needed. See ARCH-948 for more
        // information on a similar situation that was happening
        // prior to this refactor in Oct 2019.
        const error = new Error('Access token is still null after successful refresh.');
        error.customAttributes = { axiosResponse };
        throw error;
      }

      return decodedJwtToken;
    };

    refreshRequestPromises[tokenCookieName] = makeRefreshRequest().finally(() => {
      delete refreshRequestPromises[tokenCookieName];
    });
  }

  return refreshRequestPromises[tokenCookieName];
};

const getJwtToken = async (tokenCookieName, tokenRefreshEndpoint) => {
  try {
    const decodedJwtToken = decodeJwtCookie(tokenCookieName);
    if (!isTokenExpired(decodedJwtToken)) {
      return decodedJwtToken;
    }
  } catch (e) {
    // Log unexpected error and continue with attempt to refresh it.
    logFrontendAuthError(e);
  }

  try {
    return await refresh(tokenCookieName, tokenRefreshEndpoint);
  } catch (e) {
    logFrontendAuthError(e);
    throw e;
  }
};

export default getJwtToken;
