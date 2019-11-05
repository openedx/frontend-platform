import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import LoginRedirect from '../LoginRedirect';

/**
 * @type ReactComponent
 */
const PrivateRoute = ({
  component: Component,
  isAuthenticated,
  path,
  redirect,
  ...rest
}) => (
  isAuthenticated === true
    ? <Route
      {...rest}
      path={path}
      component={Component}
    />
    : <Route
      {...rest}
      path={path}
      render={renderProps => (
        <LoginRedirect
          {...renderProps}
          redirect={redirect + renderProps.location.pathname}
        />
      )}
    />
);

PrivateRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired,
};


const mapStateToProps = state => ({
  isAuthenticated: !!state.authentication && !!state.authentication.username,
});

export default connect(mapStateToProps)(PrivateRoute);
