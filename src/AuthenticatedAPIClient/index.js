import axios from 'axios';

import { applyAxiosDefaults, applyAxiosInterceptors } from './axiosConfig';
import applyAuthInterface from './authInterface';

let authenticatedAPIClient = null;

function getAuthenticatedAPIClient(authConfig) {
  if (authenticatedAPIClient === null) {
    authenticatedAPIClient = axios;
    applyAuthInterface(authenticatedAPIClient, authConfig);
    applyAxiosDefaults(authenticatedAPIClient);
    applyAxiosInterceptors(authenticatedAPIClient);
  }

  return authenticatedAPIClient;
}

export default getAuthenticatedAPIClient;
