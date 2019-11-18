import PropTypes from 'prop-types';
import { publish } from '../pubSub';

export const AUTHENTICATED_USER_TOPIC = 'AUTHENTICATED_USER';
export const AUTHENTICATED_USER_CHANGED = `${AUTHENTICATED_USER_TOPIC}.CHANGED`;

const configShape = {
  configService: PropTypes.shape({
    getConfig: PropTypes.func.isRequired,
  }).isRequired,
  loggingService: PropTypes.shape({
    logError: PropTypes.func.isRequired,
    logInfo: PropTypes.func.isRequired,
  }).isRequired,
};

const serviceShape = {
  logInfo: PropTypes.func.isRequired,
  logError: PropTypes.func.isRequired,
};

let service = null;

export const configure = (AuthService, config) => {
  PropTypes.checkPropTypes(configShape, config, 'property', 'Logging');
  service = new AuthService(config);
  PropTypes.checkPropTypes(serviceShape, service, 'property', 'LoggingService');
  return service;
};

/**
 * Gets the apiClient singleton which is an axios instance.
 *
 * @returns {HttpClient} Singleton. A configured axios http client
 */
export const getAuthenticatedHttpClient = () => service.authenticatedHttpClient;

/**
 * If it exists, returns the user data representing the currently authenticated user. If the user is
 * anonymous, returns null.
 *
 * @returns {UserData|null}
 */
export const getAuthenticatedUser = () => service.authenticatedUser;

/**
 * Sets the authenticated user to the provided value.
 *
 * @param {UserData|null}
 * @emits AUTHENTICATED_USER_CHANGED
 */
export const setAuthenticatedUser = (authenticatedUser) => {
  service.authenticatedUser = authenticatedUser;
  publish(AUTHENTICATED_USER_CHANGED);
};

export function getAuthService() {
  if (!service) {
    throw Error('You must first configure the auth service.');
  }
  return service;
}

export function resetAuthService() {
  service = null;
}

/**
 * A configured axios client. See axios docs for more
 * info https://github.com/axios/axios. All the functions
 * below accept isPublic and isCsrfExempt in the request
 * config options. Setting these to true will prevent this
 * client from attempting to refresh the jwt access token
 * or a csrf token respectively.
 *
 * ```
 *  // A public endpoint (no jwt token refresh)
 *  apiClient.get('/path/to/endpoint', { isPublic: true });
 * ```
 *
 * ```
 *  // A csrf exempt endpoint
 *  apiClient.post('/path/to/endpoint', { data }, { isCsrfExempt: true });
 * ```
 *
 * @typedef HttpClient
 * @property {function} get
 * @property {function} head
 * @property {function} options
 * @property {function} delete (csrf protected)
 * @property {function} post (csrf protected)
 * @property {function} put (csrf protected)
 * @property {function} patch (csrf protected)
  */

/**
 * @typedef UserData
 * @property {string} userId
 * @property {string} username
 * @property {array} roles
 * @property {bool} administrator
 */
