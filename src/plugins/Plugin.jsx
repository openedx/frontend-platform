'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from 'react-error-boundary';
import {
  dispatchMountedEvent, dispatchReadyEvent, dispatchUnmountedEvent, useHostEvent,
} from './data/hooks';
import { PLUGIN_RESIZE } from './data/constants';

function ErrorFallback(error) {
  // we can customize the UI as we want
  return (
    <div>
      <h2>
        Oops! An error occurred
        <br />
        <br />
        {error.message}
      </h2>
      {/* Additional custom error handling */}
    </div>
  );
}

export default function Plugin({
  children, className, style, ready,
}) {
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const handleResetError = () => {
    console.log('Error boundary reset');
    setErrorMessage('');
    // additional logic to perform code cleanup and state update actions
  };

  // Error logging function
  function logErrorToService(error) {
  // Use your preferred error logging service
    setErrorMessage(error);
    console.error('Caught an error:', errorMessage, error);
  }

  const finalStyle = useMemo(() => ({
    ...dimensions,
    ...style,
  }), [dimensions, style]);

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
        FallbackComponent={ErrorFallback}
        onError={() => logErrorToService()}
        onReset={handleResetError}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
}

Plugin.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  ready: PropTypes.bool,
  style: PropTypes.object, // eslint-disable-line
};

Plugin.defaultProps = {
  className: null,
  style: {},
  ready: true,
};
