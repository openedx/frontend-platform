import React, { Component } from 'react';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Button } from '@edx/paragon';

export default class ErrorPage extends Component {
  reload() {
    window.location.reload();
  }

  render() {
    return (
      <div className="container-fluid py-5 justify-content-center align-items-start text-center">
        <div className="row">
          <div className="col">
            <p className="my-0 py-5 text-muted">
              <FormattedMessage
                id="unexpected.error.message.text"
                defaultMessage="An unexpected error occurred. Please click the button below to return to refresh the page."
                description="error message when an unexpected error occurs"
              />
            </p>
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
