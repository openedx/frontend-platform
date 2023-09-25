'use client';

import React, {
  useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import {
  dispatchMountedEvent, dispatchReadyEvent, dispatchUnmountedEvent, useHostEvent,
} from './data/hooks';
import { logError } from '../logging';
import { PLUGIN_RESIZE } from './data/constants';

// see example-plugin-app/src/PluginOne.jsx for example of customizing errorFallback
function errorFallbackDefault() {
  return (
    <div>
      <h2>
        Oops! An error occurred. Please refresh the screen to try again.
      </h2>
    </div>
  );
}

export default function Plugin({
  children, className, style, ready, errorFallbackProp,
}) {
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });

  const finalStyle = useMemo(() => ({
    ...dimensions,
    ...style,
  }), [dimensions, style]);

  const errorFallback = errorFallbackProp || errorFallbackDefault;

  // Error logging function
  // Need to confirm: When an error is caught here, the logging will be sent to the child MFE's logging service
  const logErrorToService = (error, info) => {
    logError(error, { stack: info.componentStack });
  };

  useHostEvent(PLUGIN_RESIZE, ({ payload }) => {
    setDimensions({
      width: payload.width,
      height: payload.height,
    });
  });

  useEffect(() => {
    dispatchMountedEvent();

    return () => {
      dispatchUnmountedEvent();
    };
  }, []);

  useEffect(() => {
    if (ready) {
      dispatchReadyEvent();
    }
  }, [ready]);

  return (
    <div className={className} style={finalStyle}>
      <ErrorBoundary
        FallbackComponent={errorFallback}
        onError={logErrorToService}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
}

Plugin.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  errorFallbackProp: PropTypes.func,
  ready: PropTypes.bool,
  style: PropTypes.object, // eslint-disable-line
};

Plugin.defaultProps = {
  className: null,
  errorFallbackProp: null,
  style: {},
  ready: true,
};
