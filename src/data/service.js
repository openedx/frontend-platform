import { redirectToLogin } from '@edx/frontend-auth';
import App from '../App';
import { camelCaseObject } from '../api';

// eslint-disable-next-line import/prefer-default-export
export async function getAuthenticatedUserAccount() {
  const { username } = App.authenticatedUser;
  const { data } = await App.apiClient.get(`${App.config.LMS_BASE_URL}/api/user/v1/accounts/${username}`);
  return camelCaseObject(data);
}

function breakOnRedirectFromLogin() {
  const isRedirectFromLoginPage = global.document.referrer &&
    global.document.referrer.startsWith(App.config.LOGIN_URL);
  if (isRedirectFromLoginPage) {
    throw new Error('Redirect from login page. Rejecting to avoid infinite redirect loop.');
  }
}

export function loginRedirect() {
  breakOnRedirectFromLogin();
  redirectToLogin(global.location.href);
}
