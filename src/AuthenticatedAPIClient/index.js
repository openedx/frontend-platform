import axios from 'axios';
import { applyAxiosDefaults, applyAxiosInterceptors } from './axiosConfig';
import applyAuthInterface from './authInterface';

let authenticatedAPIClient = null;
let loggingService = null;

function configureLoggingService(incomingLoggingService) {
  const { logError, logInfo } = incomingLoggingService;
  if (typeof logError !== 'function') {
    throw new Error('Frontend auth requires a logging service with a logError method');
  }
  if (typeof logInfo !== 'function') {
    throw new Error('Frontend auth requires a logging service with a logInfo method');
  }
  loggingService = incomingLoggingService;
}

function getLoggingService() {
  /* istanbul ignore next */
  if (loggingService === null) {
    throw new Error('Logging service is missing in frontend auth');
  }
  return loggingService;
}

function getAuthenticatedAPIClient(authConfig) {
  if (authenticatedAPIClient === null) {
    authenticatedAPIClient = axios;
    applyAuthInterface(authenticatedAPIClient, authConfig);
    applyAxiosDefaults(authenticatedAPIClient);
    applyAxiosInterceptors(authenticatedAPIClient);
    configureLoggingService(authConfig.loggingService);
  }

  return authenticatedAPIClient;
}

export { getLoggingService, configureLoggingService };
export default getAuthenticatedAPIClient;
