import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import { FormattedMessage } from '../i18n';

/**
 * An error page that displays a generic message for unexpected errors.  Also contains a "Try
 * Again" button to refresh the page.
 *
 * @memberof module:React
 * @extends {Component}
 */
class ErrorPage extends Component {
  /* istanbul ignore next */
  reload() {
    global.location.reload();
  }
  render() {
    const { message } = this.props;
    return (
      <div className="container-fluid py-5 justify-content-center align-items-start text-center">
        <div className="row">
          <div className="col">
            <p className="my-0 py-5 text-muted">
              <FormattedMessage
                id="unexpected.error.message.text"
                defaultMessage="An unexpected error occurred. Please click the button below to refresh the page."
                description="error message when an unexpected error occurs"
              />
            </p>
            {message && (
              <div role="alert">
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Button
              buttonType="primary"
              onClick={this.reload}
              label={
                <FormattedMessage
                  id="unexpected.error.button.text"
                  defaultMessage="Try Again"
                  description="text for button that tries to reload the app by refreshing the page"
                />
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

ErrorPage.propTypes = {
  message: PropTypes.string,
};

ErrorPage.defaultProps = {
  message: null,
};

export default ErrorPage;
