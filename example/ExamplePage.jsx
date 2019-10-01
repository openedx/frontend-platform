import React, { Component } from 'react';
import { injectIntl } from '@edx/frontend-i18n';
import { logInfo } from '@edx/frontend-logging';

import App from '../dist/App';
import AppContext from '../dist/AppContext';
import messages from './messages';

App.ensureConfig([
  'EXAMPLE_VAR'
]);

App.mergeConfig({
  EXAMPLE_VAR: process.env.EXAMPLE_VAR
}, 'ExamplePage');

class ExamplePage extends Component {
  constructor(props, context) {
    super(props, context);

    logInfo('The example page can log info, which means logging is configured correctly.');
  }

  render() {
    return (
      <div>
        <h1>{this.context.config.SITE_NAME} example page.</h1>
        <p>{this.props.intl.formatMessage(messages['example.message'])}</p>
        <p>Authenticated Username: {this.context.authenticatedUser.username}</p>
        <p>EXAMPLE_VAR env var came through: {App.config.EXAMPLE_VAR}</p>
      </div>
    )
  }
}

ExamplePage.contextType = AppContext;

export default injectIntl(ExamplePage);