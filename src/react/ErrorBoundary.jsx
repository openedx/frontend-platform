import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { logError, logInfo } from '../logging';
import { getConfig } from '../config';

import ErrorPage from './ErrorPage';

function shouldQuietError(error) {
  if (!('QUIET_ERROR_REGEXES' in getConfig())) {
    return false;
  }
  const quietErrorRegexes = getConfig().QUIET_ERROR_REGEXES.split(';');
  const errorString = error.toString();
  return quietErrorRegexes.some(regex => regex.matches(errorString));
}

/**
 * Error boundary component used to log caught errors and display the error page.
 *
 * @memberof module:React
 * @extends {Component}
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const log = shouldQuietError(error) ? logInfo : logError;
    log(error, { stack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};

ErrorBoundary.defaultProps = {
  children: null,
};
