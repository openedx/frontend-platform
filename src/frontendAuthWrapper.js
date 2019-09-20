import { fetchUserAccount as _fetchUserAccount, UserAccountApiService } from '@edx/frontend-auth';
import App from './App';

export const defaultAuthenticatedUser = {
  userId: null,
  username: null,
  roles: [],
  administrator: false,
};

export const fetchUserAccount = (username) => {
  const userAccountApiService = new UserAccountApiService(App.apiClient, App.config.LMS_BASE_URL);
  _fetchUserAccount(userAccountApiService, username);
};
