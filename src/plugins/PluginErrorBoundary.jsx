import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { logError } from '../logging';

export default class PluginErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, { stack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <FormattedMessage
          id="plugin.load.failure.text"
          defaultMessage="This content failed to load."
          description="error message when an unexpected error occurs"
        />
      );
    }

    return this.props.children;
  }
}

PluginErrorBoundary.propTypes = {
  children: PropTypes.node,
};

PluginErrorBoundary.defaultProps = {
  children: null,
};
