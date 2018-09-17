import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import LoginRedirect from '../LoginRedirect';

const PrivateRoute = ({
  component: Component,
  isAuthenticated,
  path,
  authenticatedAPIClient,
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
      render={props => (
        <LoginRedirect
          {...props}
          redirect={redirect + path}
          authenticatedAPIClient={authenticatedAPIClient}
        />
      )}
    />
);

PrivateRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  authenticatedAPIClient: PropTypes.shape({
    login: PropTypes.func.isRequired,
  }).isRequired,
  redirect: PropTypes.string.isRequired,
};


const mapStateToProps = state => ({
  isAuthenticated: !!state.authentication,
});

export default connect(mapStateToProps)(PrivateRoute);
