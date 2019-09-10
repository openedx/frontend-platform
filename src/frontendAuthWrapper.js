import { fetchUserAccount as _fetchUserAccount, UserAccountApiService } from '@edx/frontend-auth';

export const defaultAuthentication = {
  userId: null,
  username: null,
  administrator: false,
};

let userAccountApiService = null;

export const configureUserAccountApiService = (configuration, apiClient) => {
  userAccountApiService = new UserAccountApiService(apiClient, configuration.LMS_BASE_URL);
};

export const fetchUserAccount = username => _fetchUserAccount(userAccountApiService, username);

export const getAuthentication = (apiClient) => {
  const { authentication } = apiClient.getAuthenticationState();
  return authentication === undefined ? defaultAuthentication : {
    userId: authentication.userId,
    username: authentication.username,
    administrator: authentication.administrator,
  };
};
