import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Container, Row, Col,
} from '@edx/paragon';

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
      <Container fluid className="py-5 justify-content-center align-items-start text-center">
        <Row>
          <Col>
            <p className="text-muted">
              <FormattedMessage
                id="unexpected.error.message.text"
                defaultMessage="An unexpected error occurred. Please click the button below to refresh the page."
                description="error message when an unexpected error occurs"
              />
            </p>
            {message && (
              <div role="alert" className="my-4">
                <p>{message}</p>
              </div>
            )}
            <Button onClick={this.reload}>
              <FormattedMessage
                id="unexpected.error.button.text"
                defaultMessage="Try again"
                description="text for button that tries to reload the app by refreshing the page"
              />
            </Button>
          </Col>
        </Row>
      </Container>
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
