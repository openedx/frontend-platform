import React, { Component } from 'react';
import { injectIntl } from '@edx/frontend-i18n';
import { logInfo } from '@edx/frontend-logging';

import AppContext from '../dist/AppContext';
import messages from './messages';

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
      </div>
    )
  }
}

ExamplePage.contextType = AppContext;

export default injectIntl(ExamplePage);