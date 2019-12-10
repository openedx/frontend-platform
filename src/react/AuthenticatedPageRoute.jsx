import React, { useContext } from 'react';
import { Route } from 'react-router-dom';

import AppContext from './AppContext';
import LoginRedirect from './LoginRedirect';
import PageRoute from './PageRoute';

/**
 * A react-router route that redirects to the login page when the route becomes active and the user
 * is not authenticated.  If the application has been initialized with `requireAuthenticatedUser`
 * false, an authenticatedPageRoute can be used to protect a subset of the application's routes,
 * rather than the entire application.
 *
 * Like a `PageRoute`, also calls `sendPageEvent` when the route becomes active.
 *
 * @see PageRoute
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:frontend-platform/react
 * @param {Object} props
 */
export default function AuthenticatedPageRoute(props) {
  const { authenticatedUser } = useContext(AppContext);

  // We need to let Route "render" the redirect - if we did it here in AuthenticatedRoute, it'd
  // execute immediately, rather than when the router determines the route should become active.
  if (authenticatedUser === null) {
    return <Route {...props} component={LoginRedirect} />;
  }
  return (
    <PageRoute {...props} />
  );
}
