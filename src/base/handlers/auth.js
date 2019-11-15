import { getAuthenticatedHttpClient, getAuthenticatedUser, ensureAuthenticatedUser } from '../../auth';
import { getConfig } from '../../config';
import { camelCaseObject } from '../api';

export default async function auth(requireAuthenticatedUser, hydrateAuthenticatedUser) {
  // Get a valid access token for authenticated API access.
  let authenticatedUser = null;

  if (requireAuthenticatedUser) {
    authenticatedUser = await ensureAuthenticatedUser();
  } else {
    authenticatedUser = await getAuthenticatedUser();
  }

  if (authenticatedUser !== null && hydrateAuthenticatedUser) {
    const { username } = authenticatedUser;
    // We use a promise (instead of await) here explicitly so that execution can continue while
    // this request happens.
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}`)
      .then((response) => {
        const { data } = response;
        authenticatedUser = Object.assign({}, authenticatedUser, camelCaseObject(data));
      });
  }
}
