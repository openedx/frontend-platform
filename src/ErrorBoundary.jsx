import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { logAPIErrorResponse } from '@edx/frontend-logging';

import ErrorPage from './ErrorPage';

/*
  Error boundary component used to log caught errors and display the error page.
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
    logAPIErrorResponse(`${error} ${info}`);
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
