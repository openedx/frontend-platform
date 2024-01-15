// @ts-check
/**
 * **Import members from `@openedx/frontend-platform/auth`**
 *
 * Simplifies the process of making authenticated API requests to backend edX services by providing
 * common authN/authZ client code that enables the login/logout flow and handles ensuring the
 * presence of a valid [JWT cookie](https://github.com/openedx/edx-platform/blob/master/openedx/core/djangoapps/oauth_dispatch/docs/decisions/0009-jwt-in-session-cookie.rst).
 *
 * The `initialize` function performs much of the auth configuration for you.  If, however, you're
 * not using the `initialize` function, an authenticated API client can be created via:
 *
 * ```
 * import {
 *   configure,
 *   fetchAuthenticatedUser,
 *   getAuthenticatedHttpClient
 * } from '@edx/frontend-platform/auth';
 * import { getConfig } from '@edx/frontend-platform';
 * import { getLoggingService } from '@edx/frontend-platform/logging';
 *
 * configure({
 *   loggingService: getLoggingService(),
 *   config: getConfig(),
 * });
 *
 * const authenticatedUser = await fetchAuthenticatedUser(); // validates and decodes JWT token
 * const authenticatedHttpClient = getAuthenticatedHttpClient();
 * const response = await getAuthenticatedHttpClient().get(`https://example.com/api/user/data/${authenticatedUser.username}`); // fetching from an authenticated API using user data
 * ```
 *
 * As shown in this example, auth depends on the configuration document and logging.
 *
 * NOTE: The documentation for AxiosJwtAuthService is nearly the same as that for the top-level
 * auth interface, except that it contains some Axios-specific details.
 *
 * @module Auth
 */
export {
  AUTHENTICATED_USER_TOPIC,
  AUTHENTICATED_USER_CHANGED,
  configure,
  getAuthenticatedHttpClient,
  getAuthService,
  getHttpClient,
  getLoginRedirectUrl,
  redirectToLogin,
  getLogoutRedirectUrl,
  redirectToLogout,
  getAuthenticatedUser,
  setAuthenticatedUser,
  fetchAuthenticatedUser,
  ensureAuthenticatedUser,
  hydrateAuthenticatedUser,
} from './interface.js';
export { default as AxiosJwtAuthService } from './AxiosJwtAuthService.js';
export { default as MockAuthService } from './MockAuthService.js';

// Export types too - required for interfaces to be documented by TypeDoc:
/** @typedef {import('./interface.js').AuthService} AuthService */
/** @typedef {import('./interface.js').AuthServiceConstructor} AuthServiceConstructor */
/** @typedef {import('./interface.js').AuthServiceOptions} AuthServiceOptions */
/** @typedef {import('./interface.js').UserData} UserData */
