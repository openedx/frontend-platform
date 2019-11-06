import React, { Component } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-i18n';
import { logInfo } from '@edx/frontend-logging';
import { Link } from 'react-router-dom';

import App from '../src/App';
import AppContext from '../src/AppContext';
import messages from './messages';

App.ensureConfig([
  'EXAMPLE_VAR',
]);

App.mergeConfig({
  EXAMPLE_VAR: process.env.EXAMPLE_VAR,
}, 'ExamplePage');

class ExamplePage extends Component {
  constructor(props, context) {
    super(props, context);

    logInfo('The example page can log info, which means logging is configured correctly.');
  }

  renderAuthenticatedUser() {
    if (this.context.authenticatedUser === null) {
      return null;
    }
    return (
      <div>
        <p>Authenticated Username: <strong>{this.context.authenticatedUser.username}</strong></p>
        <p>
          Authenticated user&apos;s name:
          <strong>{this.context.authenticatedUser.name}</strong>
          (Only available if user account has been fetched)
        </p>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>{this.context.config.SITE_NAME} example page.</h1>
        <p>{this.props.intl.formatMessage(messages['example.message'])}</p>
        {this.renderAuthenticatedUser()}
        <p>EXAMPLE_VAR env var came through: <strong>{App.config.EXAMPLE_VAR}</strong></p>
        <p>Visit <Link to="/authenticated">authenticated page</Link>.</p>
      </div>
    );
  }
}

ExamplePage.contextType = AppContext;

ExamplePage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ExamplePage);
