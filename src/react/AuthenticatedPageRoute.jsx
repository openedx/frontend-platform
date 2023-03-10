import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

import AppContext from './AppContext';
import { getLoginRedirectUrl } from '../auth';

/**
 * A react-router route that redirects to the login page when the route becomes active and the user
 * is not authenticated.  If the application has been initialized with `requireAuthenticatedUser`
 * false, an authenticatedPageRoute can be used to protect a subset of the application's routes,
 * rather than the entire application.
 *
 * It can optionally accept an override URL to redirect to instead of the login page.
 *
 * Like a `PageRoute`, also calls `sendPageEvent` when the route becomes active.
 *
 * @see PageRoute
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 * @param {string} props.redirectUrl The URL anonymous users should be redirected to, rather than
 * viewing the route's contents.
 */
export default function AuthenticatedPageRoute({ redirectUrl, children }) {
  const { authenticatedUser } = useContext(AppContext);
  if (authenticatedUser === null) {
    const destination = redirectUrl || getLoginRedirectUrl(global.location.href);
    global.location.assign(destination);
    return null;
  }

  return children;
}

AuthenticatedPageRoute.propTypes = {
  redirectUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
};

AuthenticatedPageRoute.defaultProps = {
  redirectUrl: null,
};
