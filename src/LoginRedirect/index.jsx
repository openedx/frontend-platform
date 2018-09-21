import React from 'react';
import PropTypes from 'prop-types';

class LoginRedirect extends React.Component {
  componentDidMount() {
    this.props.authenticatedAPIClient.login(this.props.redirect);
  }
  render() {
    return (<section>Logging in...</section>);
  }
}

LoginRedirect.propTypes = {
  authenticatedAPIClient: PropTypes.shape({
    login: PropTypes.func.isRequired,
  }).isRequired,
  redirect: PropTypes.string.isRequired,
};

export default LoginRedirect;
