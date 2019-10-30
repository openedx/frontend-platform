import React, { useContext } from 'react';
import { Route } from 'react-router-dom';

import AppContext from './AppContext';
import LoginRedirect from './LoginRedirect';

/**
 * Redirects to the login page when the route becomes active and the user is not authenticated.
 */
export default function AuthenticatedRoute(props) {
  const { authenticatedUser } = useContext(AppContext);

  // We need to let Route "render" the redirect - if we did it here in AuthenticatedRoute, it'd
  // execute immediately, rather than when the router determines the route should become active.
  if (authenticatedUser === null) {
    return <Route {...props} component={LoginRedirect} />;
  }
  return (
    <Route {...props} />
  );
}
