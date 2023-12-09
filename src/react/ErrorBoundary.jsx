import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { logError } from '../logging';

import ErrorPage from './ErrorPage';

/**
 * Error boundary component used to log caught errors and display the error page.
 *
 * @memberof module:React
 * @extends {Component}
 */
class ErrorBoundary extends Component {
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
      return this.props.fallbackComponent || <ErrorPage />;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallbackComponent: PropTypes.node,
};

ErrorBoundary.defaultProps = {
  children: null,
  fallbackComponent: undefined,
};

export default ErrorBoundary;
