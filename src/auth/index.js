// @ts-check
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
