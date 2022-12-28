/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Route, useMatch } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 * A react-router Route component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 */
export default function PageRoute(props) {
  const match = useMatch({
    path: props.path,
    caseSensitive: props.caseSensitive,
    end: props.end,
  });

  useEffect(() => {
    if (match) {
      sendPageEvent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(match)]);

  return (
    <Route {...props} />
  );
}
