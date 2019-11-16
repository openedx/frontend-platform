import { ensureAuthenticatedUser, hydrateAuthenticatedUser, fetchAuthenticatedUser } from '../../auth';

export default async function auth(ensureAuthenticated, hydrateAuthenticated) {
  if (ensureAuthenticated) {
    await ensureAuthenticatedUser();
  } else {
    await fetchAuthenticatedUser();
  }

  if (hydrateAuthenticated) {
    // We intentionally do not await the promise returned by hydrateAuthenticatedUser. All the
    // critical data is returned as part of fetch/ensureAuthenticatedUser above, and anything else
    // is a nice-to-have for application code.
    hydrateAuthenticatedUser();
  }
}
