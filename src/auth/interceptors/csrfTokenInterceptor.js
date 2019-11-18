import axios from 'axios';
import { getUrlParts, processAxiosErrorAndThrow } from '../utils';

const createCsrfTokenInterceptor = (options) => {
  const { CSRF_TOKEN_API_PATH, shouldSkip } = options;
  console.log(CSRF_TOKEN_API_PATH);
  const httpClient = axios.create();
  // Set withCredentials to true. Enables cross-site Access-Control requests
  // to be made using cookies, authorization headers or TLS client
  // certificates. More on MDN:
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
  httpClient.defaults.withCredentials = true;
  httpClient.defaults.headers.common['USE-JWT-COOKIE'] = true;

  const csrfTokenCache = {};
  const csrfTokenRequestPromises = {};

  const getCsrfToken = async (url) => {
    let urlParts;
    try {
      urlParts = getUrlParts(url);
    } catch (e) {
      // If the url is not parsable it's likely because a relative
      // path was supplied as the url. This is acceptable and in
      // this case we should use the current origin of the page.
      urlParts = getUrlParts(global.location.origin);
    }

    const { protocol, domain } = urlParts;
    const csrfToken = csrfTokenCache[domain];

    if (csrfToken) {
      return csrfToken;
    }

    if (!csrfTokenRequestPromises[domain]) {
      csrfTokenRequestPromises[domain] = httpClient
        .get(`${protocol}://${domain}${CSRF_TOKEN_API_PATH}`)
        .then((response) => {
          console.log(response);
          csrfTokenCache[domain] = response.data.csrfToken;
          return csrfTokenCache[domain];
        })
        .catch(processAxiosErrorAndThrow)
        .finally(() => {
          delete csrfTokenRequestPromises[domain];
        });
    }

    return csrfTokenRequestPromises[domain];
  };

  // Creating the interceptor inside this closure to
  // maintain reference to the options supplied.
  const interceptor = async (axiosRequestConfig) => {
    if (shouldSkip(axiosRequestConfig)) {
      return axiosRequestConfig;
    }
    const { url } = axiosRequestConfig;
    const csrfToken = await getCsrfToken(url, CSRF_TOKEN_API_PATH);
    const CSRF_HEADER_NAME = 'X-CSRFToken';
    // eslint-disable-next-line no-param-reassign
    axiosRequestConfig.headers[CSRF_HEADER_NAME] = csrfToken;
    return axiosRequestConfig;
  };

  return interceptor;
};

export default createCsrfTokenInterceptor;
