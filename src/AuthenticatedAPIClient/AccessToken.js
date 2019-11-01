import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { logFrontendAuthError, processAxiosErrorAndThrow } from './utils';

const httpClient = axios.create();
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

export default class AccessToken {
  constructor({ cookieName, refreshEndpoint }) {
    this.cookieName = cookieName;
    this.refreshEndpoint = refreshEndpoint;
  }

  refresh() {
    if (this.refreshRequestPromise === undefined) {
      const makeRefreshRequest = async () => {
        let axiosResponse;
        try {
          try {
            axiosResponse = await httpClient.post(this.refreshEndpoint);
          } catch (error) {
            processAxiosErrorAndThrow(error);
          }
        } catch (error) {
          const userIsUnauthenticated = error.response && error.response.status === 401;
          if (userIsUnauthenticated) {
            // Clean up the cookie if it exists to eliminate any situation
            // where the cookie is not expired but the jwt is expired.
            cookies.remove(this.cookieName);
            const decodedAccessToken = null;
            return decodedAccessToken;
          }

          // TODO: Network timeouts and other problems will end up in
          // this block of code. We could add logic for retrying token
          // refreshes if we wanted to.
          throw error;
        }

        const decodedAccessToken = decodeJwtCookie(this.cookieName);

        if (!decodedAccessToken) {
          // This is an unexpected case. The refresh endpoint should
          // set the cookie that is needed. See ARCH-948 for more
          // information on a similar situation that was happening
          // prior to this refactor in Oct 2019.
          const error = new Error('Access token is still null after successful refresh.');
          error.customAttributes = { axiosResponse };
          throw error;
        }

        return decodedAccessToken;
      };

      this.refreshRequestPromise = makeRefreshRequest().finally(() => {
        delete this.refreshRequestPromise;
      });
    }

    return this.refreshRequestPromise;
  }

  async get() {
    let decodedAccessToken;
    try {
      decodedAccessToken = decodeJwtCookie(this.cookieName);
    } catch (e) {
      // Log unexpected error and continue with attempt to refresh it.
      logFrontendAuthError(e);
      decodedAccessToken = null;
    }

    if (isTokenExpired(decodedAccessToken)) {
      decodedAccessToken = await this.refresh();
    }

    if (!decodedAccessToken) {
      return null;
    }

    const authenticatedUserAndAccessToken = {
      authenticatedUser: {
        userId: decodedAccessToken.user_id,
        username: decodedAccessToken.preferred_username,
        roles: decodedAccessToken.roles ? decodedAccessToken.roles : [],
        administrator: decodedAccessToken.administrator,
      },
      decodedAccessToken,
    };

    return authenticatedUserAndAccessToken;
  }
}
