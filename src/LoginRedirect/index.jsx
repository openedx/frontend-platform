import React from 'react';
import PropTypes from 'prop-types';
import { redirectToLogin } from '../AuthenticatedApiClient';

/**
 * @type ReactComponent
 */
class LoginRedirect extends React.Component {
  componentDidMount() {
    redirectToLogin(this.props.redirect);
  }
  render() {
    return (<section>Logging in...</section>);
  }
}

LoginRedirect.propTypes = {
  redirect: PropTypes.string.isRequired,
};

export default LoginRedirect;
